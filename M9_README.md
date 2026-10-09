# Module 9 — Federated Learning and Global Model Management

## 1. Purpose and Scope
Module 9 (M9) is the project's **central** federated learning server/orchestrator. It is not peer-to-peer, and it does not use Flower: it is a custom protocol in `federation/`. It connects the hospital machines (through the local ML service) with the Consortium Admin (Node.js/React + Python API adapter). M9 manages federation jobs, round lifecycles, checksum-verified updates, weighted aggregation, and versioned Global Models.

> Updated 2026-10-09. Changes since the original write-up:
> - rounds are opened from the admin UI;
> - the server prepares each round's base model and hospitals download it;
> - round deadlines are validated;
> - early aggregation goes through a confirmation and progress dialog;
> - hospitals are notified when a round opens or closes.
>
> See sections 3, 5, 7, 14 and 22. Plain-language overview: `docs/README.md` section 6.

## 2. Architectural Overview
The architecture separates administrative orchestration from local training:
- **Consortium Admin (Central)**: Creates federation jobs/rounds, prescribes the canonical base model provenance, validates incoming hospital updates, executes aggregation, and holds the resulting Global Model artifact.
- **Hospital Client (Local)**: Verifies eligibility, obtains the prescribed canonical base model from its local model store, verifies its checksum, performs local training on private data, and submits a `FederationHandoff` payload.

## 3. Project-Specific Centralized Federation Aggregation Protocol
This project utilizes a **Project-Specific Centralized Federation Aggregation Protocol**. It does *not* implement a conventional, fully automated iterative FedAvg where the newly aggregated global model is automatically broadcasted back to all participating hospitals after each round.

**The Workflow:**
1. **Admin** creates a federation job.
2. **Admin** opens a round (deadline + minimum participants). M9 prepares the round's **canonical base model**:
   - round 1: one freshly initialised seed;
   - later rounds: the job's latest global model.
3. **Eligible hospitals** join the round. Each one downloads the base model from the server.
4. **Hospitals** train locally (M7) and produce checkpoint artifacts.
5. **M9 (Central)** receives and strictly validates these updates.
6. **M9** aggregates the validated parameter arrays.
7. A single **Global Model** is created centrally.
8. **Admin** evaluates the model.
9. **Admin** makes a promotion decision.

**Key Boundary:** The Global Model is centrally controlled. Hospitals receive a global model's weights only as the **base model of a later round they join** (authenticated download). There is no general push to all hospitals. Researchers have no access to global model weights.

## 4. Core M9 Data Model
All federation state tracking is persisted in the SQLite database (`federation_metadata.db`) using the following core entities:
- **`FederationJob`**: Defines the overarching task, architecture, class mapping, expected participants, and aggregation rules.
- **`FederationRound`**: A specific training iteration containing the canonical `base_model_id`, `base_model_version`, and `base_model_checksum`.
- **`FederationUpdate`**: An individual hospital's submission containing the artifact paths, metadata, and validation status.
- **`GlobalModelVersion`**: The finalized, aggregated model resulting from a successful round.

## 5. Federation Round Lifecycle
A round strictly follows this state machine:
`CREATED` → `OPEN` → `RECEIVING` → `READY_FOR_AGGREGATION` → `AGGREGATING` → `GLOBAL_MODEL_CREATED`

**Opening a round (adapter `create_round`)**:
- The deadline is required. It must parse as an ISO 8601 date-time with a timezone, lie in the future, and is stored in UTC. An empty deadline used to make every update count as late.
- `minimum_participants` defaults to the job's minimum.
- `expected_participants` may start empty. Hospitals are added when they join (`POST /federation/jobs/:job_id/rounds/:round_id/participate`).
- Unless a base model is passed explicitly, `federation/base_models.py` prepares it (section 7). The round opens immediately (`OPEN`).

**Admin Early-Close Mechanism (`force_close=True`)**:
- Permitted *only* through the authorized Admin aggregation path.
- Bypasses the future-deadline guard to force immediate evaluation of current submissions.
- **Does NOT bypass**: Minimum participant constraints, participant authorization, validation (architecture, schema, canonical provenance, duplicates), or standard expiration rules for submissions.
- Hospital submission paths are structurally isolated from this privilege.

