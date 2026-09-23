import test from 'node:test';
import assert from 'node:assert/strict';
import inferenceService from '../services/inferenceService.js';

test('Module 16 Integration: Run local inference with approved model and verify privacy invariant', async () => {
  const result = await inferenceService.runLocalInference('MOD-RESNET18-RAD', {
    name: 'patient_c749_chest_xray_ap.png'
  });

  assert.ok(result);
  assert.equal(result.execution_mode, 'LOCAL_CUDA_EXECUTION');
  assert.equal(result.privacy_certificate.egress_status, 'ZERO_EGRESS');
  assert.equal(result.privacy_certificate.verified, true);
  assert.ok(result.latency_ms > 0);
  assert.ok(result.top_prediction.class_label);
  assert.ok(result.top_prediction.confidence > 0.5);

  // Verify probabilities sum approximately to 1
  const sumProb = result.class_breakdown.reduce((acc, curr) => acc + curr.probability, 0);
  assert.ok(Math.abs(sumProb - 1.0) < 0.05);
});

test('Module 16 Integration: Rejects inference without model ID', async () => {
  await assert.rejects(
    async () => {
      await inferenceService.runLocalInference(null, {});
    },
    (err) => {
      assert.match(err.message, /INFERENCE_ERROR/);
      return true;
    }
  );
});
