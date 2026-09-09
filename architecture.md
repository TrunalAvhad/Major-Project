# Secure and Privacy-Preserving Federated Deep Learning Training Platform for Medical Imaging

This document is the MASTER PROJECT PROGRESS TRACKER for a four-member development team.

Its primary purpose is:

1. Explain the complete project
2. Show the architecture
3. Show all 21 implementation modules
4. Track completion status
5. Show module ownership
6. Show dependencies
7. Prevent members from accidentally modifying another member's module
8. Provide integration milestones
9. Track testing
10. Track final completion

---

## 1. PROJECT OVERVIEW

The system involves a decentralized training architecture designed for medical imaging applications. The ecosystem includes:
- Researcher/Admin Desktop
- Hospital Desktop
- Mobile Application
- Node.js/Express Backend
- MongoDB
- Python/Flower Federated Engine
- PyTorch CNN

This architecture facilitates local hospital training with privacy and security mechanisms.

**Important principle:**

Raw medical images remain inside the hospital environment.

Only permitted model updates and required telemetry are exchanged with the federated infrastructure.

---

## 2. ARCHITECTURE

```text
Researcher Desktop
        |
        v
Node.js / Express Backend
        |
        +------ MongoDB
        |
        v
Python / Flower Federated Engine
        |
   +----+----+----+
   |    |    |    |
   v    v    v    v
Hospital Clients
   |
   v
Local Dataset
   |
   v
Preprocessing
   |
   v
PyTorch CNN
   |
   v
Protected Model Update
```

Also show:

**Mobile App → Backend**

---

## 3. TEAM OWNERSHIP

**MEMBER 1:**
Modules 4, 5, 6, 7, 8, 16
ML + Hospital AI Pipeline

**MEMBER 2:**
Modules 9, 10, 12, 19, 20
Federated Learning + Privacy + Security Experiments

**MEMBER 3:**
Modules 1, 11, 13, 14, 15
Backend + Database + Security Infrastructure

**MEMBER 4:**
Modules 2, 3, 17, 18, 21
Frontend + Desktop + Mobile + Communication

---

## 4. ALL 21 MODULES

| # | Module | Owner | Status | Depends On | Integration Point |
|---|---|---|---|---|---|
| 1 | Authentication and Role Management | Member 3 | [~] In Progress | None | Backend |
| 2 | Researcher/Admin Desktop Application | Member 4 | [ ] Not Started | M1, M14 | Frontend/Backend |
| 3 | Hospital Desktop Application | Member 4 | [ ] Not Started | M1, M14 | Frontend/Backend |
| 4 | Dataset Ingestion and Inspection | Member 1 | [ ] Not Started | None | ML Pipeline |
| 5 | Automated Preprocessing Engine | Member 1 | [ ] Not Started | M4 | ML Pipeline |
| 6 | Model Management | Member 1 | [ ] Not Started | None | ML Pipeline |
| 7 | Local Deep Learning Training | Member 1 | [ ] Not Started | M5, M6 | ML Pipeline |
| 8 | Resource-Aware Training | Member 1 | [ ] Not Started | M7 | ML Pipeline |
| 9 | Federated Learning Engine | Member 2 | [ ] Not Started | M7 | FL Engine |
| 10 | Differential Privacy | Member 2 | [ ] Not Started | M9 | FL Engine |
| 11 | Secure Communication | Member 3 | [ ] Not Started | M1 | Backend |
| 12 | Byzantine/Malicious Update Detection | Member 2 | [ ] Not Started | M9 | FL Engine |
| 13 | Monitoring and Telemetry | Member 3 | [ ] Not Started | None | Backend |
| 14 | Database, Audit and Model Storage | Member 3 | [ ] Not Started | None | Backend |
| 15 | Model Versioning | Member 3 | [ ] Not Started | M14 | Backend |
| 16 | Local Inference | Member 1 | [ ] Not Started | M7 | ML Pipeline |
| 17 | Mobile Application | Member 4 | [ ] Not Started | M1, M14 | Frontend/Backend |
| 18 | Communication and Notification | Member 4 | [ ] Not Started | M13 | Frontend/Backend |
| 19 | Testing and Reliability | Member 2 | [ ] Not Started | All | Testing |
| 20 | Research Experiments and Evaluation | Member 2 | [ ] Not Started | M9 | Evaluation |
| 21 | Packaging and Deployment | Member 4 | [ ] Not Started | All | Deployment |

**Status Values:**
- `[ ]` Not Started
- `[~]` In Progress
- `[x]` Completed
- `[!]` Blocked

*Do not mark a module completed unless its owner confirms that its tests and integration requirements are complete.*

---

## 5. MODULE DEPENDENCY MAP

**Important dependencies:**
- M4 → M5
- M5 → M7
- M6 → M7
- M7 ↔ M9 through the Model Interface
- M9 → M10
- M9 → M12
- M1 → protected backend APIs
- M14 → backend data persistence
- M13 → dashboard telemetry
- M15 → model versioning
- M7 → M16
- M2/M3/M17 → Backend APIs
- M18 → Backend + UI
- M21 → Applications

**IMPORTANT:**

- M1 and M3 can develop in parallel.
- M2 and M3 can develop in parallel using mock API responses.
- M1 and M2 ML/FL can develop in parallel.
- M9 must initially use a dummy/mock model interface so the FL developer does not wait for the ML developer.
- The real integration happens through the frozen Model Interface.