## 6. Hospital Participation and Authorization
Hospital identity relies on authenticated JWT/session context, not on untrusted client inputs.
- The Node.js API obtains `req.user.hospital_id` directly from the authenticated session.
- Node.js explicitly passes this verified identity to the Python M9 backend.
- M9 records and validates participant authorization against its own `expected_participants` mechanism defined in the Federation Job.
- **Note**: The legacy M1-M3 MongoDB `TrainingRequest` records are out of scope for M9 and are not used for final M9 federation authorization.

## 7. Canonical Base-Model Provenance
M9 enforces canonical model provenance across all participating nodes so that each hospital begins local training from the same prescribed model parameters.

```text
Canonical Model
    ↓
FederationRound
    ↓
base_model_id / base_model_version / base_model_checksum
    ↓
Hospital obtains/verifies exact canonical artifact
    ↓
M7 Training
    ↓
FederationHandoff
```

**Checkpoint Identity vs. Canonical Base Identity:**
A hospital's resulting local checkpoint has its own unique identity (e.g., generated at training time), but its *provenance* must exactly match the round.
- **Hospital A**: `checkpoint_model_id = <Local_A>`, `base_model_id = CANONICAL_SEED_MOBILENET_V3`
- **Hospital B**: `checkpoint_model_id = <Local_B>`, `base_model_id = CANONICAL_SEED_MOBILENET_V3`

Before training, the hospital client recomputes the checksum of the downloaded base model and compares it with the round's prescribed checksum. Training **fails closed** if the artifact is missing, altered, or fails checksum validation.

**How the base model reaches the hospitals:**
1. `federation/base_models.py` `prepare_base_model()` builds the round's base model as a Module 6 checkpoint in `federation_artifacts/base_models/<id>/v1/`:
   - round 1: a new model `SEED_<job_id>` (draft, untrained);
   - later rounds: the job's latest global model's parameters, loaded into the architecture.
2. The checksum is computed exactly as Module 7 verifies it (SHA-256 over the loaded parameters). An existing base model is reused, not rebuilt.
3. Hospitals download it through `GET /api/v1/federation/rounds/:round_id/base-model/:file` (hospital_operator or admin). Only the two checkpoint files are served (`model.safetensors`, `metadata.json`).
4. The local ML service (`_ensure_base_model` in `hospital_client/local_api/server.py`) downloads it once into `trained/<architecture>/models/<id>/v1/`, using the operator's own token and the configured backend URL.
5. Module 7 then verifies the checksum before the first training step.

## 8. FederationHandoff Artifact Format
M9 separates hospital updates from the final M9 aggregated global models. However, both natively use the highly optimized `FederationHandoff` format.
- `handoff_parameters.npz`: Compressed NumPy format containing the raw model state tensors.
- `handoff_metadata.json`: Structural definitions, parameter shapes/dtypes, model metadata, and checksum/provenance information.

## 9. M9 Update Validation
When M9 receives an update, the validation engine strictly verifies:
- Authenticated participant identity is expected and authorized.
- Architecture, task, and schema match the job perfectly.
- **Canonical Provenance**: The hospital's submitted `base_model_checksum` and `base_model_id` precisely match the round's canonical requirements.
- **Artifact / Parameter Integrity**: M9 verifies the submitted artifact and its declared parameter integrity according to the `FederationHandoff` checksum metadata before accepting the update.

## 10. Aggregation Engine
The Aggregator merges `ACCEPTED` updates into a new global topology.

- **Floating-Point State**: Parameter tensors (e.g., weights/biases) undergo a weighted average based on `num_train_samples`.
- **Non-Floating State**: PyTorch structural parameters (like integer `num_batches_tracked`) are mathematically invalid for averaging. M9 implements an explicit policy: it copies the corresponding non-floating value from the first accepted participant.
- **NaN/Inf Protection**: The aggregation engine checks floating-point parameter arrays for `NaN` or `Inf` values and fails the aggregation rather than creating a Global Model from mathematically invalid parameters.

