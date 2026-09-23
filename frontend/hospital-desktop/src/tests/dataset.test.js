import test from 'node:test';
import assert from 'node:assert/strict';
import datasetService from '../services/datasetService.js';

test('Module 4 Integration: Retrieve local clinical datasets', async () => {
  const datasets = await datasetService.getLocalDatasets();
  assert.ok(Array.isArray(datasets));
  assert.ok(datasets.length >= 2);

  const primary = datasets[0];
  assert.equal(primary.id, 'DS-RAD-PNEUMONIA-01');
  assert.equal(primary.modality, 'PNG / JPEG (Radiographs)');
  assert.equal(primary.total_samples, 5856);
  assert.equal(primary.valid_samples, 5840);
  assert.equal(primary.corrupted_samples, 16);
});

test('Module 4 Integration: Dataset splits and class statistics', async () => {
  const datasets = await datasetService.getLocalDatasets();
  const ds = datasets[0];

  assert.ok(ds.splits.train.count > 0);
  assert.ok(ds.splits.val.count > 0);
  assert.ok(ds.splits.test.count > 0);
  assert.equal(ds.classes.length, 3);
  assert.equal(ds.classes[0].name, 'NORMAL');
  assert.equal(ds.classes[1].name, 'BACTERIAL_PNEUMONIA');
  assert.equal(ds.classes[2].name, 'VIRAL_PNEUMONIA');
});

test('Module 4 Integration: Inspect local directory path', async () => {
  const inspected = await datasetService.inspectDatasetPath('C:\\ClinicalData\\Radiology\\ChestXRay_Pediatric_v2');
  assert.ok(inspected);
  assert.equal(inspected.id, 'DS-RAD-PNEUMONIA-01');
  assert.equal(inspected.status, 'INSPECTED_AND_READY');
  assert.equal(inspected.tabular_statistics.patient_overlap_between_splits, 0);
});

test('Module 4 Integration: Reject empty folder path with validation error', async () => {
  await assert.rejects(
    async () => {
      await datasetService.inspectDatasetPath('');
    },
    (err) => {
      assert.match(err.message, /DATASET_PATH_INVALID/);
      return true;
    }
  );
});
