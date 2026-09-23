# Module 2: Researcher & Consortium Admin Desktop Application

**Project:** Secure and Privacy-Preserving Federated Deep Learning Training Platform for Medical Imaging  
**Role / Owner:** Member 4 (Frontend + Desktop + Mobile + Communication)  
**Location:** `frontend/researcher-desktop/`  
**Status:** Functionally Complete & Verified (`[x] Completed`)

> For the comprehensive specification and system-wide documentation, see the root [module2_readme.md](../../module2_readme.md).

---

## 1. Module Overview

Module 2 provides the primary command center for clinical lead investigators and consortium administrators:
- **Consortium Telemetry:** Real-time quorum monitoring across 8 participating hospital nodes.
- **Federated Training Center:** Multi-round orchestration, parameter aggregation monitoring, and emergency session halt.
- **Security & Byzantine Defense:** 2D principal component vector space projection of client weight updates and cumulative Differential Privacy budget gauge ($\epsilon=1.24/1.50$, $\delta=10^{-5}$).
- **Cryptographic Audit Ledger:** Merkle root verification and syntax-highlighted JSON audit payload inspector.
- **Model Registry & Radar Chart:** Comparative Architectural Matrix and 5-axis trade-off evaluation.
- **Consortium Access Request Wizard:** Multi-step clinical application form (`SEC-792-REQ`).

---

## 2. Quick Start

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Runs at `http://localhost:5173`.

### Production Build & Linting
```bash
npm run build
npm run lint
```

---

## 3. Configuration & API Integration

The application reads its backend API endpoint from `.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```
Module 2 is fully integrated with Module 1's authentication and RBAC backend endpoints while maintaining resilient mock fallbacks for standalone demonstration.