*Note*: Only updates reaching `ACCEPTED` are evaluated. Once utilized, their status transitions to `USED_IN_AGGREGATION`.

## 11. Global Model Creation and Persistence
Following successful aggregation, M9 instantiates a new `GlobalModelVersion` record and natively stores the resulting artifact as a `FederationHandoff` under `federation_artifacts/global_models/` directory.

## 12. Dynamic Participating-Hospital Provenance
M9 guarantees UI integrity by dynamically calculating historical provenance rather than permanently persisting stale columns.
```text
Global Model
    ↓
source round_id
    ↓
federation_updates (status == USED_IN_AGGREGATION)
    ↓
participant_id
    ↓
Admin API / React UI
```
The implementation dynamically derives participant lists for arbitrary participant counts (subject to resource constraints) straight from the database history, ensuring no hospitals are hardcoded in production logic.

## 13. SQLite Persistence Hardening
A critical persistence integrity fix was applied during M9 development.
- **Issue**: A migrated SQLite database had physical column drifting because `ALTER TABLE ADD COLUMN` appended metadata after timestamps, misaligning positional `INSERT ... VALUES (...)` queries.
- **Hardening**: Refactored the core `storage.py` schema handling to use **explicit named-column INSERTs** and **sqlite3.Row/named-field reads**.
- **Impact**: Completely isolates M9 persistence from future schema drift without requiring dangerous record deletion or weight modifications.

## 14. Admin API and React Integration
The central platform exposes secure Node.js controllers proxying requests to the Python `api_adapter.py`. 
- **Admin Roles**: Exclusively hold the authority to view global models, trigger rounds, execute aggregation, and force early close.
- **React UI**: Consumes dynamically derived provenance to accurately display the exact hospitals responsible for the specific model's aggregation.
- **Federation Jobs screen** (`frontend/src/views/FederatedTrainingView.jsx`):
  - create jobs;
  - **Open round N** (deadline, minimum participants; disabled while another round of the job is in progress);
  - the participant list with hospital names (admins get `hospital_names` with `GET /federation/jobs`).
- **Aggregate Round** (Federation Jobs and Admin Overview, `components/federation/AggregateRoundDialog.jsx`):
  1. A confirmation lists every participating hospital (name, id, update status) and warns when the deadline has not passed.
  2. Confirming sends `force_close: true`. Module 9 still requires the minimum accepted updates.
  3. The dialog shows the aggregation in progress, then the new global model, the round status and which hospitals were notified.
- **Hospital access:** `hospital_operator` may list jobs, join a round, submit its own update and download a round's base model. Everything else is admin-only.

## 15. Admin Evaluation Bridge to M6/M16
Global models are stored in M9 `FederationHandoff` format. To test global models, Admin evaluation executes a temporary structural bridge:
```text
M9 Global Artifact (.npz)
    ↓
FederationHandoff.load()
    ↓
PyTorch architecture reconstruction (set_parameters)
    ↓
Temporary M6 ModelStore (admin_m6_store/)
    ↓
model.pt + metadata.json
    ↓
M16 LocalInferenceEngine
```
This isolates the permanent M9 federation format from the evaluation mechanics of M16.

## 16. Global Model Lifecycle
Upon successful creation, an aggregated Global Model assumes the status:
`EVALUATION_PENDING`

**There is no automatic promotion to MAIN.**
The Global Model is created with `EVALUATION_PENDING`. The subsequent lifecycle is an administrative workflow rather than a single database state machine:

`EVALUATION_PENDING`
→ Admin evaluation
→ comparison with the current `MAIN` model within the same model track, if one exists
→ manual Admin promotion decision
→ Admin promotion decision → promoted to `MAIN` within the same model track, or retained as a non-MAIN candidate.

## 17. Model Track / Schema Identity
Global models are explicitly tracked by a strict schema identity. A track requires mathematical alignment of:
- Disease / Task
- Architecture
- Number of Classes
- Canonical Class Mapping (Schema Hash)

*Example*: `Malaria + MobileNetV3-Small + 2 Classes` operates entirely isolated from `Malaria + ResNet18 + 2 Classes` or `Malaria + MobileNetV3-Small + 5 Classes`.

