# Module 9 — Secure Federation Layer
## Complete Implementation Specification for Antigravity

> **Purpose:** This document is the authoritative implementation specification for Module 9 (M9) of the medical-imaging federated deep-learning platform.
>
> **Important:** Read the entire document before modifying code. Inspect the existing repository and existing M4, M5, M6, M7, M8, and M16 implementations first. Do not create duplicate functionality when an existing interface already provides it.

---

# 1. Executive Summary

Module 9 is the **Secure Federation Layer**.

Its job is to coordinate federated training between participating hospitals without receiving their medical images, validate hospital model submissions, manage federation rounds, aggregate compatible local model submissions, create immutable versioned **global model artifacts**, notify the Admin that a global model is ready for evaluation, and support Admin-side evaluation and global-model promotion.

The high-level pipeline is:

```text
Hospital
   |
   v
M4 Dataset Inspection
   |
   v
M5 Preprocessing / Split Validation
   |
   v
M8 Resource Evaluation
   |
   v
M7 Local Training
   |
   v
Federation Handoff
   |
   |  NO RAW MEDICAL IMAGES
   v
M9 Secure Federation
   |
   +--> Validate
   |
   +--> Manage Round
   |
   +--> Security/validation hooks
   |
   +--> Aggregate accepted updates
   |
   v
Global Model vN
   |
   v
Admin Notification
   |
   v
Admin clicks "Start Inference / Testing"
   |
   v
Architecture-specific inference
   |
   v
Admin-local disease-specific evaluation dataset
   |
   v
Accuracy / Precision / Recall / F1 / Confusion Matrix
   |
   v
Compare candidate against current MAIN
   |
   +--> Promote candidate to MAIN
   |
   +--> OR retain current MAIN
```

---

# 2. Non-Negotiable Project Terminology

Do not reinterpret these terms.

## 2.1 Model implementation

The project contains eight model implementations:

1. ResNet18
2. ResNet50
3. EfficientNet-B0
4. EfficientNet-B4
5. MobileNetV2
6. MobileNetV3-Small
7. MobileViT-XXS
8. ViT-B/16

These implementations are written and maintained by the platform.

Hospitals do **not** search for model code, write model code, or independently select arbitrary architectures.

M8 evaluates the hospital's hardware and determines a compatible architecture/configuration for local training.

---

## 2.2 Local model/update

A local model/update is the trained parameter state produced by a participating hospital after running the existing M4 → M5 → M8 → M7 pipeline.

The hospital's medical images remain local.

---

## 2.3 Federation handoff

The federation handoff is the package produced by M7 for M9.

The existing project already uses:

```text
handoff_parameters.npz
handoff_metadata.json
```

M9 must reuse this existing handoff rather than inventing a redundant second format unless an actual missing requirement makes an extension necessary.

---

## 2.4 Global model

In THIS PROJECT, "Global Model" means:

> A trained model artifact containing aggregated weights/parameters that can be loaded for inference on unseen patient data.

Examples:

```text
Cancer / ResNet50 / Global Model v1
Cancer / ResNet50 / Global Model v2
Malaria / ResNet18 / Global Model v4
```

A global model is therefore a **trained model artifact**, not the source-code implementation and not an empty/untrained architecture.

---

## 2.5 MAIN

`MAIN` means:

> The currently selected/approved global model version for a specific disease/task + architecture.

The newest model is NOT automatically MAIN.

Only one version may be MAIN for a given:

```text
disease/task + architecture
```

---

# 3. Critical Business Requirement: Do Not Distribute Trained Global Models to Hospitals

This is a hard requirement.

Hospitals contribute local learning/model updates.

The resulting trained global model remains centrally controlled by the platform/Admin.

M9 must NOT implement:

```text
M9
 |
 +----> trained proprietary global model ----> Hospital
```

Do not add an automatic global-model download to hospitals.

Do not require hospitals to receive the global model in order to evaluate it.

Admin-side evaluation happens locally on the Admin environment.

---

# 4. Important Federation/FedAvg Protocol Constraint

There is a technical distinction that must not be hidden.

Standard iterative FedAvg normally uses a common server-side parameter state for a round:

```text
Server/common parameters
        |
        v
Participating clients
        |
        v
Local training
        |
        v
Local parameters/updates
        |
        v
Server aggregation
        |
        v
Next aggregated parameters
```

This project has a hard requirement that the trained proprietary global model must not be distributed to hospitals.

Therefore:

- Do not silently send proprietary trained global weights to hospitals.
- Do not falsely claim that a custom aggregation protocol is standard iterative FedAvg.
- Do not silently invent a mathematically inconsistent protocol.
- The aggregation mechanism must be behind a clean abstraction.
- The exact common initialization/base-state semantics must be explicit in the implementation and metadata.
- If the current project uses a deterministic/common non-proprietary initialization or another baseline aggregation protocol, document it precisely.
- The aggregation interface must be replaceable so a future privacy-preserving iterative protocol can be introduced without rewriting the whole M9 system.

Before implementing aggregation, inspect M7 and determine exactly whether the current handoff contains:

1. full local parameters, or
2. parameter deltas/updates.

Do not assume.

---

# 5. Repository Inspection — Mandatory First Step

Before writing M9 code:

1. Inspect the complete repository structure.
2. Locate M4.
3. Locate M5.
4. Locate M6.
5. Locate M7.
6. Locate M8.
7. Locate M16.
8. Locate existing model storage.
9. Locate existing model metadata structures.
10. Locate existing model registry/versioning.
11. Locate existing `FederationHandoff`.
12. Locate `handoff_parameters.npz`.
13. Locate `handoff_metadata.json` generation.
14. Locate existing CLI conventions.
15. Locate existing backend/API conventions.
16. Locate existing database/storage conventions.
17. Locate existing notification/event mechanisms.
18. Locate existing tests and test fixtures.

Do not duplicate existing model-management or inference functionality.

If the repository already has a suitable package location for federation, use it rather than blindly creating a new top-level package.

---

# 6. M9 Architecture

M9 should be organized into clear responsibilities.

A suggested structure is:

```text
federation/
    __init__.py
    models.py
    storage.py
    jobs.py
    rounds.py
    intake.py
    validation.py
    aggregation.py
    global_models.py
    evaluation.py
    promotion.py
    events.py
    security_hooks.py
    cli.py
    README.md
```

The exact package location must follow the existing repository architecture.

Do not create files that duplicate existing project abstractions.

---

# 7. Core M9 Data Models

Implement or reuse the following concepts.

## 7.1 FederationJob

Represents a federation job/contract.

Minimum conceptual fields:

```text
federation_job_id
task/disease
task_type
architecture
num_classes
class_mapping
expected_participants
minimum_participants
deadline
training_requirements
aggregation_configuration
status
created_at
updated_at
```

Training requirements may include:

```text
epochs
batch_size
learning_rate
optimizer
precision
other required configuration
```

Only enforce fields that are explicitly defined as requirements by the federation job.

---

# 8. FederationParticipant

Represent a participant within a federation job.

Suggested fields:

```text
participant_id
federation_job_id
hospital/client identifier
authorization status
expected status
last submission
participation status
timestamps
```

Do not expose unnecessary medical information.

---

# 9. FederationRound

A federation job can have multiple rounds.

Suggested fields:

```text
round_id
federation_job_id
round_number
status
expected_participants
received_participants
accepted_participants
rejected_participants
quarantined_participants
minimum_participants
deadline
created_at
opened_at
closed_at
aggregation_started_at
aggregation_completed_at
```

---

# 10. FederationUpdate

Represents one hospital's submitted handoff.

Suggested fields:

```text
update_id
federation_job_id
round_id
participant_id
model_id
architecture
status
artifact_location
artifact_checksum
parameter_count
parameter_metadata
num_train_samples
training_configuration
validation_result
rejection_reason
received_at
validated_at
used_in_aggregation_at
```

Possible statuses:

```text
RECEIVED
VALIDATING
ACCEPTED
REJECTED
QUARANTINED
EXPIRED
USED_IN_AGGREGATION
NOT_USED
FAILED
```

---

# 11. GlobalModelVersion

Represents an actual trained aggregated global model artifact.

Suggested fields:

```text
global_model_id
disease/task
task_type
architecture
version
artifact_location
artifact_checksum
artifact_size
parameter_count
parameter_metadata
federation_job_id
round_id
source_update_ids
aggregation_method
aggregation_metadata
status
created_at
```

Statuses may include:

```text
CREATED
EVALUATION_PENDING
EVALUATED
MAIN
HISTORICAL
EVALUATED_NOT_PROMOTED
FAILED
```

