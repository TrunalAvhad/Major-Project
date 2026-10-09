/**
 * MOCK DATA - demonstration content for the Experiments screen (Module 20 is not
 * implemented). Nothing here comes from a real hospital, training run or federation
 * round. Screens read it through useMockStore (src/stores/mockStore.js).
 */

export const experiments = [
  {
    id: 'EXP-2025-084',
    name: 'Pan-Cancer Pulmo Nodule 3D Segmentation',
    target: 'LIDC-IDRI Enclave Cohort',
    arch: 'EfficientNet-B0 + 3D UNet',
    modality: 'CT / DICOM 3D',
    quorum: '8/8 Hospitals',
    quorumHealthy: true,
    strategy: 'FedAvg Aggregation • DP ε=1.24 • δ=1e-5',
    rounds: '14/20',
    progress: 70,
    metric: 'Dice: 0.914 AUC: 0.978',
    status: 'RUNNING',
    pi: 'Dr. E. Rostova'
  },
  {
    id: 'EXP-2025-079',
    name: 'Multi-Center Glioblastoma MRI Sub-Region Grading',
    target: 'BraTS-FL Multimodal Benchmark',
    arch: 'ResNet-50-FL (3D)',
    modality: 'Brain MRI',
    quorum: '8/8 Nodes',
    quorumHealthy: true,
    strategy: 'FedProx (μ=0.01) • DP ε=1.10',
    rounds: '25/25',
    progress: 100,
    metric: 'Dice: 0.892 Hausdorff: 4.2mm',
    status: 'COMPLETED',
    pi: 'Prof. M. L...'
  },
  {
    id: 'EXP-2025-072',
    name: 'Pediatric Pneumonia Radiograph Density Detector',
    target: 'Ped-X Consortium Trial',
    arch: 'DenseNet-121',
    modality: 'Chest X-Ray',
    quorum: '6/8 Nodes',
    quorumHealthy: false,
    strategy: 'SCAFFOLD • DP ε=0.95',
    rounds: '9/15',
    progress: 60,
    metric: 'Acc: 91.2% Sens: 93.8%',
    status: 'PAUSED',
    pi: 'Dr. A. O\'C...'
  },
  {
    id: 'EXP-2025-068',
    name: 'Prostate Glandular Histopathology WSI Attention',
    target: 'Gleason Grade Scoring Network',
    arch: 'Swin-UNETR-FL',
    modality: 'WSI Gigapixel',
    quorum: '5/8 Nodes',
    quorumHealthy: true,
    strategy: 'FedOpt (Adam) • DP ε=1.45',
    rounds: '30/30',
    progress: 100,
    metric: 'F1: 0.934 Kappa: 0.88',
    status: 'COMPLETED',
    pi: 'Dr. K. Tar...'
  },
  {
    id: 'EXP-2025-061',
    name: 'Cardiac Ventricular Ejection Fraction Estimation',
    target: 'Short-Axis Cine Temporal FL',
    arch: '3D ResNet Temporal',
    modality: 'Cine-MRI',
    quorum: '8/8 Nodes',
    quorumHealthy: true,
    strategy: 'FedAvg • DP ε=0.88',
    rounds: '18/18',
    progress: 100,
    metric: 'MSE: 0.018 R²: 0.941',
    status: 'COMPLETED',
    pi: 'Dr. H. Ch...'
  },
  {
    id: 'EXP-2025-055',
    name: 'Mammography Microcalcification Anomaly Screening',
    target: 'Archived Consortium Baseline',
    arch: 'ViT-B/16',
    modality: 'Mammography',
    quorum: '7/8 Nodes',
    quorumHealthy: true,
    strategy: 'FedAvg • DP ε=1.30',
    rounds: '20/20',
    progress: 100,
    metric: 'AUC: 0.965 F1: 0.902',
    status: 'ARCHIVED',
    pi: 'Dr. S. Var...'
  }
];

// --- HospitalsView ---
