# Module 3: Hospital Desktop Application

**Project:** Secure and Privacy-Preserving Federated Deep Learning Training Platform for Medical Imaging  
**Role / Owner:** Member 4 (Frontend + Desktop + Mobile + Communication)  
**Location:** `frontend/hospital-desktop/`  
**Status:** Functionally Complete & Verified (`[x] Completed`)

---

## 1. Module Overview & Core Architecture

Module 3 is the hospital-side desktop application for clinical AI nodes. It provides the workstation interface for clinical data managers, radiomics operators, and hospital researchers participating in privacy-preserving federated deep learning.

### Cardinal Privacy Invariant
> **RAW MEDICAL DATA NEVER LEAVES THE HOSPITAL.**  
> Medical images (DICOM, NIfTI, PNG), patient cohorts, and Protected Health Information (PHI) remain strictly local. Only model weight updates (delta parameters for Module 9) and authorized telemetry are ever transmitted to the central consortium server.

### Architecture & Service Adapters
Module 3 operates strictly as the user-facing interface and orchestration layer. It does **not** reimplement ML engines; instead, it consumes clean service adapters that interface with Modules 1, 4, 5, 6, 7, 8, 16, and 18:

```text
Hospital Desktop Workstation (Module 3)
   ├── authService.js           ──► Module 1: Authentication & Hospital Isolation (JWT, ROLES.HOSPITAL_OPERATOR, HOSP_000001)
   ├── datasetService.js        ──► Module 4: Dataset Ingestion & Header Inspection
   ├── preprocessingService.js  ──► Module 5: Automated Preprocessing Engine & Patient Leakage Check
   ├── modelService.js          ──► Module 6: Approved Local Model Registry & Cryptographic Hashes
   ├── resourceService.js       ──► Module 8: Resource-Aware Hardware Evaluation & 3 Training Recommendations
   ├── trainingService.js       ──► Module 7: Local PyTorch Training Execution & Telemetry Stream
   │                                   └── Produces TrainingResult & Module 9 FederationHandoff Bundle
   ├── inferenceService.js      ──► Module 16: Zero-Leakage Local Model Inference Entry Point
   └── communicationService.js  ──► Module 18: Consortium Communications & Notifications
```

---

## 2. Key Features Implemented

### 1. Hospital Dashboard
- Displays active hospital identity (`HOSP_000001` - St. Jude Clinical AI Node), operator role, and node version.
- Live hardware telemetry strip: NVIDIA GeForce RTX 3080 Ti (CUDA 12.2), live VRAM usage, host RAM, CPU load, and node status.
- Primary local dataset summary and recent training session audit log.
- Persistent Zero-Raw-Data Lock compliance indicator.

### 2. Module 4: Dataset Ingestion & Inspection Screen
- Local folder selection and modality detection (DICOM series, NIfTI volumes, Radiograph PNG/JPEG).
- Full dataset profiling: total samples (5,856), valid tensors (5,840), corrupted files (16), duplicates (12).
- Split ratio visualization (Train: 71.8%, Val: 14.2%, Test: 14.0%).
- Class distribution bars (Normal vs Bacterial Pneumonia vs Viral Pneumonia).
- Image tensor statistics (resolution ranges, channels, bit-depth, mean/std intensity).
- Patient cohort statistics: unique patient count (3,820) and cross-split overlap verification (0 patient overlap).

### 3. Module 5: Automated Preprocessing Engine
- Configurable clinical preprocessing pipeline: tensor resizing to [3, 224, 224], CLAHE adaptive histogram equalization (clip limit 2.0), ImageNet normalization, and patient-isolated splits.
- Real-time step-by-step progress tracker.
- Automated Split Leakage Check (verifies 0 patient overlap across splits).
- Comprehensive Preprocessing Report with post-normalization tensor properties.

### 4. Module 8 -> Module 7: Resource-Aware Start Training Workflow
- **Module 8 Evaluation:** Inspects workstation hardware (CUDA 12.2, 12GB VRAM) and dataset properties.
- **Three Training Recommendations:**
  1. **Recommended / Balanced:** ResNet-18, CUDA (cuda:0), FP16 (AMP), batch size 16, 5 epochs, 4 workers, estimated duration 3.8 - 4.6 mins, optimal safety headroom.
  2. **High-Capacity / More Time:** EfficientNet-B0, CUDA, FP16, batch size 8, 8 epochs, estimated duration 7.2 - 9.0 mins.
  3. **Fast / Lower Resource:** MobileNetV3-Large, CUDA, FP16, batch size 32, 3 epochs, estimated duration 1.5 - 2.2 mins.
