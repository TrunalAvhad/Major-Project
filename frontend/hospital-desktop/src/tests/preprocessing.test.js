import test from 'node:test';
import assert from 'node:assert/strict';
import preprocessingService from '../services/preprocessingService.js';

test('Module 5 Integration: Default clinical preprocessing configuration', () => {
  const config = preprocessingService.getDefaultConfig('radiograph');
  assert.deepEqual(config.target_resolution, [224, 224]);
  assert.equal(config.clahe_contrast_enhancement, true);
  assert.equal(config.patient_isolated_splits, true);
  assert.equal(config.clip_limit, 2.0);
});

test('Module 5 Integration: Execute preprocessing pipeline with leakage validation', async () => {
  let progressUpdates = 0;
  const report = await preprocessingService.runPreprocessing(
    'DS-RAD-PNEUMONIA-01',
    preprocessingService.getDefaultConfig(),
    (progress) => {
      progressUpdates++;
      assert.ok(progress.step >= 1);
      assert.ok(progress.percent >= 0 && progress.percent <= 100);
    }
  );

  assert.ok(progressUpdates > 0);
  assert.equal(report.status, 'SUCCESS');
  assert.equal(report.leakage_check.passed, true);
  assert.equal(report.leakage_check.patient_overlap_detected, 0);
  assert.equal(report.leakage_check.leakage_risk, 'ZERO_LEAKAGE');
  assert.equal(report.quality_verification.valid_tensors_generated, 5840);
  assert.equal(report.quality_verification.dimensions, '3 x 224 x 224');
});

test('Module 5 Integration: Reject missing dataset ID', async () => {
  await assert.rejects(
    async () => {
      await preprocessingService.runPreprocessing(null, {});
    },
    (err) => {
      assert.match(err.message, /PREPROCESSING_ERROR/);
      return true;
    }
  );
});