Do not use only an `is_main` boolean as the authoritative state.

---

# 12. EvaluationRecord

Represents one Admin-side evaluation of one global model.

Suggested fields:

```text
evaluation_id
global_model_id
model_version
disease/task
architecture
evaluation_dataset_id
evaluation_dataset_version
sample_count
accuracy
precision
recall
f1
per_class_metrics
confusion_matrix
predictions_location
metrics_location
inference_configuration
status
started_at
completed_at
```

Do not store the actual Admin evaluation images in the database.

---

# 13. PromotionDecision

Represents why a candidate did or did not become MAIN.

Suggested fields:

```text
promotion_decision_id
candidate_global_model_id
previous_main_global_model_id
decision
promotion_policy_version
evaluation_record_id
reason
metric_summary
created_at
```

Possible decisions:

```text
PROMOTED
NOT_PROMOTED
REJECTED
```

---

# 14. Storage Architecture

Use a clear separation between metadata and artifacts.

## 14.1 Metadata database

Prefer SQLite if that matches the existing project architecture.

SQLite should be the authoritative store for:

- federation jobs
- rounds
- participants
- updates
- global-model metadata
- evaluation records
- promotion decisions

Do not maintain competing authoritative JSON databases.

JSON can be used for exported metadata/configuration where useful.

---

## 14.2 Artifact storage

Actual model/update payloads belong in filesystem/object-style artifact storage.

Examples:

```text
federation_artifacts/
    jobs/
        FED-CANCER-RESNET50-001/
            rounds/
                R01/
                    updates/
                        UPDATE-A.npz
                        UPDATE-B.npz
```

Global models:

```text
global_models/
    cancer/
        resnet50/
            v1/
                weights/
                metadata.json
                evaluation/
            v2/
                weights/
                metadata.json
                evaluation/
```

Use the existing project's storage conventions if they already exist.

---

# 15. Important Storage Security Rule

Do not use `.enc` as a fake security feature.

A file named:

```text
update_A.enc
```

is not automatically encrypted.

Only claim encryption if actual encryption is implemented.

M11 will later handle secure communication.

If M9 needs a secure artifact abstraction before M11 is complete, implement the abstraction honestly and document the current protection.

---

# 16. Federation Job Creation

M9 must allow creation of a job such as:

```text
FED-CANCER-RESNET50-001

Task:
Cancer classification

Architecture:
ResNet50

Classes:
2

Participants:
Hospital A
Hospital B
Hospital C

Minimum participants:
2

Required epochs:
10

Required batch size:
32

Optimizer:
Adam

Learning rate:
0.001

Deadline:
2026-10-10 18:00
```

Do not hard-code disease, architecture, classes, or participant names.

---

# 17. Disease/Task + Architecture Isolation

Every federation job and global-model track must be isolated by:

```text
disease/task + architecture
```

Examples:

```text
Malaria + ResNet18
Malaria + ResNet50
Malaria + EfficientNet-B0

Cancer + ResNet18
Cancer + ResNet50
Cancer + EfficientNet-B0
```

Never aggregate:

```text
Cancer + ResNet50
```

with:

```text
Malaria + ResNet50
```

Never aggregate:

```text
ResNet18
```

with:

```text
ResNet50
```

---

# 18. M7 Federation Handoff

Reuse the existing M7 handoff.

Expected input:

```text
handoff_parameters.npz
handoff_metadata.json
```

Do not require:

- raw medical images
- M4 dataset profile
- M5 processed dataset
- full M7 output folder
- training plots
- all checkpoints
- Python source code

Only the selected federation handoff is sent to M9.

M7 already performs best-checkpoint selection; M9 should consume the selected federation handoff rather than receiving every local checkpoint.

---

# 19. Federation-Specific Metadata

If not already present, extend the handoff metadata in a backward-compatible way with fields such as:

```text
federation_job_id
round_id
client_id / participant_id
submission_id
aggregation_protocol
common_initialization_id
privacy configuration reference
```

Do not create a giant redundant `federation_manifest.json` if the existing handoff metadata can be extended.

---

# 20. Intake Pipeline

The intake pipeline must be:

```text
Receive handoff
    |
    v
Authenticate/identify participant
    |
    v
Check job
    |
    v
Check round
    |
    v
Check task/disease
    |
    v
Check architecture
    |
    v
Check class configuration
    |
    v
Check parameter compatibility
    |
    v
Check checksum/integrity
    |
    v
Check training contract
    |
    v
Duplicate-submission check
    |
    v
M12 security hook
    |
    v
ACCEPT / REJECT / QUARANTINE
```

---

# 21. Validation Rules

Validate at minimum:

### Identity

- federation job ID
- participant ID
- round ID
- authorization

### Task

- disease/task
- task type
- number of classes
- class mapping

### Model

- architecture
- model ID where required
- parameter count
- parameter structure/order
- parameter shapes
- compatible dtypes

### Integrity

- checksum
- file readability
- parameter loading
- no corruption

### Training

- training completion status
- required training configuration
- required epochs if enforced
- required batch size if enforced
- optimizer if enforced
- learning rate if enforced
- precision if enforced

### Security/state

- duplicate submission
- expired round
- wrong job
- wrong participant
- wrong round
- unauthorized participant

---

# 22. Parameter Compatibility

Do not simply compare:

```text
parameter_count == parameter_count
```

Validate the complete parameter structure required by the aggregation protocol.

At minimum:

```text
parameter count
parameter ordering/naming contract
shape of each parameter
dtype compatibility
required parameter presence
```

The implementation must use a deterministic parameter ordering.

Do not rely on arbitrary dictionary iteration if the existing M7/M6 interface already defines an ordered parameter list.

---

# 23. Non-Float Parameters

The existing project can contain floating-point and integer arrays.

Do NOT blindly average all arrays.

Before aggregation, explicitly classify parameters/state as:

```text
averageable floating-point trainable parameter
non-averageable integer/state/buffer
unsupported
```

The aggregation policy for non-floating state must be explicit.

Do not arbitrarily invent:

- majority vote
- "keep current main"
- rounding
- casting

without checking the actual model architecture and aggregation semantics.

Inspect all eight model implementations and determine what non-floating state exists.

For every supported architecture, document how that state is handled.

---

# 24. Aggregation Input Semantics

Before implementing aggregation, explicitly answer from the actual repository:

> Does M7 handoff contain full local parameters or parameter deltas?

Do not guess.

If it contains full parameters:

```text
Hospital A → W_A
Hospital B → W_B
Hospital C → W_C
```

If it contains deltas:

```text
Hospital A → ΔA
Hospital B → ΔB
Hospital C → ΔC
```

The aggregation algorithm must match the representation.

---

# 25. Aggregation Interface

Create a clean abstraction such as:

```text
AggregationStrategy
    aggregate(...)
```

Possible future implementations:

```text
FedAvg
WeightedParameterAverage
FuturePrivacyPreservingAggregation
```

Do not hard-code aggregation directly into round management.

This makes future M10/M12/privacy protocol changes safer.

---

# 26. Sample-Size Weighting

If the baseline protocol uses weighted FedAvg-style aggregation, the usual weighting basis is each participating hospital's number of local training samples.

For accepted participants:

```text
n_i = number of training samples at client i

N = sum(n_i)

weight_i = n_i / N
```

Then for an averageable parameter tensor:

```text
aggregated_parameter
=
sum(weight_i * parameter_i)
```

Only implement this if the selected aggregation protocol actually specifies this behavior.

Record the weighting rule in aggregation metadata.

---

# 27. Aggregation Validation

Before aggregation:

- all updates must be accepted
- all belong to same job
- all belong to same round
- all belong to same disease/task
- all use compatible architecture
- all have compatible parameter structures
- all required tensors exist
- no tensor has NaN/Inf
- participant duplication is impossible
- minimum participant requirement is satisfied

After aggregation:

- parameter count is correct
- shapes are correct
- dtypes are valid
- no NaN/Inf
- model can be instantiated
- aggregated parameters can be loaded
- artifact checksum can be calculated
- artifact can be reopened/read

---

# 28. Federation Round State Machine

Use explicit states.

Suggested normal lifecycle:

```text
CREATED
   |
   v
OPEN
   |
   v
RECEIVING
   |
   v
READY_FOR_AGGREGATION
   |
   v
AGGREGATING
   |
   v
GLOBAL_MODEL_CREATED
   |
   v
EVALUATION_PENDING
   |
   v
COMPLETED
```

Failure states:

```text
FAILED
TIMED_OUT
INSUFFICIENT_PARTICIPANTS
CANCELLED
```

Do not represent the entire state machine only with booleans.

