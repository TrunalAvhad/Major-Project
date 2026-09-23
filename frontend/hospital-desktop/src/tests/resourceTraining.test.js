import test from 'node:test';
import assert from 'node:assert/strict';
import resourceService from '../services/resourceService.js';

test('Module 8 Integration: Hardware profiling returns valid GPU/CUDA specifications', async () => {
  const hw = await resourceService.evaluateHardware();
  assert.equal(hw.cuda_available, true);
  assert.ok(hw.device_name.includes('RTX 3080 Ti'));
  assert.ok(hw.total_vram_mb >= 8000);
  assert.equal(hw.cuda_version, '12.2');
  assert.ok(hw.cpu_cores >= 8);
});

test('Module 8 Integration: Produces exactly Three Distinct Training Recommendations', async () => {
  const hw = await resourceService.evaluateHardware();
  const datasetProfile = { id: 'DS-RAD-PNEUMONIA-01', valid_samples: 5840 };
  
  const recResult = await resourceService.getTrainingRecommendations(datasetProfile, hw);
  assert.ok(recResult);
  assert.ok(Array.isArray(recResult.recommendations));
  assert.equal(recResult.recommendations.length, 3);

  const [balanced, highCapacity, fast] = recResult.recommendations;

  // 1. Balanced / Recommended
  assert.equal(balanced.type, 'BALANCED');
  assert.equal(balanced.title, 'Recommended / Balanced');
  assert.equal(balanced.architecture, 'ResNet18');
  assert.equal(balanced.safety_status, 'CERTIFIED_SAFE');
  assert.ok(balanced.batch_size > 0);
  assert.ok(balanced.epochs > 0);
  assert.ok(balanced.estimated_time_range);

  // 2. High-Capacity / More Time
  assert.equal(highCapacity.type, 'HIGH_CAPACITY');
  assert.equal(highCapacity.title, 'High-Capacity / More Time');
  assert.equal(highCapacity.architecture, 'EfficientNet-B0');
  assert.ok(highCapacity.estimated_time_range);

  // 3. Fast / Lower Resource
  assert.equal(fast.type, 'FAST');
  assert.equal(fast.title, 'Fast / Lower Resource');
  assert.equal(fast.architecture, 'MobileNetV3-Large');
  assert.ok(fast.estimated_time_range);
});

test('Module 8 Integration: EfficientNet-B0 role is dynamically evaluated and not hardcoded', async () => {
  const datasetProfile = { id: 'DS-RAD-PNEUMONIA-01', valid_samples: 5840 };

  // Case 1: High VRAM hardware (12GB)
  const highVramHw = { cuda_available: true, available_vram_mb: 11000, device_name: 'RTX 3080 Ti' };
  const resHigh = await resourceService.getTrainingRecommendations(datasetProfile, highVramHw);
  assert.equal(resHigh.efficientnet_b0_role.assigned_role, 'HIGH_CAPACITY_CANDIDATE');
  assert.equal(resHigh.efficientnet_b0_role.safety_status, 'OPTIMAL');

  // Case 2: Constrained VRAM hardware (3.5GB)
  const lowVramHw = { cuda_available: true, available_vram_mb: 3500, device_name: 'GTX 1650' };
  const resLow = await resourceService.getTrainingRecommendations(datasetProfile, lowVramHw);
  assert.equal(resLow.efficientnet_b0_role.assigned_role, 'UNSAFE');
  assert.equal(resLow.efficientnet_b0_role.safety_status, 'HIGH_RISK');

  // Case 3: CPU Only
  const cpuHw = { cuda_available: false, available_vram_mb: 0, device_name: 'CPU' };
  const resCpu = await resourceService.getTrainingRecommendations(datasetProfile, cpuHw);
  assert.equal(resCpu.efficientnet_b0_role.assigned_role, 'UNSAFE');
});

test('Module 8 Integration: Generates valid Module 7 TrainingConfig schema', async () => {
  const hw = await resourceService.evaluateHardware();
  const datasetProfile = { id: 'DS-RAD-PNEUMONIA-01', valid_samples: 5840 };
  const recResult = await resourceService.getTrainingRecommendations(datasetProfile, hw);
  const selectedRec = recResult.recommendations[0]; // Balanced

  const trainingConfig = resourceService.generateTrainingConfig(
    selectedRec,
    'DS-RAD-PNEUMONIA-01',
    'HOSP_000001',
    'USR_h7c2d9e4a1b0'
  );

  assert.ok(trainingConfig.session_id.startsWith('SESS-HOSP_000001-'));
  assert.equal(trainingConfig.hospital_id, 'HOSP_000001');
  assert.equal(trainingConfig.model_id, selectedRec.model_id);
  assert.equal(trainingConfig.architecture, selectedRec.architecture);
  assert.equal(trainingConfig.hyperparameters.epochs, selectedRec.epochs);
  assert.equal(trainingConfig.hyperparameters.batch_size, selectedRec.batch_size);
  assert.equal(trainingConfig.hardware_execution.device, selectedRec.device);
  assert.equal(trainingConfig.hardware_execution.precision, selectedRec.precision);
});
