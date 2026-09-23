# Module 3: Hospital Desktop Application

**Project:** Secure and Privacy-Preserving Federated Deep Learning Training Platform for Medical Imaging  
**Owner:** Member 4 (Frontend + Desktop + Mobile + Communication)  
**Location:** `frontend/hospital-desktop/`  
**Status:** Functionally Complete & Verified (`[x] Completed`)  
**Last Updated:** 2026-09-23

---

## Status & Implementation Checklist

- [x] Hospital Operator Dashboard with live workstation telemetry (NVIDIA RTX 3080 Ti / CUDA 12.2)
- [x] Module 4: Dataset Ingestion, DICOM/NIfTI Header Inspection & Class Imbalance Profiler
- [x] Module 5: Automated Preprocessing Engine with CLAHE, Normalization & Split Leakage Check
- [x] Module 8: Hardware Resource Profiler & 3-Tier Dynamic Training Recommendations
- [x] Dynamic hardware classification for EfficientNet-B0 (evaluated per VRAM/compute tier)
- [x] Module 7: Local PyTorch Training Orchestration with epoch/batch streaming & live loss curves
- [x] Module 7: Training Result Viewer & Local Checkpoint Cryptographic Digest
- [x] Module 9: Federation Handoff Bundle packaging with Zero-Raw-Images Certification
- [x] Module 6: Approved Clinical Model Registry with parameter specs and SHA-256 integrity checksums
- [x] Module 16: Zero-Leakage Local Inference Engine with probability breakdown & clinical disclaimer
- [x] Module 18: Consortium Communication, Dispatch Chat & Notification Inbox
- [x] Module 1: Authentication & Strict Hospital Isolation Adapter (`authService.js`)
- [x] Workstation Settings with Enclave Hardware Diagnostics & Storage Paths
- [x] Comprehensive Automated Test Suite (24 unit/integration tests running with `node --test`)
- [x] Production Verification & `.env` Backend Linking Complete

---

## 1. Module Purpose & Core Architecture

Module 3 is the hospital-side desktop application for clinical nodes. It provides the workstation interface for clinical data managers, radiomics operators, and medical imaging technologists participating in privacy-preserving federated deep learning.

### Cardinal Privacy Invariant
> **RAW MEDICAL DATA NEVER LEAVES THE HOSPITAL.**  
> Medical images (DICOM series, NIfTI volumes, high-resolution radiographs), patient cohorts, and Protected Health Information (PHI) remain strictly local. Only model weight updates (delta parameters for Module 9) and authorized telemetry are ever transmitted to the central consortium server.

```text
                               +------------------------------------------+
                               |     Module 3: Hospital Desktop App       |
                               | (React 19 + Vite + CSS Design System)    |
                               +--------------------+---------------------+
                                                    |
         +------------------------------------------+------------------------------------------+
         |                                          |                                          |
         v                                          v                                          v
+------------------+                      +-------------------+                      +-------------------+
|  Data & Pipeline |                      | Resource & Train  |                      | Clinical Support  |
+------------------+                      +-------------------+                      +-------------------+
| • datasetService |                      | • resourceService |                      | • modelService    |
|   (Module 4)     |                      |   (Module 8)      |                      |   (Module 6)      |
| • preprocess-    |                      | • trainingService |                      | • inferenceService|
|   ingService     |                      |   (Module 7)      |                      |   (Module 16)     |
|   (Module 5)     |                      | • Fed Handoff     |                      | • communication-  |
+--------+---------+                      |   (Module 9)      |                      |   Service (M18)   |
         |                                +---------+---------+                      +---------+---------+
         |                                          |                                          |
         +------------------------------------------+------------------------------------------+
                                                    |
                                                    v
                               +------------------------------------------+
                               |   Backend & Consortium Infrastructure    |
                               |  • Module 1: Auth & Hospital Isolation   |
                               |    (HOSP_000001, ROLES.HOSPITAL_OPERATOR)|
                               |  • Module 9: Central Aggregator Server   |
                               +------------------------------------------+
```

---

## 2. Responsibilities Matrix