## 18. End-to-End Verification
The architecture was verified utilizing a complete, canonical-provenance end-to-end pass (`run_final_e2e.py`).

**Verified Execution Record:**
- **Job**: `JOB_MAL_MNV3S_CANONICAL_E2E_3`
- **Round**: `ROUND_MAL_MNV3S_CANONICAL_E2E_R3`
- **Canonical Model**: `CANONICAL_SEED_MOBILENET_V3`
- **Participants**: `HOSP_868720`, `HOSP_123456`
- **Participant Result**: Both `ACCEPTED` and `USED_IN_AGGREGATION`
- **Global Model ID**: `GM-MALARIA-MOBILENET_V3_SMALL-V1` (Created successfully via `weighted_fedavg`)

*(Note: Hospital IDs are historical verification inputs, not hardcoded logic.)*

## 19. Security and Integrity Guarantees Actually Implemented
M9 strictly implements and verified the following:
- Participant authorization via central routing expected participants.
- Authenticated JWT identity routing.
- Canonical base-model provenance checking.
- Strict architecture/schema/task topological validation.
- SHA-256 parameter integrity verification and duplicate filtering.
- Safely handling/rejecting NaN/Inf in model tensors.
- SQLite named-column persistence hardening.
- Dynamic historical provenance calculation.

## 20. Known Scope / Future Modules
M9 acts as the foundational lifecycle and provenance pipeline. The following capabilities are outside the current M9 implementation and may be addressed by later security/privacy modules:
- Differential Privacy
- Enhanced secure communication / transport protections
- Byzantine / malicious update detection
- Advanced telemetry and monitoring
- Submitting updates between machines: today the hospital sends the server the folder path of its update, so hospital and server must share a machine
- Module 12's hook (`federation/security_hooks.py`) currently accepts every update
- More advanced privacy-preserving aggregation mechanisms such as FHE or SMPC, if adopted by the project

## 21. Key Files
The authoritative logic resides in:
- `federation/models.py`
- `federation/storage.py`
- `federation/validation.py`
- `federation/rounds.py`
- `federation/aggregation.py`
- `federation/api_adapter.py`
- `federation/evaluation.py`
- `federation/cli.py`
- `hospital_client/local_api/server.py`
- `hospital_client/federation/eligibility.py`
- `backend/src/routes/federationRoutes.js`
- `backend/src/controllers/federationController.js`
- `frontend/src/views/AdminFederationModelsView.jsx`
- `federation/base_models.py` (round base model, added 2026-10-09)
- `frontend/src/views/FederatedTrainingView.jsx`, `frontend/src/components/federation/AggregateRoundDialog.jsx`
- `backend/src/services/notificationService.js`, `backend/src/routes/notificationRoutes.js`, `backend/src/models/Notification.js`

## 22. Round Notifications (Module 18 integration)

The backend (`backend/src/services/notificationService.js`) stores one notification per active hospital in MongoDB (`Notification` model) and pushes it live to the hospital's Socket.io room `hospital_<hospital_id>`.

| Event | Who is notified | Type |
|---|---|---|
| Admin opens a round | every active hospital | `ROUND_OPEN` |
| Admin aggregates a round successfully | every active hospital that did **not** join that round | `ROUND_CLOSED` (do not train for this round; you will be notified when the next one opens) |

- Hospitals read them with `GET /api/v1/notifications` and mark them read with `POST /api/v1/notifications/read` (their own hospital only).
- A failed aggregation sends nothing.
- A notification failure never undoes the federation action.

## 23. Final M9 Status
**PASS** — The currently implemented Module 9 federation architecture has been verified against its defined architectural requirements, including hospital participation and authorization, canonical base-model provenance, update validation, weighted aggregation, Global Model creation, persistence, dynamic participant provenance, and Admin-side Global Model retrieval/evaluation integration.

M9 is the completed federation lifecycle and aggregation foundation for the current project scope. Privacy-enhancing mechanisms, enhanced secure-transport protections, Byzantine/malicious-update detection, and advanced telemetry remain outside the current M9 implementation and are reserved for subsequent modules.
