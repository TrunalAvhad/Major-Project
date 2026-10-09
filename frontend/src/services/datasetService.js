/**
 * Module 4: Dataset Ingestion and Inspection (real engine via the local ML service).
 * The dataset is only read on this machine; the UI receives the DatasetProfile summary.
 */
import ml from './mlClient';

class DatasetService {
  /** Opens a native folder picker on this machine; resolves to a path or null. */
  async browseFolder() {
    return (await ml.post('/browse-folder')).path;
  }

  /** Native file picker for a metadata CSV (image labels); resolves to a path or null. */
  async browseCsv() {
    return (await ml.post('/browse-csv')).path;
  }

  /** Columns of a metadata CSV, plus the distinct values (with counts) of labelColumn when given. */
  async readMetadataCsv(path, labelColumn) {
    return ml.post('/metadata-csv', { path, label_column: labelColumn || undefined });
  }

  async listDatasets() {
    return (await ml.get('/datasets')).datasets;
  }

  async getDataset(datasetId) {
    return ml.get(`/datasets/${datasetId}`);
  }

  /**
   * Runs `python -m hospital_client.dataset inspect <path>`; resolves to the dataset summary.
   * labelSource (optional): image labels from a metadata CSV instead of class folder names.
   */
  async inspectDatasetPath(folderPath, onJob, labelSource = null) {
    if (!folderPath || !folderPath.trim()) throw new Error('Please locate a dataset folder (or a CSV/XLS/XLSX file).');
    const job = await ml.post('/datasets/inspect', { path: folderPath.trim(), label_source: labelSource || undefined });
    return ml.waitForJob(job, onJob);
  }
}

export const datasetService = new DatasetService();
export default datasetService;