---

# 29. Participant Deadline Behavior

Example:

```text
Expected:
A
B
C

Minimum:
2
```

### A only

```text
A = accepted
B = missing
C = missing
```

At deadline:

```text
1 < 2
```

Result:

```text
INSUFFICIENT_PARTICIPANTS
```

No aggregation.

### A + B

```text
A = accepted
B = accepted
C = missing
```

At deadline:

```text
2 >= 2
```

Round may aggregate according to the configured policy.

### A + B + C

All accepted.

Aggregate.

Do not silently reuse a missing/expired participant's old update.

Every update belongs to exactly one federation job and round.

---

# 30. Update Artifact Lifecycle

Use explicit statuses:

```text
RECEIVED
VALIDATING
ACCEPTED
REJECTED
QUARANTINED
EXPIRED
USED_IN_AGGREGATION
NOT_USED
FAILED
```

Do not immediately delete rejected updates.

Keep enough metadata for audit/debugging.

---

# 31. M12 Security Hook

M12 will later implement Byzantine/malicious-update detection.

M9 must have a clean hook:

```text
basic validation
    |
    v
security/Byzantine hook
    |
    +--> ACCEPT
    +--> FLAG
    +--> REJECT
    +--> QUARANTINE
    |
    v
aggregation
```

Do not implement fake malicious-update detection in baseline M9.

Do not invent a fake anomaly score.

The hook must be real and callable by a future M12 implementation.

---

# 32. Secure Aggregation vs Detection

Document this carefully.

If a future secure-aggregation mechanism prevents the server from seeing individual raw updates, the server cannot simultaneously inspect those raw updates directly for Byzantine detection.

Therefore M9 must keep these responsibilities abstract enough that M11/M12 can later implement a compatible protocol.

Do not claim both:

```text
server cannot see individual updates
```

and:

```text
server directly examines every raw individual update
```

unless the actual protocol supports both.

---

# 33. Global Model Creation

After successful aggregation:

```text
accepted updates
       |
       v
aggregation
       |
       v
aggregated parameters
       |
       v
Global Model vN
```

The resulting model must be an actual loadable trained model artifact.

Do not create placeholder/random weights.

The model must correspond to the correct architecture.

---

# 34. Global Model Versioning

Versions are immutable.

Example:

```text
Cancer / ResNet50

v1
v2
v3
```

Never overwrite v1 when creating v2.

Each version gets:

- unique version
- weights artifact
- metadata
- checksum
- source federation job
- source round
- source update IDs
- aggregation metadata
- creation time
- status

---

# 35. MAIN State

Only one MAIN per:

```text
disease/task + architecture
```

Example:

```text
Cancer + ResNet50

v1 = HISTORICAL
v2 = MAIN
v3 = EVALUATED_NOT_PROMOTED
```

Do not delete v1.

Do not automatically promote v3 merely because it is newest.

---

# 36. Admin Notification

When M9 successfully creates a global model:

```text
Global Model v2 created
        |
        v
status = EVALUATION_PENDING
        |
        v
Admin notification/event
```

Example notification:

> Cancer / ResNet50 Global Model v2 has been accepted by the Secure Federation Layer and is ready for evaluation.

The Admin UI should expose:

```text
[ Start Inference / Testing ]
```

Do not automatically run evaluation unless the existing UI/business requirement explicitly says so.

---

# 37. Admin Evaluation Dataset

Evaluation is Admin-side.

The dataset is:

- local to the Admin device
- not stored in the database
- not sent to hospitals
- separate for each disease/task
- labeled
- versioned
- preferably frozen for model comparison
- approximately 1,000–1,500 images per disease where practical

Example:

```text
Admin local:

evaluation_datasets/
    malaria/
    cancer/
    pneumonia/
```

Do not hard-code exactly 1,000 or 1,500.

Make the target configurable.

---

# 38. Evaluation Dataset Versioning

Example:

```text
Cancer evaluation dataset:
EVAL-CANCER-001
version 1
```

Then:

```text
Global v1 → EVAL-CANCER-001 v1
Global v2 → EVAL-CANCER-001 v1
Global v3 → EVAL-CANCER-001 v1
```

Use the same frozen dataset version for fair comparison.

If the dataset changes substantially:

```text
EVAL-CANCER-001 v2
```

must be created.

Never silently evaluate v1 and v2 on different datasets and compare their metrics as if the comparison were controlled.

---

# 39. Admin Evaluation Trigger

Admin sees:

```text
Global Model v2
Disease: Cancer
Architecture: ResNet50
Status: EVALUATION_PENDING

[ Start Inference / Testing ]
```

When clicked:

1. Load model metadata.
2. Read validated architecture.
3. Select matching inference implementation.
4. Load global model weights.
5. Load Admin-local evaluation dataset.
6. Run inference.
7. Calculate metrics.
8. Save evaluation outputs.
9. Create EvaluationRecord.
10. Make candidate eligible for promotion decision.

---

# 40. Architecture-Specific Inference

This is mandatory.

Examples:

```text
ResNet50 Global v2
        |
        v
ResNet50 inference implementation
```

```text
EfficientNet-B0 Global v3
        |
        v
EfficientNet-B0 inference implementation
```

Never use the wrong architecture.

Do not infer architecture from an arbitrary filename.

Use validated model metadata.

Reuse M16's existing architecture-specific inference engine where appropriate.

Do not create a second independent inference framework if M16 can be extended to support Admin-side batch evaluation.

---

# 41. Batch Evaluation

The Admin evaluation dataset can contain approximately 1,000–1,500 images.

Do not design evaluation as a fragile one-image-at-a-time workflow if the existing inference engine can support efficient batch evaluation.

Prefer a controlled batch evaluation path that reuses M16's model loading/preprocessing/inference behavior.

Preserve the same preprocessing contract expected by the model.

---

# 42. Evaluation Metrics

At minimum calculate:

- accuracy
- precision
- recall
- F1 score
- per-class metrics
- confusion matrix

Store:

```text
model_id
model_version
disease/task
architecture
evaluation_dataset_id
evaluation_dataset_version
sample_count
metrics
evaluation timestamp
inference configuration
status
```

These are model evaluation metrics.

Do not describe them as clinical validation or diagnosis.

---

# 43. Evaluation Output Storage

Store evaluation results alongside the global model.

Conceptually:

```text
global_models/
    cancer/
        resnet50/
            v1/
                weights/
                metadata.json
                evaluation/
                    metrics.json
                    predictions
                    confusion_matrix
            v2/
                weights/
                metadata.json
                evaluation/
                    metrics.json
                    predictions
                    confusion_matrix
```

Use the project's existing storage conventions if available.

---

# 44. Promotion Workflow

The promotion process is:

```text
Candidate Global Model v2
        |
        v
Admin evaluation
        |
        v
Evaluation metrics
        |
        v
Compare with current MAIN
        |
        v
Configurable promotion policy
        |
        +------------------+
        |                  |
        v                  v
PROMOTE              NOT PROMOTE
        |                  |
        v                  v
v2 = MAIN            current MAIN remains
```

Do not make "newest model = MAIN."

---

# 45. Promotion Policy

The exact medical/model-quality promotion policy is intentionally configurable.

Do not permanently hard-code:

```text
highest accuracy wins
```

Do not hard-code arbitrary metric weights without a configuration layer.

The policy must support future refinement.

Possible inputs:

- accuracy
- precision
- recall
- F1
- per-class metrics
- minimum thresholds
- allowed regression
- weighted score
- critical metrics

The initial policy must be deterministic and documented.

Do not claim that any threshold is clinically validated.

---

# 46. Same Evaluation Dataset for Version Comparison

If comparing:

```text
Global v1
vs
Global v2
```

both must use:

```text
same disease
same task
same architecture
same evaluation dataset ID
same evaluation dataset version
same evaluation procedure
```

This is mandatory for a controlled comparison.

---

# 47. Example: Full Federation Workflow

Use this as an end-to-end reference implementation scenario.

## Step 1 — Admin creates job

```text
FED-CANCER-RESNET50-R01

Disease:
Cancer

Architecture:
ResNet50

Classes:
2

Participants:
Hospital A
Hospital B
Hospital C

Minimum:
2

Epochs:
10

Batch:
32

Optimizer:
Adam
```

## Step 2 — Hospitals run local pipeline

Each hospital:

```text
M4
 ↓
M5
 ↓
M8
 ↓
M7
```

All use the compatible ResNet50 implementation.

Their medical images remain local.

## Step 3 — M7 creates handoffs

Each hospital submits:

```text
handoff_parameters.npz
handoff_metadata.json
```