| Responsibility | Handled by Module 3 | Related Modules |
|---|:---:|:---:|
| Clinical operator login & hospital session isolation | ✅ | Module 1 (Auth & Isolation) |
| Local dataset ingestion & DICOM/NIfTI header validation | ✅ | Module 4 (Dataset Ingestion) |
| Image normalization, CLAHE enhancement & patient split isolation | ✅ | Module 5 (Preprocessing) |
| Hardware inspection & 3-tier training recommendation | ✅ | Module 8 (Resource-Aware Engine) |
| Local deep learning training monitor & loss visualization | ✅ | Module 7 (Local Training) |
| Generation of `FederationHandoff` bundle (weights delta only) | ✅ | Module 9 (FL Engine) |
| Approved local model registry verification | ✅ | Module 6 (Model Registry) |
| Zero-leakage local clinical inference entry point | ✅ | Module 16 (Local Inference) |
| Secure consortium messaging & alert center | ✅ | Module 18 (Communication) |
| Raw image transmission outside hospital network | ❌ *(Permanently blocked)* | Core Architectural Invariant |
| Central model aggregation across multiple hospitals | ❌ | Handled centrally in Module 9 |

---

## 3. Hospital Isolation & Security Boundaries

Module 3 enforces the strict security rules of Module 1:

1. **Role Enforcement:** Only accounts with `role === 'hospital_operator'` may access the application. Attempts to authenticate with `researcher` credentials are automatically rejected with `HOSPITAL_ACCESS_DENIED`.
2. **Hospital Isolation:** Every action is scoped to the operator's assigned `hospital_id` (e.g. `HOSP_000001` - *St. Jude Clinical AI Node*). Operators cannot view or query data from any other hospital node.
3. **Zero-Raw-Data Lock:** The application UI displays a permanent, non-dismissible Zero-Raw-Data compliance seal. Network payloads are restricted to gradient deltas, sample counts, and sanitized execution telemetry.

---

## 4. Key Workflows & Screen Breakdown

### 1. Hospital Operator Dashboard (`DashboardView.jsx`)
- Active hospital node banner (`HOSP_000001` • *St. Jude Clinical Research & AI Node*).
- Live hardware telemetry strip: NVIDIA RTX 3080 Ti (12GB GDDR6X, CUDA 12.2), active VRAM usage, host RAM, CPU load, and node status.
- Primary local dataset summary and recent training session audit trail.

### 2. Module 4: Dataset Ingestion & Inspection (`DatasetView.jsx`)
- Multi-modality local folder scanner (DICOM series, NIfTI volumes, high-res radiographs).
- Full dataset integrity audit: total samples (5,856), valid tensors (5,840), corrupted/unreadable files (16), duplicate records (12).
- Split distribution graph (Train: 71.8%, Val: 14.2%, Test: 14.0%).
- Class imbalance bars (Normal vs Bacterial Pneumonia vs Viral Pneumonia).
- Tensor statistics: dimensions `[1, 1024, 1024]`, pixel spacing, dynamic range, and photometric interpretation.
- **Zero-Patient-Overlap Guarantee:** Patient cohort analyzer verifying that no patient appears in both train and validation splits.

### 3. Module 5: Automated Preprocessing Engine (`PreprocessingView.jsx`)
- Preprocessing pipeline controls: spatial resizing `[3, 224, 224]`, CLAHE adaptive histogram equalization ($clip=2.0, tile=8\times8$), ImageNet normalization ($\mu=[0.485, 0.456, 0.406]$, $\sigma=[0.229, 0.224, 0.225]$).
- Live step-by-step progress monitor with elapsed timing and per-sample throughput.
- Preprocessing verification report with tensor shape validation and leakage checks.

### 4. Module 8: Resource-Aware Training Recommendations (`StartTrainingView.jsx`)
- Workstation hardware inspector detecting GPU compute capability, total VRAM, and thermal headroom.
- Generates **3 distinct, tailored recommendations**:
  1. **Balanced (Recommended):** ResNet-18, CUDA (`cuda:0`), Mixed Precision (FP16 AMP), batch size 16, 5 epochs, 4 workers, estimated duration 3.8 - 4.6 mins.
  2. **High-Capacity / More Time:** EfficientNet-B0, CUDA, FP16, batch size 8, 8 epochs, estimated duration 7.2 - 9.0 mins.
  3. **Fast / Low-Resource:** MobileNetV3-Large, CUDA, FP16, batch size 32, 3 epochs, estimated duration 1.5 - 2.2 mins.
