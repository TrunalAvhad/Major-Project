import test from 'node:test';
import assert from 'node:assert/strict';
import resourceService from '../services/resourceService.js';
import trainingService from '../services/trainingService.js';

test('Module 7 Orchestration: Start training with Module 8 generated TrainingConfig', async () => {
  const hw = await resourceService.evaluateHardware();
  const datasetProfile = { id: 'DS-RAD-PNEUMONIA-01', valid_samples: 5840 };
  const recResult = await resourceService.getTrainingRecommendations(datasetProfile, hw);
  const selectedRec = recResult.recommendations[0];

  const config = resourceService.generateTrainingConfig(
    selectedRec,
    'DS-RAD-PNEUMONIA-01',
    'HOSP_000001',
    'USR_h7c2d9e4a1b0'
  );

  const session = await trainingService.startTraining(config);
  assert.ok(session);
  assert.equal(session.session_id, config.session_id);
  assert.equal(session.status, 'INITIALIZING');
  assert.equal(session.total_epochs, config.hyperparameters.epochs);
});

test('Module 7 Orchestration: Execution simulation produces valid TrainingResult and Module 9 FederationHandoff', async () => {
  let intermediateSteps = 0;

  const result = await trainingService.runTrainingSimulation((progress) => {
    intermediateSteps++;
    assert.ok(progress.current_epoch >= 1);
    assert.ok(progress.train_loss > 0);
    assert.ok(progress.val_acc >= 0 && progress.val_acc <= 1);
    assert.ok(progress.vram_used_mb > 0);
  });

  assert.ok(intermediateSteps > 0);
  assert.ok(result);
  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.model_architecture, 'ResNet18');
  assert.ok(result.metrics.val_accuracy > 0.85);
  assert.ok(result.metrics.roc_auc > 0.9);

  // Checkpoint validation
  assert.ok(result.checkpoint.local_path);
  assert.ok(result.checkpoint.sha256_hash);

  // Resource statistics from Module 8
  assert.ok(result.resource_statistics.peak_vram_mb > 0);
  assert.equal(result.resource_statistics.oom_events, 0);

  // Module 9 Federation Handoff readiness
  assert.equal(result.federation_handoff.ready_for_module_9, true);
  assert.equal(result.federation_handoff.update_type, 'WEIGHT_DELTA_TENSORS');
  assert.equal(result.federation_handoff.num_examples, 4192);
  assert.match(result.federation_handoff.privacy_guarantee, /Zero raw images/);
});

test('Module 7 Orchestration: Reject starting training without configuration', async () => {
  await assert.rejects(
    async () => {
      await trainingService.startTraining(null);
    },
    (err) => {
      assert.match(err.message, /CONFIG_ERROR/);
      return true;
    }
  );
});
