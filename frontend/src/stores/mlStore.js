import { create } from 'zustand';
import ml from '../services/mlClient';
import datasetService from '../services/datasetService';
import preprocessingService from '../services/preprocessingService';
import resourceService from '../services/resourceService';
import trainingService from '../services/trainingService';
import modelService from '../services/modelService';
import apiService from '../services/apiService';
import { emptyResource, loadResource } from './resource';

/**
 * Hospital-side ML state, backed by the local ML service on this machine. The operator
 * only locates a dataset; inspection (M4), preprocessing (M5) and resource-aware
 * recommendations (M8) then run automatically. Training (M8 -> M7) starts when the operator
 * picks a configuration, or when the hospital joins a federation round.
 */

// Per-hospital browser keys: another hospital signing in on this browser starts clean.
const keyFor = (name, hospitalId) => `medfl_${name}:${hospitalId}`;
const saved = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch { /* storage unavailable */ } },
};

const IDLE_PIPELINE = { running: false, step: null, job: null, error: null };
const initial = {
  hospitalId: null,
  serviceStatus: 'unknown',   // unknown | online | offline
  hardware: null,
  hardwareError: null,
  datasets: [],
  activeDataset: null,
  pipeline: IDLE_PIPELINE,
  // { key, choice } for a recommendation, { key, architecture[, batch_size, epochs] } for an alternative/manual.
  selection: null,            // never pre-selected
  trainingJob: null,
  trainingError: null,
  lastRunId: null,
  linkedRequestId: '',
  runs: emptyResource([]),    // training history (all architectures)
  models: emptyResource([]),  // Module 6 models available for inference
};

let pollTimer = null;
let reported = { epochs: -1, status: null };