---

## 6. FROZEN COMMON CONTRACTS

**Project-wide identifiers:**
- `user_id`
- `hospital_id`
- `client_id`
- `session_id`
- `round_id`
- `model_id`
- `model_version`

**Common training configuration:**
- Configured across sessions and passed through the `session_id` and round configurations.

**Model Interface:**
- `get_model()`
- `get_parameters()`
- `set_parameters()`
- `train_local()`
- `evaluate()`

**REST API naming convention:**
- `/api/v1/...`

**Socket.io event names:**
- `training_started`
- `training_progress`
- `training_completed`
- `round_started`
- `round_completed`
- `client_connected`
- `client_disconnected`
- `security_alert`
- `model_updated`
- `training_failed`

*These contracts must not be changed without team agreement.*

---

## 7. INTEGRATION MILESTONES

### Integration 1
Backend + Database + Authentication

- [ ] Backend running
- [ ] MongoDB connected
- [ ] Login working
- [ ] RBAC working
- [ ] API contract stable

### Integration 2
Frontend + Backend

- [ ] Researcher login
- [ ] Hospital login
- [ ] Dashboard loads real API data
- [ ] Errors handled consistently

### Integration 3
ML + FL

- [ ] ML model interface implemented
- [ ] Dummy Flower client works
- [ ] FedAvg works with dummy model
- [ ] Real PyTorch model connected
- [ ] Local training works
- [ ] Global model generated

### Integration 4
Backend + FL

- [ ] Backend can create training session
- [ ] Backend can start FL
- [ ] Training status available
- [ ] Metrics available

### Integration 5
Monitoring

- [ ] Training metrics
- [ ] Resource metrics
- [ ] Round status
- [ ] Client status
- [ ] Security events

### Integration 6
Security/Privacy

- [ ] TLS
- [ ] DP
- [ ] Byzantine detection
- [ ] Security logs

### Integration 7
Final System

- [ ] Researcher desktop
- [ ] Hospital desktop
- [ ] Mobile
- [ ] Federated training
- [ ] Model versioning
- [ ] Local inference
- [ ] Testing
- [ ] Packaging

---

## 8. DEVELOPMENT RULES

1. Never directly access another member's internal implementation.
2. Communicate through defined interfaces.
3. Do not change frozen contracts without team agreement.
4. Frontend never directly accesses MongoDB.
5. Flower should not contain hardcoded EfficientNet/ResNet implementation.
6. ML should expose a generic model interface.
7. Backend should communicate with FL through a defined service interface.
8. Use mock data/interfaces when another module is not ready.
9. Each member must test their own module before integration.
10. Do not mark modules complete based only on code creation.
11. Raw medical images must remain local to the hospital.
12. Do not store raw medical images in the central MongoDB database.
13. Do not commit secrets to Git.
14. Keep configurable values outside core source code.

---

## 9. GIT WORKFLOW

**Branches:**
- `main`
- `develop`
- `feature/module-01-auth`
- `feature/module-02-researcher-ui`
- `feature/module-03-hospital-ui`
- `...`

Each member should work on their assigned feature branch.
No direct development on main.

---

## 10. COMPLETION TRACKER

### Member 1
- [ ] M4 Dataset
- [ ] M5 Preprocessing
- [ ] M6 Model Management
- [ ] M7 Local Training
- [ ] M8 Resource-Aware Training
- [ ] M16 Local Inference

### Member 2
- [ ] M9 Federated Engine
- [ ] M10 Differential Privacy
- [ ] M12 Byzantine Detection
- [ ] M19 Testing
- [ ] M20 Research Evaluation

### Member 3
- [ ] M1 Authentication
- [ ] M11 Secure Communication
- [ ] M13 Monitoring
- [ ] M14 Database
- [ ] M15 Model Versioning

### Member 4
- [ ] M2 Researcher Desktop
- [ ] M3 Hospital Desktop
- [ ] M17 Mobile
- [ ] M18 Communication
- [ ] M21 Packaging

---

## 11. HOW TO MARK A MODULE COMPLETE

A member may change:

`[ ]` → `[~]` → `[x]`

only when:

- implementation is complete
- unit tests pass
- integration interface is documented
- no known blocking issue remains
- README for that module is updated

If blocked:

`[!]`

and add:

```
Reason:
Blocked by:
Expected resolution:
```

---

## 12. PROJECT CHANGELOG

### 2026-09-07
- Project contracts V1.0 frozen
- Module ownership finalized
- Module 1 development started

Future team changes should be recorded here.

---

## 13. CURRENT PROJECT STATUS

- **Total Modules:** 21
- **Completed:** 0
- **In Progress:** 1
- **Blocked:** 0
- **Not Started:** 20

This must be manually updated when module statuses change.

---

## 14. IMPORTANT INTEGRATION NOTE

"ML and Federated Learning are parallel development tracks."

The FL member can implement Flower, FedAvg, round management and aggregation using a dummy model interface while the ML member develops the real PyTorch models.

Once the ML interface is stable, the real model is plugged into the Flower client without rewriting the FL engine.

Similarly, frontend and backend can be developed in parallel using mock API responses and later connected through the frozen REST API contract.