- **Dynamic Role for EfficientNet-B0:** Evaluated dynamically based on real-time VRAM headroom (e.g. `HIGH_CAPACITY_CANDIDATE` on $\ge 10\text{GB}$, `HIGH_LOAD` on $6\text{GB}$, `UNSAFE` on $<4\text{GB}$ or CPU).
- Explicit modal confirmation required prior to dispatching training.

### 5. Module 7: Local Training Monitor (`TrainingMonitorView.jsx`)
- Real-time training progress tracking: epoch counter, batch step progress bar, elapsed time, and ETA.
- Multi-curve loss tracker (training loss vs validation loss) and accuracy curves.
- Live hardware telemetry gauges (VRAM MB, GPU %, RAM GB, CPU %).
- Dynamic OOM / adaptation event logger.
- Live STDOUT telemetry execution stream.

### 6. Module 7 & 9: Training Result & Federation Handoff (`TrainingResultView.jsx`)
- Comprehensive execution audit: validation accuracy (91.4%), test accuracy (90.8%), ROC-AUC (0.952).
- Local checkpoint verification: file path, size (44.7 MB), and SHA-256 integrity digest.
- **Module 9 FederationHandoff Bundle:** Packages model delta weights, client sample count ($N=4,192$), and differential privacy noise metadata for Flower / FedAvg with cryptographic zero-raw-images certification.

### 7. Module 6: Approved Model Registry (`ModelsView.jsx`)
- Consortium-approved architecture library (ResNet-18, EfficientNet-B0, DenseNet-121, MobileNetV3-Large).
- Architectural specification inspector: target input tensor shape, parameter count, file size, class mapping, and SHA-256 checksums.

### 8. Module 16: Zero-Leakage Local Inference (`InferenceView.jsx`)
- Local inference workstation allowing clinical radiomics staff to test scans against approved local checkpoints.
- Probability distribution breakdown across clinical classes (Normal vs Bacterial vs Viral Pneumonia) with confidence scoring.
- Zero-Egress Privacy Certificate and diagnostic decision-support disclaimer.

### 9. Module 18: Communications & Notifications (`CommunicationView.jsx`)
- Consortium notifications inbox (round invitations, global model release alerts, sentinel health checks).
- Secure operator dispatch chat channel with consortium lead investigators.

---

## 5. Verification & Automated Test Suite

Module 3 includes 24 automated unit and integration tests executing against Node's native test runner (`node --test`).

### Running the Test Suite
```powershell
cd C:\Users\Admin\Desktop\Major-Project\frontend\hospital-desktop
npm test
```

### Test Coverage Summary
```text
✔ Module 1 - AuthService: should authenticate valid hospital operator (HOSP_000001)
✔ Module 1 - AuthService: should reject researcher role from accessing hospital app
✔ Module 1 - AuthService: should reject invalid credentials
✔ Module 4 - DatasetService: should return valid dataset summary with zero patient overlap
✔ Module 4 - DatasetService: should identify corrupted and duplicate scans
✔ Module 5 - PreprocessingService: should execute pipeline and produce normalized tensors
✔ Module 5 - PreprocessingService: should verify zero leakage between train and val splits
✔ Module 8 - ResourceService: should profile workstation GPU hardware (RTX 3080 Ti)
✔ Module 8 - ResourceService: should produce 3 distinct training recommendations
✔ Module 8 - ResourceService: should dynamically evaluate EfficientNet-B0 based on VRAM
✔ Module 7 - TrainingService: should generate valid immutable TrainingConfig
✔ Module 7 - TrainingService: should stream batch progress and loss metrics
✔ Module 7 - TrainingService: should package FederationHandoff bundle with zero raw images
✔ Module 6 - ModelService: should list approved models with valid SHA-256 checksums
✔ Module 16 - InferenceService: should execute zero-leakage local inference
... (24 passed, 0 failed)
```

---

## 6. How to Run Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation & Execution
```powershell
# 1. Navigate to Module 3 directory
cd C:\Users\Admin\Desktop\Major-Project\frontend\hospital-desktop

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev
```

The application runs at **`http://localhost:5174`** (or next available port).

### Default Authorized Clinical Operator Credentials
- **Email:** `operator@stjude-clinical.org`
- **Password:** `hospital123`
- **Assigned Hospital:** `HOSP_000001` (St. Jude Clinical Research & AI Node)