## Step 4 — M9 validates

A:

```text
ACCEPTED
```

B:

```text
ACCEPTED
```

C:

```text
ACCEPTED
```

## Step 5 — M9 aggregates

Accepted compatible updates are aggregated using the configured aggregation strategy.

## Step 6 — M9 creates Global Model v1

```text
Cancer / ResNet50 / v1
status = EVALUATION_PENDING
```

## Step 7 — Admin notification

Admin receives:

```text
Cancer ResNet50 Global Model v1
is ready for evaluation.

[Start Inference / Testing]
```

## Step 8 — Admin starts evaluation

The system:

```text
architecture = ResNet50
        |
        v
ResNet50 inference
        |
        v
Admin Cancer Evaluation Dataset
```

## Step 9 — Metrics

Example:

```text
accuracy  = 92.4%
precision = 91.8%
recall    = 93.1%
f1        = 92.4%
```

Store them alongside v1.

## Step 10 — v1 becomes MAIN if it satisfies the initial promotion policy

```text
v1 = MAIN
```

## Step 11 — Next round

Another federation round produces:

```text
Cancer / ResNet50 / v2
```

Admin evaluates v2 using the SAME evaluation dataset version.

Suppose:

```text
v1:
accuracy  = 92.4%
precision = 91.8%
recall    = 93.1%
f1        = 92.4%

v2:
accuracy  = 94.1%
precision = 93.7%
recall    = 94.6%
f1        = 94.1%
```

Promotion policy determines v2 is better.

Result:

```text
v1 = HISTORICAL
v2 = MAIN
```

## Step 12 — v3 is worse

Suppose v3 evaluates lower than v2.

Result:

```text
v2 = MAIN
v3 = EVALUATED_NOT_PROMOTED
```

v3 is retained for history/audit.

---

# 48. M9 + M10 Integration Point

M10 is Differential Privacy.

M10 happens primarily during local training.

M9 should be able to record privacy configuration metadata.

Potential metadata:

```text
privacy:
    enabled
    mechanism
    clipping configuration
    noise configuration
    privacy accounting metadata
```

Do not implement fake DP in M9.

Do not claim DP protection until M10 actually implements it.

---

# 49. M9 + M11 Integration Point

M11 is Secure Communication.

M9 should expose a clean communication/API boundary:

```text
Hospital
   |
   v
M11 secure transport
   |
   v
M9 intake API
```

Do not put TLS logic inside aggregation code.

Do not claim communication is encrypted until actual secure communication is implemented.

---

# 50. M9 + M12 Integration Point

M12 is Byzantine/Malicious Update Detection.

M9 must provide:

```text
receive
  ↓
basic validation
  ↓
M12 detection
  ↓
accept / flag / reject / quarantine
  ↓
aggregation
```

Do not implement fake M12 logic now.

---

# 51. M9 + M13 Integration Point

M13 is Monitoring and Telemetry.

M9 must emit real structured events such as:

```text
FEDERATION_JOB_CREATED
ROUND_CREATED
ROUND_OPENED
UPDATE_RECEIVED
UPDATE_VALIDATED
UPDATE_ACCEPTED
UPDATE_REJECTED
UPDATE_QUARANTINED
PARTICIPANT_TIMEOUT
ROUND_READY
AGGREGATION_STARTED
AGGREGATION_COMPLETED
AGGREGATION_FAILED
GLOBAL_MODEL_CREATED
EVALUATION_READY
EVALUATION_COMPLETED
PROMOTION_DECIDED
```

Do not generate fake telemetry.

M13 can later consume these events.

---

# 52. Security Requirements

M9 must:

- identify/authenticate participants through the existing authentication architecture
- prevent unauthorized submissions
- prevent cross-job submissions
- prevent cross-round submissions
- validate integrity/checksums
- prevent duplicate submissions
- protect artifacts using the project's storage abstraction
- keep secrets out of source code
- provide M11 integration points
- provide M12 integration points

Do not invent security features that do not exist.

---

# 53. CLI/API

Inspect existing CLI/API conventions before implementing.

M9 should support operations equivalent to:

```text
create federation job
list federation jobs
inspect federation job
open/start round
submit federation handoff
inspect round
list updates
inspect update
finalize/check round
aggregate round
list global models
inspect global model
show current MAIN
trigger evaluation
inspect evaluation
promote candidate
```

Use existing project command conventions.

Do not create duplicate interfaces.

---

# 54. Tests — Unit

Test:

### Job

- creation
- invalid job configuration
- participant registration

### Round

- state transitions
- invalid transitions
- deadline
- minimum participant logic

### Intake

- valid handoff
- invalid job
- invalid round
- invalid participant
- wrong architecture
- wrong task
- wrong classes
- wrong class mapping
- wrong parameter shape
- wrong parameter count
- wrong dtype
- checksum mismatch
- corrupted file
- duplicate submission
- incomplete handoff
- incomplete training status

### Aggregation

- compatible updates
- sample-size weighting if configured
- parameter ordering
- non-float policy
- NaN/Inf rejection
- aggregation failure
- output loadability

### Global model

- version creation
- immutable versions
- checksum
- metadata
- source round/update tracking

### Evaluation

- correct dataset
- wrong dataset
- wrong architecture
- metric calculation
- result persistence

### Promotion

- candidate better
- candidate worse
- candidate equal
- minimum thresholds
- only one MAIN
- old MAIN retained
- historical model retained

---

# 55. Tests — Integration

At minimum implement:

## Scenario A — Successful 3-hospital round

```text
A + B + C
   ↓
M9
   ↓
aggregation
   ↓
Global v1
   ↓
Admin notification
   ↓
evaluation
   ↓
metrics
   ↓
promotion
```

## Scenario B — Two of three participants

```text
A + B
C missing
minimum = 2

round completes
```

## Scenario C — Insufficient participants

```text
A only
minimum = 2

round fails/incomplete
```

## Scenario D — Wrong architecture

```text
Job = ResNet50
Hospital submits ResNet18

reject
```

## Scenario E — Wrong disease

```text
Job = Cancer
Hospital submits Malaria update

reject
```

## Scenario F — Malicious/outlier hook

Verify the M12 hook is called and its result can prevent aggregation.

## Scenario G — Global v2 better than v1

```text
v2 promoted
v1 historical
```

## Scenario H — Global v2 worse than v1

```text
v1 remains MAIN
v2 evaluated_not_promoted
```

## Scenario I — Architecture-specific evaluation

```text
ResNet50 global model
    ↓
ResNet50 inference implementation
```

and verify an incompatible inference implementation is never selected.

---

# 56. End-to-End Acceptance Test

Create a realistic end-to-end test:

```text
Create Cancer + ResNet50 job
        |
        v
Register A/B/C
        |
        v
Create round
        |
        v
Submit three valid M7-style handoffs
        |
        v
Validate
        |
        v
Aggregate
        |
        v
Create Global Model v1
        |
        v
Emit Admin evaluation-ready event
        |
        v
Admin triggers evaluation
        |
        v
Use Cancer evaluation dataset v1
        |
        v
Use ResNet50 inference
        |
        v
Calculate metrics
        |
        v
Store evaluation
        |
        v
Promote v1 if policy permits
        |
        v
Create second round
        |
        v
Create Global Model v2
        |
        v
Evaluate v2 on SAME dataset v1
        |
        v
Compare v1/v2
        |
        v
Promote or retain MAIN
```

---

# 57. No Fake Implementations

Never:

- fake model weights
- fake aggregation
- fake metrics
- fake encryption
- fake DP
- fake Byzantine detection
- fake telemetry
- fake participant updates
- claim standard FedAvg if the implemented protocol differs
- send trained global weights to hospitals
- generate random values just to satisfy tests

Tests should use real small deterministic model parameters or real project model implementations where appropriate.

---

# 58. Backward Compatibility

Do not break:

- M4
- M5
- M6
- M7
- M8
- M16

If M7's handoff needs a small extension:

- make it backward-compatible where possible
- update tests
- document the change

Do not rewrite the M7 training engine inside M9.

Do not duplicate M6 model-management logic.

Do not duplicate M16 inference logic.

---

# 59. M16 Reuse

M16 already provides architecture-specific local inference.

Reuse M16's model-loading and inference behavior for Admin-side evaluation where practical.

If M16 currently supports only one-image inference and batch evaluation is needed, add a small backward-compatible batch-evaluation interface rather than creating a completely separate inference framework.

---

# 60. M8 Reuse

M8 remains responsible for resource evaluation.

M9 must not duplicate hardware profiling.

M9 may validate submitted training metadata against the federation job's training requirements.

---