export const useMLStore = create((set, get) => {
  const isCurrent = (session) => get().session === session;

  // Aggregate progress only (never data) for a linked consortium training request.
  const reportProgress = (job) => {
    const requestId = job?.meta?.request_id;
    if (!requestId) return;
    const last = job.epochs[job.epochs.length - 1];
    const done = job.status === 'succeeded';
    if (!done && (!last || reported.epochs === job.epochs.length)) return;
    if (done && reported.status === 'COMPLETED') return;
    const result = job.result?.result;
    const body = done
      ? {
          status: 'COMPLETED', current_epoch: result.epochs_run, total_epochs: result.epochs_run,
          loss: result.validation_metrics?.loss ?? null, accuracy: result.validation_metrics?.accuracy ?? null,
        }
      : {
          status: 'TRAINING', current_epoch: last.epoch, total_epochs: last.total_epochs,
          loss: last.val_loss ?? last.train_loss, accuracy: last.val_acc ?? last.train_acc,
        };
    reported = { epochs: job.epochs.length, status: body.status };
    apiService.reportTrainingProgress(requestId, body).catch((e) => console.warn('Progress report failed:', e.message));
  };

  // Follows the training job every 2 s, whichever screen is open.
  const poll = () => {
    clearTimeout(pollTimer);
    const job = get().trainingJob;
    if (!job || job.status !== 'running') return;
    const session = get().session;
    pollTimer = setTimeout(async () => {
      try {
        const next = await trainingService.getJob(job.job_id);
        if (!isCurrent(session)) return;
        set({ trainingJob: next });
        reportProgress(next);
        if (next.status === 'succeeded') {
          set({ lastRunId: next.result.model_id });
          get().refreshHardware();
          get().refreshRuns();
          get().refreshModels();
        }
        if (next.status === 'failed') set({ trainingError: next.error });
        poll();
      } catch (e) {
        if (isCurrent(session)) set({ trainingError: e.message });
      }
    }, 2000);
  };

  const onJob = (step) => (job) => set((s) => ({ pipeline: { ...s.pipeline, step, job } }));

  /** Runs the remaining steps for a dataset, starting at `from`. */
  const continuePipeline = async (datasetId, from, preprocessConfig) => {
    const steps = ['preprocess', 'recommend'];
    let summary = null;
    for (const step of steps.slice(steps.indexOf(from))) {
      set((s) => ({ pipeline: { ...s.pipeline, step, job: null } }));
      if (step === 'preprocess') {
        summary = await preprocessingService.runPreprocessing(
          datasetId, preprocessConfig || preprocessingService.getDefaultConfig(), onJob(step));
        set({ activeDataset: summary });
      } else {
        const recs = await resourceService.getTrainingRecommendations(datasetId, onJob(step));
        set((s) => ({
          activeDataset: s.activeDataset?.dataset_id === datasetId ? { ...s.activeDataset, recommendations: recs } : s.activeDataset,
          selection: null, // the operator must pick one explicitly
        }));
      }
    }
    return summary;
  };

  const runGuarded = async (fn) => {
    const session = get().session;
    set({ pipeline: { running: true, step: null, job: null, error: null } });
    try {
      await fn();
      if (isCurrent(session)) set({ pipeline: { ...IDLE_PIPELINE, step: 'done' } });
    } catch (e) {
      if (isCurrent(session)) set((s) => ({ pipeline: { ...s.pipeline, running: false, error: e.message } }));
    } finally {
      if (isCurrent(session)) get().refreshDatasets();
    }
  };

  return {
    ...initial,
    session: 0,

    /** Called once a hospital operator is signed in. */
    connect: async (hospitalId) => {
      const session = get().session;
      set({ hospitalId });
      try {
        await ml.health();
      } catch {
        if (isCurrent(session)) set({ serviceStatus: 'offline' });
        return;
      }
      if (!isCurrent(session)) return;
      set({ serviceStatus: 'online' });
      const { refreshDatasets, refreshHardware, selectDataset, trackTrainingJob } = get();
      refreshDatasets();
      refreshHardware();
      const datasetId = saved.get(keyFor('active_dataset', hospitalId));
      // A failed restore (e.g. dataset removed) must not break the session.
      if (datasetId) selectDataset(datasetId).catch(() => {});
      // Resume following a training job started before a page reload.
      const jobId = saved.get(keyFor('training_job', hospitalId));
      if (jobId) {
        trainingService.getJob(jobId)
          .then((job) => isCurrent(session) && trackTrainingJob(job))
          .catch(() => saved.set(keyFor('training_job', hospitalId), null)); // the service no longer knows it
      }
    },

    /** Logout / another user signing in: drop everything and stop polling. */
    reset: () => {
      clearTimeout(pollTimer);
      reported = { epochs: -1, status: null };
      set((s) => ({ ...initial, session: s.session + 1 }));
    },

    refreshDatasets: async () => {
      const session = get().session;
      try {
        const datasets = await datasetService.listDatasets();
        if (isCurrent(session)) set({ datasets });
      } catch { /* service offline: shown via serviceStatus */ }
    },

    refreshHardware: async () => {
      const session = get().session;
      set({ hardwareError: null });
      try {
        const hardware = await resourceService.evaluateHardware();
        if (isCurrent(session)) set({ hardware });
      } catch (e) {
        if (isCurrent(session)) set({ hardwareError: e.message });
      }
    },

    refreshRuns: () => loadResource(set, get, 'runs', () => trainingService.getTrainingHistory()),
    refreshModels: () => loadResource(set, get, 'models', () => modelService.getLocalModels()),

    selectDataset: async (datasetId) => {
      const summary = datasetId ? await datasetService.getDataset(datasetId) : null;
      set({ activeDataset: summary, selection: null });
      saved.set(keyFor('active_dataset', get().hospitalId), summary?.dataset_id);
      return summary;
    },

    /** Locate -> M4 inspect -> M5 preprocess -> M8 recommend, all local. */
    runPipeline: (path, labelSource = null) => runGuarded(async () => {
      set((s) => ({ pipeline: { ...s.pipeline, step: 'inspect' } }));
      const summary = await datasetService.inspectDatasetPath(path, onJob('inspect'), labelSource);
      set({ activeDataset: summary });
      saved.set(keyFor('active_dataset', get().hospitalId), summary.dataset_id);
      // One class is never trainable; usually the labels are in a CSV, not in class folders.
      const classes = summary.profile?.classes || [];
      if (summary.profile?.dataset_type === 'Image' && classes.length < 2) {
        throw new Error(`Module 4 found ${classes.length} class(es)${classes.length ? ` (${classes.join(', ')})` : ''}; training needs at least two. `
          + (labelSource ? 'Check the class mapping of the metadata CSV.'
            : 'Classes are taken from folder names. If the labels are in a CSV instead, tick "Labels come from a metadata CSV", '
              + 'choose the CSV and its columns, then run the pipeline again.'));
      }
      await continuePipeline(summary.dataset_id, 'preprocess');
    }),

    /** Re-run M5 with non-default options (then M8 recommend again). */
    rerunPreprocessing: (config) => runGuarded(
      () => continuePipeline(get().activeDataset.dataset_id, 'preprocess', config)),

    rerunRecommendations: () => runGuarded(
      () => continuePipeline(get().activeDataset.dataset_id, 'recommend')),

    setSelection: (selection) => set({ selection }),
    setLinkedRequestId: (linkedRequestId) => set({ linkedRequestId }),
    setLastRunId: (lastRunId) => set({ lastRunId }),

    startTraining: async () => {
      const { selection, activeDataset, linkedRequestId, trackTrainingJob } = get();
      if (!selection) throw new Error('Select a training configuration first.');
      const job = await trainingService.startTraining(activeDataset.dataset_id, selection, linkedRequestId || null);
      trackTrainingJob(job);
      return job;
    },

    /** Makes a started training job (local or federated) the one the Training Monitor follows. */
    trackTrainingJob: (job) => {
      reported = { epochs: -1, status: null };
      set({ trainingJob: job, trainingError: null });
      saved.set(keyFor('training_job', get().hospitalId), job.job_id);
      poll();
    },

    stopTraining: async () => {
      const job = get().trainingJob;
      if (!job) return;
      set({ trainingJob: await trainingService.stopTraining(job.job_id) });
      poll(); // until the process has actually exited
    },
  };
});