- **Dynamic Role for EfficientNet-B0:** Evaluated dynamically based on available VRAM and device capabilities (e.g. `HIGH_CAPACITY_CANDIDATE` on >=10GB VRAM, `HIGH_LOAD` on 6GB, `UNSAFE` on <4GB or CPU). Never hardcoded.
- **Training Confirmation Dialog:** Requires explicit confirmation of parameters before dispatching execution.
- **Module 7 TrainingConfig Generation:** Produces immutable `TrainingConfig` adhering to project contracts.

### 5. Module 7: Local Training Execution Monitor
- Real-time training progress tracking: epoch counter, batch step progress bar, elapsed time, and ETA.
- Loss curves (train loss, validation loss) and accuracy metrics (train acc, val acc).
- Live hardware telemetry gauges (VRAM MB, GPU %, RAM GB, CPU %).
- Dynamic OOM / adaptation event logger.
- Live STDOUT / telemetry execution stream.

### 6. Module 7: Training Result & Module 9 Federation Handoff
- Comprehensive `TrainingResult` viewer: final val accuracy, test accuracy, val loss, ROC-AUC score.
- Local checkpoint verification: file path, size, and SHA-256 integrity digest.
- Hardware execution summary from Module 8 (peak VRAM, power draw, zero OOM).
- **Module 9 FederationHandoff Bundle:** Packages the parameter updates (weights delta tensors + sample size count + metadata) for Flower / FedAvg with explicit zero-raw-images privacy certification.

### 7. Module 6: Approved Local Model Registry
- Registry of models approved by consortium governance (ResNet-18, EfficientNet-B0, DenseNet-121, MobileNetV3-Large).
- Specification inspector: target tensor shape, output classes, parameter count, file size, class mapping, and SHA-256 integrity checksums.

### 8. Module 16: Zero-Leakage Local Inference
- Local inference entry point allowing clinical staff to evaluate local patient scans with approved checkpoints.
- Task-specific class breakdown (Normal vs Bacterial vs Viral Pneumonia) with probability distributions and confidence scores.
- Zero-Egress Privacy Certificate and clinical decision-support disclaimer.

### 9. Module 18: Consortium Communications & Notifications
- Consortium notification inbox (round invitations, global model release alerts, sentinel health checks).
- Secure operator dispatch chat channel with consortium lead investigators.

---

## 3. Verification & Automated Test Suite

Module 3 includes 24 automated unit and integration tests executing against Node's native test runner (`node --test`):

```bash
cd frontend/hospital-desktop
npm test
```

### Test Suite Summary:
- `auth.test.js`: 5 tests passing (Role contracts, hospital operator login, hospital isolation guard, credential rejection, session clearance).
- `dataset.test.js`: 4 tests passing (Local dataset retrieval, split/class stats, path inspection, empty path rejection).
- `preprocessing.test.js`: 3 tests passing (Clinical config defaults, pipeline execution with leakage check, missing ID error).
- `resourceTraining.test.js`: 4 tests passing (Hardware profiling, 3 distinct recommendations, dynamic EfficientNet-B0 evaluation across VRAM tiers, valid Module 7 TrainingConfig generation).
- `trainingOrchestration.test.js`: 3 tests passing (Training launch with M8 config, live telemetry simulation, TrainingResult & Module 9 FederationHandoff packaging).
- `modelManagement.test.js`: 3 tests passing (Approved models retrieval, model detail inspection, missing model rejection).
- `localInference.test.js`: 2 tests passing (Local inference execution with zero-egress certificate, missing model rejection).

**Total: 24 passed, 0 failed.**

---

## 4. How to Run Locally

### Start Vite Development Server
```bash
cd frontend/hospital-desktop
npm run dev
```
Workstation UI will be accessible at `http://localhost:5174/`.

### Run Production Build
```bash
npm run build
```
Generates optimized production bundle in `dist/`.