# 61. M7 Reuse

M7 remains responsible for local training.

M9 consumes M7's federation handoff.

M9 does not retrain hospital models.

---

# 62. Documentation Requirements

Create/update M9 documentation covering:

1. M9 purpose
2. Architecture
3. Federation job
4. Federation round
5. Participant lifecycle
6. Federation handoff
7. Validation
8. Storage
9. Aggregation
10. Global model lifecycle
11. Versioning
12. MAIN
13. Admin notification
14. Admin evaluation
15. Evaluation dataset
16. Evaluation metrics
17. Promotion policy
18. Security boundaries
19. M10 integration
20. M11 integration
21. M12 integration
22. M13 integration
23. Protocol semantics
24. Known limitations

Explicitly distinguish:

```text
Model Implementation
Local Model/Update
Federation Handoff
Global Model
MAIN Model
```

---

# 63. Implementation Order

Follow this order.

## Phase 1 — Repository inspection

No coding until existing interfaces are understood.

## Phase 2 — Data models

Implement/reuse:

```text
FederationJob
FederationParticipant
FederationRound
FederationUpdate
GlobalModelVersion
EvaluationRecord
PromotionDecision
```

## Phase 3 — Storage

Implement:

- SQLite metadata/state
- artifact storage abstraction
- immutable global model storage

## Phase 4 — Job/round management

Implement:

- create job
- participant management
- create/open/close round
- minimum participants
- deadline
- state machine

## Phase 5 — Intake/validation

Integrate M7 handoff.

## Phase 6 — Aggregation

Implement the explicitly documented aggregation protocol.

Do not proceed until full-parameters-vs-deltas and common-initialization semantics are explicitly resolved from the repository/protocol.

## Phase 7 — Global model creation

Create immutable versioned artifacts.

## Phase 8 — Admin notification

Emit evaluation-ready event.

## Phase 9 — Admin evaluation

Integrate M16 and Admin-local evaluation datasets.

## Phase 10 — Promotion

Implement configurable promotion policy.

## Phase 11 — Future-module hooks

M10/M11/M12/M13 extension points.

## Phase 12 — CLI/API

Integrate with existing interfaces.

## Phase 13 — Tests

Unit + integration + end-to-end.

## Phase 14 — Full regression

Run the entire project test suite.

---

# 64. Final Acceptance Criteria

M9 is complete only when all applicable items below are satisfied.

## Federation

- [ ] Federation jobs can be created.
- [ ] Disease/task is recorded.
- [ ] Architecture is recorded.
- [ ] Participants are recorded.
- [ ] Minimum participants are supported.
- [ ] Deadlines are supported.
- [ ] Federation rounds have explicit states.
- [ ] Missing participants are handled correctly.
- [ ] Old updates are not silently reused.

## Intake

- [ ] Existing M7 handoff is accepted.
- [ ] Handoff metadata is validated.
- [ ] Wrong disease/task is rejected.
- [ ] Wrong architecture is rejected.
- [ ] Wrong class mapping is rejected.
- [ ] Wrong parameter structure is rejected.
- [ ] Wrong parameter shapes are rejected.
- [ ] Wrong parameter count is rejected.
- [ ] Checksum mismatch is rejected.
- [ ] Duplicate submissions are rejected.
- [ ] Invalid training status is rejected.

## Aggregation

- [ ] Aggregation protocol is explicitly documented.
- [ ] Full parameters vs deltas are explicitly defined.
- [ ] Common initialization semantics are explicitly defined.
- [ ] Compatible updates are aggregated.
- [ ] Sample-size weighting is used if specified by the protocol.
- [ ] Non-float state has an explicit policy.
- [ ] NaN/Inf values are rejected.
- [ ] Aggregated model is loadable.
- [ ] No fake aggregation exists.

## Global Models

- [ ] Every successful aggregation creates a new version.
- [ ] Versions are immutable.
- [ ] Old versions are retained.
- [ ] Checksums are recorded.
- [ ] Source job/round/update IDs are recorded.
- [ ] Global model is not automatically distributed to hospitals.

## Admin Evaluation

- [ ] Admin receives evaluation-ready notification.
- [ ] Admin can click Start Inference/Testing.
- [ ] Evaluation dataset is Admin-local.
- [ ] Dataset is separate per disease/task.
- [ ] Dataset is approximately 1,000–1,500 images where practical.
- [ ] Dataset is not stored in the database.
- [ ] Dataset is versioned/frozen.
- [ ] Same dataset version is used for version comparison.
- [ ] Correct architecture-specific inference implementation is selected.
- [ ] Accuracy is calculated.
- [ ] Precision is calculated.
- [ ] Recall is calculated.
- [ ] F1 is calculated.
- [ ] Confusion matrix is calculated.
- [ ] Evaluation output is stored beside the corresponding global model.

## MAIN

- [ ] Newest model is not automatically MAIN.
- [ ] Candidate is compared with current MAIN.
- [ ] Promotion policy is configurable.
- [ ] Better candidate can become MAIN.
- [ ] Worse candidate does not replace MAIN.
- [ ] Historical versions remain available.
- [ ] Only one MAIN exists per disease/task + architecture.
- [ ] Promotion decision is recorded.

## Future modules

- [ ] M10 DP metadata/extension point exists.
- [ ] M11 secure communication boundary exists.
- [ ] M12 malicious-update hook exists.
- [ ] M13 telemetry events exist.

## Testing

- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] Three-hospital federation test passes.
- [ ] Failure cases pass.
- [ ] Admin evaluation test passes.
- [ ] Promotion test passes.
- [ ] Full existing project test suite passes.

---

# 65. Required Final Implementation Report

After implementation, provide:

1. Files created
2. Files modified
3. Existing interfaces reused
4. New APIs/CLI commands
5. Database schema
6. Artifact-storage structure
7. Federation state machine
8. Validation rules
9. Aggregation protocol actually implemented
10. Full-parameters vs delta decision
11. Common initialization decision
12. Global-model versioning
13. Admin evaluation workflow
14. Evaluation dataset handling
15. MAIN promotion policy
16. M10/M11/M12/M13 extension points
17. Tests added
18. Test results
19. Full-project regression result
20. Known limitations
21. Any decisions intentionally deferred

Do not claim a feature is implemented unless it actually works and is tested.

---

# 66. Most Important Rules — Final Checklist

Before considering M9 complete, verify these rules:

```text
1. Medical images stay at hospitals.

2. Hospitals send only the federation handoff/update.

3. Hospitals do not receive the trained proprietary global model.

4. M9 validates updates before aggregation.

5. Different diseases/tasks never mix.

6. Incompatible architectures never mix.

7. Federation rounds have explicit lifecycle/deadline/minimum-participant behavior.

8. M9 does not blindly average arbitrary tensors.

9. The aggregation protocol is mathematically and technically documented.

10. Do not call a protocol standard iterative FedAvg unless it actually satisfies
    the necessary semantics.

11. Global models are real trained artifacts, not placeholders.

12. Global versions are immutable.

13. Newest global version is not automatically MAIN.

14. Admin performs global-model evaluation locally.

15. Evaluation datasets are disease/task-specific.

16. Evaluation datasets remain on Admin's local device.

17. Evaluation datasets are approximately 1,000–1,500 labeled images per disease
    where practical.

18. Evaluation dataset versions remain fixed for fair model comparison.

19. The correct architecture-specific inference implementation is used.

20. Evaluation calculates accuracy, precision, recall, F1 and confusion matrix
    where applicable.

21. Evaluation outputs are stored beside the corresponding global model.

22. Candidate global model is compared with current MAIN.

23. MAIN is promoted according to a configurable policy.

24. If candidate is worse, current MAIN remains MAIN.

25. M10/M11/M12/M13 are integrated through clean extension points,
    not fake implementations.

26. No fake metrics, fake encryption, fake DP, fake telemetry, or fake aggregation.

27. Existing M4–M8 and M16 functionality must continue to work.

28. Full project regression tests must pass.
```

---

# 67. Expected End State

The final M9 system should support this complete workflow:

```text
                    HOSPITALS
                        |
          +-------------+-------------+
          |             |             |
      Hospital A    Hospital B    Hospital C
          |             |             |
          v             v             v
         M4            M4            M4
          v             v             v
         M5            M5            M5
          v             v             v
         M8            M8            M8
          v             v             v
         M7            M7            M7
          |             |             |
          +-------------+-------------+
                        |
                 Federation Handoff
                        |
                        v
              +-------------------+
              |        M9         |
              | Secure Federation |
              +-------------------+
                        |
                Validate Updates
                        |
                Manage Round
                        |
               Security Hook(s)
                        |
                   Aggregate
                        |
                        v
              Global Model vN
                        |
                        v
                 Admin Notification
                        |
                        v
             [Start Inference/Testing]
                        |
                        v
             Correct architecture
                inference engine
                        |
                        v
              Admin-local evaluation
                    dataset
                 ~1000–1500
                        |
                        v
             Accuracy / Precision /
               Recall / F1 / etc.
                        |
                        v
              Compare with MAIN
                        |
                +-------+-------+
                |               |
                v               v
             PROMOTE        NOT PROMOTE
                |               |
                v               v
             MAIN          Old MAIN stays
```

This is the target architecture for M9.

**Do not simplify away the Admin evaluation/promotion stage, and do not distribute the trained global model to hospitals merely because a conventional federated-learning implementation might normally do so.**
'''

path = Path("/mnt/data/M9_Secure_Federation_Implementation_Plan.md")
path.write_text(md, encoding="utf-8")
print(path)
Encountered exception: <class 'RuntimeError'>.
import pypandoc

md = """# Module 9 — Secure Federation Layer

## Authoritative Implementation Specification

This document is the implementation specification for Module 9 (M9) of the medical-imaging federated deep-learning platform.

**Important:** Inspect the existing repository and Modules 4, 5, 6, 7, 8, and 16 before coding. Reuse existing interfaces and do not duplicate functionality.

## 1. Purpose

M9 coordinates federated training without receiving hospital medical images. It validates federation handoffs, manages rounds and participants, aggregates compatible local model submissions, creates immutable versioned global model artifacts, notifies Admin when a global model is ready for evaluation, and supports Admin-side evaluation and MAIN-model promotion.

Pipeline:

```text
M4 → M5 → M8 → M7 → Federation Handoff → M9
                                           ↓
                                   Global Model vN
                                           ↓
                                     Admin notification
                                           ↓
                                  Admin Start Evaluation
                                           ↓
                               Admin-local evaluation set
                                           ↓
                               Metrics + promotion decision
```

## 2. Project terminology

### Model implementation

The platform owns these eight implementations:

1. ResNet18
2. ResNet50
3. EfficientNet-B0
4. EfficientNet-B4
5. MobileNetV2
6. MobileNetV3-Small
7. MobileViT-XXS
8. ViT-B/16

Hospitals do not search for or write model code. M8 determines compatible architecture/configuration.

### Local model/update

The trained parameter state produced by a participating hospital after M4 → M5 → M8 → M7.

### Federation handoff

The M7-produced package:

```text
handoff_parameters.npz
handoff_metadata.json
```

M9 must reuse this existing contract and extend it only when necessary.

### Global model

In this project, a **global model is a trained model artifact containing aggregated weights/parameters that can later be loaded for inference on unseen patient data**.

It is not source code and is not the empty/untrained architecture.

### MAIN

The currently approved global model version for a specific `disease/task + architecture`.

The newest version is NOT automatically MAIN.

## 3. Hard business requirement

The trained proprietary global model must NOT be automatically distributed to hospitals.

Hospitals contribute local model updates. The resulting trained global model remains centrally controlled by the platform/Admin.

Do not implement:

```text
M9 → trained global weights → Hospital
```

Admin evaluates global models locally.

## 4. Federation/FedAvg protocol constraint

Standard iterative FedAvg normally uses a common server parameter state for a round and clients train from that state. This project must not silently distribute the proprietary trained global model to hospitals.

Therefore:

- Do not falsely label a custom protocol as standard iterative FedAvg.
- Do not silently send proprietary global weights to hospitals.
- Put aggregation behind a replaceable strategy interface.
- Explicitly document whether M7 sends full parameters or parameter deltas.
- Explicitly document common initialization/base-state semantics.
- If the current baseline uses deterministic/common non-proprietary initialization or another protocol, document it precisely.
- Leave the strategy replaceable for future privacy-preserving iterative protocols.

Inspect the actual M7 handoff before implementing aggregation. Do not guess whether it contains full parameters or deltas.

## 5. Mandatory repository inspection

Before coding:

- inspect repository structure;
- inspect M4, M5, M6, M7, M8, M16;
- inspect model registry/storage;
- inspect M7 FederationHandoff;
- inspect `handoff_parameters.npz`;
- inspect `handoff_metadata.json`;
- inspect CLI/API conventions;
- inspect database/storage conventions;
- inspect notification/event mechanisms;
- inspect tests.

Use existing abstractions rather than creating duplicates.

## 6. M9 package structure

Use the existing project package conventions. A possible structure is:

```text
federation/
    __init__.py
    models.py
    storage.py
    jobs.py
    rounds.py
    intake.py
    validation.py
    aggregation.py
    global_models.py
    evaluation.py
    promotion.py
    events.py
    security_hooks.py
    cli.py
    README.md
```

Do not create a second model-management or inference framework.

## 7. Core data models

Implement/reuse:

### FederationJob

Minimum concepts:

- federation_job_id
- task/disease
- task_type
- architecture
- num_classes
- class_mapping
- expected participants
- minimum participants
- deadline
- training requirements
- aggregation configuration
- status
- timestamps

### FederationParticipant

- participant_id
- federation_job_id
- authorization state
- participation state
- timestamps

### FederationRound

- round_id
- federation_job_id
- round_number
- status
- expected/received/accepted/rejected/quarantined participants
- minimum participants
- deadline
- timestamps

### FederationUpdate

- update_id
- federation_job_id
- round_id
- participant_id
- model_id
- architecture
- status
- artifact location
- checksum
- parameter metadata
- sample count
- training configuration
- validation result
- rejection reason
- timestamps

### GlobalModelVersion

- global_model_id
- task/disease
- task_type
- architecture
- version
- artifact location
- checksum
- parameter metadata
- source federation job
- source round
- source update IDs
- aggregation method/metadata
- status
- timestamp

### EvaluationRecord

- evaluation_id
- global_model_id
- model version
- task/disease
- architecture
- evaluation dataset ID/version
- sample count
- accuracy
- precision
- recall
- F1
- per-class metrics
- confusion matrix
- predictions/metrics locations
- inference configuration
- timestamps

### PromotionDecision

- candidate model
- previous MAIN
- decision
- policy version
- evaluation record
- reason
- metric summary
- timestamp

## 8. Storage

Use SQLite as authoritative metadata/state if consistent with the existing project.

SQLite stores:

- jobs
- rounds
- participants
- updates
- global-model metadata
- evaluation records
- promotion decisions

Actual model/update artifacts live in filesystem/object-style artifact storage.

Example:

```text
federation_artifacts/
    jobs/
        FED-CANCER-RESNET50-001/
            rounds/
                R01/
                    updates/
```

Global models:

```text
global_models/
    cancer/
        resnet50/
            v1/
                weights/
                metadata.json
                evaluation/
            v2/
                weights/
                metadata.json
                evaluation/
```

Do not use JSON as a competing authoritative database.

Do not claim `.enc` means encrypted. Only claim encryption if actual encryption exists.

## 9. Federation job

A job defines the federation contract.

Example:

```text
FED-CANCER-RESNET50-001

task: cancer_classification
architecture: resnet50
num_classes: 2
participants: A, B, C
minimum_participants: 2
epochs: 10
batch_size: 32
optimizer: Adam
learning_rate: 0.001
deadline: ...
```

Do not hard-code disease, architecture, or participants.

## 10. Isolation

Every federation track is isolated by:

```text
disease/task + architecture
```

Never aggregate:

- cancer with malaria;
- ResNet18 with ResNet50;
- incompatible class mappings;
- incompatible parameter structures.

## 11. M7 handoff

M9 consumes only the selected M7 federation handoff:

```text
handoff_parameters.npz
handoff_metadata.json
```

Do not require:

- raw images;
- M4 output;
- M5 processed data;
- complete M7 output folder;
- plots;
- all checkpoints;
- source code.

M7 already performs best-checkpoint selection. M9 consumes the selected handoff.

If federation fields are missing, extend the existing metadata backward-compatibly. Potential fields:

- federation_job_id
- round_id
- client_id/participant_id
- submission_id
- aggregation protocol
- common initialization ID
- privacy configuration reference

Do not invent a redundant giant federation manifest.

## 12. Intake and validation

Pipeline:

```text
Receive handoff
  ↓
Identify/authenticate participant
  ↓
Check job
  ↓
Check round
  ↓
Check task/disease
  ↓
Check architecture
  ↓
Check classes/class mapping
  ↓
Check parameter compatibility
  ↓
Check checksum/integrity
  ↓
Check training contract
  ↓
Check duplicate
  ↓
M12 security hook
  ↓
ACCEPT / REJECT / QUARANTINE
```

Validate at minimum:

- federation job ID
- participant identity
- round ID
- task/disease
- task type
- architecture
- number of classes
- class mapping
- parameter count
- parameter structure/order
- shapes
- compatible dtypes
- checksum
- handoff protocol version
- training completion status
- required training configuration
- duplicate submission
- round freshness
- participant authorization

Example:

```text
Expected: Cancer + ResNet50
Received: Cancer + ResNet18
→ REJECT
```

## 13. Parameter compatibility

Do not compare only parameter count.

Validate:

- deterministic parameter ordering;
- parameter presence;
- parameter shapes;
- compatible dtypes;
- parameter count;
- required metadata.

Do not blindly average every `.npz` array.

## 14. Non-float state

Inspect all eight supported architectures.

Explicitly classify:

- averageable floating trainable parameters;
- non-averageable integer/state/buffer values;
- unsupported values.

Do not arbitrarily average integer state.

Do not invent majority vote/rounding/keep-main behavior without checking the actual model and selected protocol.

Document the final policy.

## 15. Aggregation representation

Before implementing aggregation, determine whether the M7 handoff contains:

### Full parameters

```text
A → W_A
B → W_B
C → W_C
```

or:

### Parameter deltas

```text
A → ΔA
B → ΔB
C → ΔC
```

The aggregation algorithm must match the representation.

## 16. Aggregation strategy

Create a clean interface such as:

```text
AggregationStrategy.aggregate(...)
```

Potential implementations:

- FedAvg
- WeightedParameterAverage
- future privacy-preserving aggregation

Do not bury aggregation inside round management.

If weighted FedAvg-style aggregation is selected, the common sample-size weighting is:

```text
n_i = local training samples
N = sum(n_i)
weight_i = n_i / N

aggregated_parameter =
    sum(weight_i * parameter_i)
```

Only implement this if it matches the selected protocol.

Record the weighting rule in aggregation metadata.

## 17. Aggregation validation

Before aggregation:

- all updates accepted;
- same job;
- same round;
- same task/disease;
- same compatible architecture;
- compatible parameter structure;
- all required tensors present;
- no NaN/Inf;
- minimum participant requirement satisfied.

After aggregation:

- valid parameter count;
- valid shapes;
- valid dtypes;
- no NaN/Inf;
- model can instantiate;
- parameters can load;
- artifact checksum generated.

## 18. Round state machine

Normal lifecycle:

```text
CREATED
  ↓
OPEN
  ↓
RECEIVING
  ↓
READY_FOR_AGGREGATION
  ↓
AGGREGATING
  ↓
GLOBAL_MODEL_CREATED
  ↓
EVALUATION_PENDING
  ↓
COMPLETED
```

Failure states:

```text
FAILED
TIMED_OUT
INSUFFICIENT_PARTICIPANTS
CANCELLED
```

Do not represent the entire lifecycle only with booleans.

## 19. Participant deadlines

Example:

```text
Expected: A, B, C
Minimum: 2
```

A only:

```text
1 < 2
→ INSUFFICIENT_PARTICIPANTS
→ no aggregation
```

A+B:

```text
2 >= 2
→ may aggregate at deadline
```

A+B+C:

```text
3 >= 2
→ aggregate
```

Never silently reuse an expired update in another round.

## 20. Update status

Use explicit statuses:

```text
RECEIVED
VALIDATING
ACCEPTED
REJECTED
QUARANTINED
EXPIRED
USED_IN_AGGREGATION
NOT_USED
FAILED
```

Keep enough metadata about rejected/quarantined updates for audit/debugging.

## 21. M12 hook

Before aggregation:

```text
basic validation
  ↓
M12 security hook
  ↓
ACCEPT / FLAG / REJECT / QUARANTINE
  ↓
aggregation
```

Do not implement fake Byzantine detection in baseline M9.

## 22. Global model creation

Successful aggregation creates a real trained global model artifact.

It must:

- contain actual aggregated parameters;
- correspond to the correct architecture;
- be loadable;
- have checksum;
- have immutable version;
- reference source job/round/update IDs.

No random placeholder weights.

## 23. Versioning

Every aggregation creates a new immutable version:

```text
v1
v2
v3
```

Never overwrite previous versions.

Each version records:

- version number
- weights
- metadata
- checksum
- source federation job
- source round
- source update IDs
- aggregation information
- timestamp
- status

## 24. MAIN

Only one MAIN per:

```text
disease/task + architecture
```

Example:

```text
Cancer + ResNet50

v1 = HISTORICAL
v2 = MAIN
v3 = EVALUATED_NOT_PROMOTED
```

Newest is not automatically MAIN.

## 25. Admin notification

After successful global-model creation:

```text
Global Model vN
status = EVALUATION_PENDING
        ↓
Admin notification
```

Example:

> Cancer / ResNet50 Global Model v2 has been accepted by the Secure Federation Layer and is ready for evaluation.

Admin UI:

```text
Global Model v2
Architecture: ResNet50
Disease: Cancer
Status: Accepted

[ Start Inference / Testing ]
```

Do not automatically send the global model to hospitals.

## 26. Admin evaluation dataset

Evaluation is Admin-side.

Maintain separate local evaluation datasets per disease/task.

Requirements:

- Admin local device;
- not in the database;
- not sent to hospitals;
- labeled;
- disease/task-specific;
- versioned;
- preferably frozen;
- approximately 1,000–1,500 images per disease where practical;
- configurable target, not hard-coded exactly 1,000/1,500.

Example:

```text
evaluation_datasets/
    malaria/
    cancer/
    pneumonia/
```

## 27. Evaluation dataset versioning

Example:

```text
EVAL-CANCER-001 v1
```

Use the SAME dataset version to compare model versions:

```text
v1 → EVAL-CANCER-001 v1
v2 → EVAL-CANCER-001 v1
v3 → EVAL-CANCER-001 v1
```

If the dataset changes significantly, create a new dataset version.

Never silently compare models evaluated on different datasets.

## 28. Admin evaluation process

When Admin clicks Start Inference/Testing:

1. Load validated global-model metadata.
2. Determine architecture.
3. Select matching architecture-specific inference implementation.
4. Load global-model weights.
5. Load Admin-local evaluation dataset.
6. Run batch inference.
7. Calculate metrics.
8. Store results.
9. Create EvaluationRecord.
10. Make candidate eligible for promotion.

## 29. Architecture-specific inference

Mandatory mapping:

```text
ResNet50 Global Model
→ ResNet50 inference implementation

ResNet18 Global Model
→ ResNet18 inference implementation

EfficientNet-B0 Global Model
→ EfficientNet-B0 inference implementation
```

Never use an unrelated inference implementation.

Do not infer architecture from arbitrary filenames.

Use validated model metadata.

Reuse M16's inference implementation where possible.

If M16 needs a batch-evaluation extension, add it backward-compatibly rather than creating a second inference framework.

## 30. Evaluation metrics

Calculate at minimum:

- accuracy
- precision
- recall
- F1
- per-class metrics
- confusion matrix

Store:

- model ID/version
- task/disease
- architecture
- evaluation dataset ID/version
- sample count
- metrics
- timestamp
- inference configuration
- status

These are model evaluation metrics, not clinical validation or diagnosis.

## 31. Evaluation output

Store alongside the global model:

```text
global_models/
    cancer/
        resnet50/
            v1/
                weights/
                metadata.json
                evaluation/
                    metrics.json
                    predictions
                    confusion_matrix
            v2/
                weights/
                metadata.json
                evaluation/
```

Use existing storage conventions if present.

## 32. Promotion

Workflow:

```text
Candidate v2
  ↓
Admin evaluation
  ↓
Metrics
  ↓
Compare with current MAIN
  ↓
Configurable promotion policy
  ↓
PROMOTE or NOT_PROMOTE
```

If v2 is better and passes policy:

```text
v1 → HISTORICAL
v2 → MAIN
```

If v2 is worse:

```text
v1 → MAIN
v2 → EVALUATED_NOT_PROMOTED
```

Do not automatically promote the newest version.

## 33. Promotion policy

Keep the policy configurable.

Do not permanently hard-code:

```text
highest accuracy wins
```

Potential inputs:

- accuracy
- precision
- recall
- F1
- per-class metrics
- minimum thresholds
- critical metrics
- allowed regression
- weighted score

The exact medical/model-quality policy remains configurable/refinable.

Do not claim clinical validation for arbitrary thresholds.

## 34. M10 integration

M10 adds Differential Privacy during local training.

M9 may record privacy metadata such as:

```text
privacy.enabled
privacy.mechanism
privacy.clipping
privacy.noise
privacy.accounting
```

Do not implement fake DP in M9.

## 35. M11 integration

M11 adds secure communication.

Boundary:

```text
Hospital
  ↓
M11 secure transport
  ↓
M9 intake API
```

Do not put TLS logic inside aggregation.

Do not claim communication encryption until actually implemented.

## 36. M12 integration

M12 adds Byzantine/malicious update detection.

Provide a real pre-aggregation hook.

Do not fake it.

## 37. M13 integration

M9 should emit real structured events:

```text
FEDERATION_JOB_CREATED
ROUND_CREATED
ROUND_OPENED
UPDATE_RECEIVED
UPDATE_VALIDATED
UPDATE_ACCEPTED
UPDATE_REJECTED
UPDATE_QUARANTINED
PARTICIPANT_TIMEOUT
ROUND_READY
AGGREGATION_STARTED
AGGREGATION_COMPLETED
AGGREGATION_FAILED
GLOBAL_MODEL_CREATED
EVALUATION_READY
EVALUATION_COMPLETED
PROMOTION_DECIDED
```

Do not create fake telemetry.

## 38. CLI/API

Inspect existing conventions first.

Provide operations equivalent to:

```text
create federation job
list jobs
inspect job
open/start round
submit handoff
inspect round
list updates
inspect update
aggregate round
list global models
inspect global model
show MAIN
trigger evaluation
inspect evaluation
promote candidate
```

Do not duplicate existing interfaces.

## 39. Tests

### Unit tests

Test:

- job creation
- participant registration
- round states
- invalid state transitions
- deadlines
- minimum participants
- valid handoff
- wrong job
- wrong round
- wrong participant
- wrong task
- wrong architecture
- wrong class mapping
- wrong parameter shape
- wrong parameter count
- wrong dtype
- checksum mismatch
- corruption
- duplicate submission
- invalid training status
- aggregation
- non-float policy
- NaN/Inf
- global model creation
- immutable versions
- evaluation
- promotion

### Integration tests

At minimum:

1. A+B+C successful round.
2. A+B with C missing and minimum=2.
3. A only with minimum=2.
4. Wrong architecture.
5. Wrong disease/task.
6. M12 hook behavior.
7. Global v1 evaluation.
8. Global v2 evaluation on same dataset version.
9. v2 promoted over v1.
10. v3 worse than v2 and v2 remains MAIN.
11. Correct architecture-specific inference.
12. No global model distributed to hospitals.

## 40. End-to-end test

The project must have a test equivalent to:

```text
Create Cancer + ResNet50 job
        ↓
Register A/B/C
        ↓
Create round
        ↓
Submit three valid M7-style handoffs
        ↓
Validate
        ↓
Aggregate
        ↓
Create Global v1
        ↓
Emit Admin evaluation-ready event
        ↓
Admin triggers evaluation
        ↓
Cancer evaluation dataset v1
        ↓
ResNet50 inference
        ↓
Metrics
        ↓
Promotion
        ↓
Second federation round
        ↓
Global v2
        ↓
Evaluate v2 on SAME dataset v1
        ↓
Compare v1/v2
        ↓
Promote or retain MAIN
```

## 41. No fake implementation

Never:

- fake aggregation;
- fake weights;
- fake metrics;
- fake encryption;
- fake DP;
- fake Byzantine detection;
- fake telemetry;
- fake participant updates;
- silently distribute global weights;
- falsely claim standard FedAvg;
- weaken tests merely to make them pass.

## 42. Backward compatibility

Do not break M4–M8 or M16.

M9 must reuse:

- M6 model-management interfaces;
- M7 handoff;
- M8 resource decisions;
- M16 inference.

If a small backward-compatible change is necessary, make it explicitly and update tests.

Do not rewrite M7/M8/M16 inside M9.

## 43. Implementation order

Follow this order:

### Phase 1
Repository inspection.

### Phase 2
Data models.

### Phase 3
Storage.

### Phase 4
Job/participant/round management.

### Phase 5
Intake and validation.

### Phase 6
Resolve and implement aggregation semantics.

### Phase 7
Global-model creation/versioning.

### Phase 8
Admin notification.

### Phase 9
Admin evaluation.

### Phase 10
Promotion.

### Phase 11
M10/M11/M12/M13 extension points.

### Phase 12
CLI/API.

### Phase 13
Unit/integration/end-to-end tests.

### Phase 14
Full project regression tests.

## 44. Final acceptance criteria

M9 is complete only when:

- [ ] federation jobs work;
- [ ] disease/task isolation works;
- [ ] architecture isolation works;
- [ ] participants are tracked;
- [ ] rounds have explicit state;
- [ ] minimum participants work;
- [ ] deadlines work;
- [ ] M7 handoff is accepted;
- [ ] handoffs are actually validated;
- [ ] wrong task/architecture/classes/parameters are rejected;
- [ ] duplicate submissions are prevented;
- [ ] aggregation is real;
- [ ] aggregation semantics are documented;
- [ ] full parameters vs deltas is explicitly resolved;
- [ ] common initialization is explicitly resolved;
- [ ] non-float state has an explicit policy;
- [ ] global model artifacts are real and loadable;
- [ ] global versions are immutable;
- [ ] old versions remain available;
- [ ] only one MAIN exists per task + architecture;
- [ ] newest version is not automatically MAIN;
- [ ] Admin receives evaluation-ready notification;
- [ ] Admin can manually start evaluation;
- [ ] Admin evaluation dataset is local;
- [ ] evaluation dataset is separate per disease/task;
- [ ] evaluation dataset is approximately 1,000–1,500 images where practical;
- [ ] evaluation dataset is versioned/frozen;
- [ ] correct architecture-specific inference is used;
- [ ] accuracy is calculated;
- [ ] precision is calculated;
- [ ] recall is calculated;
- [ ] F1 is calculated;
- [ ] confusion matrix is calculated;
- [ ] evaluation output is stored beside the model;
- [ ] candidate can be promoted;
- [ ] candidate can be rejected/not promoted;
- [ ] old MAIN remains MAIN when candidate is worse;
- [ ] global model is not automatically distributed to hospitals;
- [ ] M10 extension point exists;
- [ ] M11 extension point exists;
- [ ] M12 extension point exists;
- [ ] M13 event hooks exist;
- [ ] M9 tests pass;
- [ ] full project tests pass.

## 45. Required final report

After implementation, report:

1. Files created.
2. Files modified.
3. Existing interfaces reused.
4. New APIs/CLI commands.
5. Database schema.
6. Artifact structure.
7. Round state machine.
8. Validation rules.
9. Actual aggregation protocol.
10. Full parameters vs delta decision.
11. Common initialization decision.
12. Global-model lifecycle.
13. Admin evaluation workflow.
14. Evaluation dataset handling.
15. Promotion policy.
16. M10/M11/M12/M13 extension points.
17. Tests added.
18. Test results.
19. Full regression results.
20. Known limitations.
21. Decisions intentionally deferred.

Do not claim a feature is implemented unless it actually works and is tested.

# 46. Final architecture

The target architecture is:

```text
                         HOSPITALS
                            |
              +-------------+-------------+
              |             |             |
          Hospital A    Hospital B    Hospital C
              |             |             |
              v             v             v
             M4            M4            M4
              v             v             v
             M5            M5            M5
              v             v             v
             M8            M8            M8
              v             v             v
             M7            M7            M7
              |             |             |
              +-------------+-------------+
                            |
                     Federation Handoff
                            |
                            v
                   +----------------+
                   |       M9       |
                   | Secure         |
                   | Federation     |
                   +----------------+
                            |
                    Validate Updates
                            |
                     Manage Round
                            |
                    Security Hooks
                            |
                       Aggregate
                            |
                            v
                    Global Model vN
                            |
                            v
                   Admin Notification
                            |
                            v
                 [Start Inference/Testing]
                            |
                            v
               Correct Architecture
                  Inference Engine
                            |
                            v
                Admin-local Evaluation
                       Dataset
                  ~1,000–1,500
                            |
                            v
               Accuracy / Precision /
                  Recall / F1 / etc.
                            |
                            v
                  Compare with MAIN
                            |
                  +---------+---------+
                  |                   |
                  v                   v
               PROMOTE          NOT PROMOTE
                  |                   |
                  v                   v
               MAIN             Old MAIN stays
```

**This document is the implementation specification. Do not silently remove or reinterpret the Admin evaluation, disease-specific evaluation datasets, global-model versioning, MAIN promotion, or the requirement that trained global models are not automatically distributed to hospitals.**
"""