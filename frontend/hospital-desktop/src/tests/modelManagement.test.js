import test from 'node:test';
import assert from 'node:assert/strict';
import modelService from '../services/modelService.js';

test('Module 6 Integration: Retrieve approved local models', async () => {
  const models = await modelService.getApprovedModels();
  assert.ok(Array.isArray(models));
  assert.ok(models.length >= 4);

  const resnet = models.find((m) => m.architecture === 'ResNet18');
  assert.ok(resnet);
  assert.equal(resnet.compatibility_status, 'FULLY_COMPATIBLE');
  assert.equal(resnet.num_classes, 3);
  assert.ok(resnet.sha256_checksum);

  const effb0 = models.find((m) => m.architecture === 'EfficientNet-B0');
  assert.ok(effb0);
  assert.equal(effb0.approved_by_consortium, true);
});

test('Module 6 Integration: Get model by ID and verify integrity details', async () => {
  const model = await modelService.getModelById('MOD-RESNET18-RAD');
  assert.equal(model.name, 'ResNet-18 (Clinical Radiomics Edition)');
  assert.equal(model.input_shape, '[B, 3, 224, 224]');
  assert.equal(model.class_mapping[0], 'NORMAL');
  assert.equal(model.class_mapping[1], 'BACTERIAL_PNEUMONIA');
  assert.equal(model.class_mapping[2], 'VIRAL_PNEUMONIA');
});

test('Module 6 Integration: Reject non-registered model query', async () => {
  await assert.rejects(
    async () => {
      await modelService.getModelById('MOD-UNREGISTERED-99');
    },
    (err) => {
      assert.match(err.message, /MODEL_NOT_FOUND/);
      return true;
    }
  );
});
