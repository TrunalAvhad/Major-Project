/**
 * Module 6: Model Management Service Adapter
 * 
 * Provides read-only access to local approved models approved for
 * local training and local inference in the hospital environment.
 */

const APPROVED_LOCAL_MODELS = [
  {
    id: 'MOD-RESNET18-RAD',
    name: 'ResNet-18 (Clinical Radiomics Edition)',
    architecture: 'ResNet18',
    version: 'v2.1.0-approved',
    framework: 'PyTorch 2.2.1',
    input_shape: '[B, 3, 224, 224]',
    num_classes: 3,
    class_mapping: {
      0: 'NORMAL',
      1: 'BACTERIAL_PNEUMONIA',
      2: 'VIRAL_PNEUMONIA'
    },
    parameter_count: '11.17M',
    model_size_mb: 44.7,
    checkpoint_status: 'LOCAL_STORAGE_VERIFIED',
    compatibility_status: 'FULLY_COMPATIBLE',
    sha256_checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    approved_by_consortium: true,
    approval_date: '2026-08-15',
    target_task: 'Pediatric Radiograph Classification'
  },
  {
    id: 'MOD-EFFB0-PEDIATRIC',
    name: 'EfficientNet-B0 (Compound Scaling)',
    architecture: 'EfficientNet-B0',
    version: 'v1.4.0-approved',
    framework: 'PyTorch 2.2.1',
    input_shape: '[B, 3, 224, 224]',
    num_classes: 3,
    class_mapping: {
      0: 'NORMAL',
      1: 'BACTERIAL_PNEUMONIA',
      2: 'VIRAL_PNEUMONIA'
    },
    parameter_count: '5.29M',
    model_size_mb: 21.4,
    checkpoint_status: 'LOCAL_STORAGE_VERIFIED',
    compatibility_status: 'FULLY_COMPATIBLE',
    sha256_checksum: 'a8f5f167f44f4964e6c998dee827110c01759f37ff8d9294e672da5f9b179e8e',
    approved_by_consortium: true,
    approval_date: '2026-08-20',
    target_task: 'Pediatric Radiograph Classification'
  },
  {
    id: 'MOD-DENSENET121-RAD',
    name: 'DenseNet-121 (Dense Feature Reuse)',
    architecture: 'DenseNet121',
    version: 'v1.1.2-approved',
    framework: 'PyTorch 2.2.1',
    input_shape: '[B, 3, 224, 224]',
    num_classes: 3,
    class_mapping: {
      0: 'NORMAL',
      1: 'BACTERIAL_PNEUMONIA',
      2: 'VIRAL_PNEUMONIA'
    },
    parameter_count: '7.98M',
    model_size_mb: 32.2,
    checkpoint_status: 'LOCAL_STORAGE_VERIFIED',
    compatibility_status: 'FULLY_COMPATIBLE',
    sha256_checksum: '7d793037a0760186574b0282f2f435e70d71686e9e7b233a1e1a533bfd3f9f9b',
    approved_by_consortium: true,
    approval_date: '2026-07-28',
    target_task: 'Multi-organ Lesion Screening'
  },
  {
    id: 'MOD-MOBILENETV3-LIGHT',
    name: 'MobileNetV3-Large (High-Throughput / Edge)',
    architecture: 'MobileNetV3-Large',
    version: 'v1.0.1-approved',
    framework: 'PyTorch 2.2.1',
    input_shape: '[B, 3, 224, 224]',
    num_classes: 3,
    class_mapping: {
      0: 'NORMAL',
      1: 'BACTERIAL_PNEUMONIA',
      2: 'VIRAL_PNEUMONIA'
    },
    parameter_count: '4.20M',
    model_size_mb: 16.8,
    checkpoint_status: 'LOCAL_STORAGE_VERIFIED',
    compatibility_status: 'FULLY_COMPATIBLE',
    sha256_checksum: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    approved_by_consortium: true,
    approval_date: '2026-08-01',
    target_task: 'Emergency Bedside Rapid Triage'
  }
];

class ModelService {
  async getApprovedModels() {
    return [...APPROVED_LOCAL_MODELS];
  }

  async getModelById(modelId) {
    const found = APPROVED_LOCAL_MODELS.find((m) => m.id === modelId);
    if (!found) {
      throw new Error(`MODEL_NOT_FOUND: Approved model ${modelId} is not registered locally.`);
    }
    return found;
  }
}

export const modelService = new ModelService();
export default modelService;
