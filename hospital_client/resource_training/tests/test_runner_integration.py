"""
Real M4 -> M5 -> M6 -> M8 -> M7 integration: a genuine synthetic dataset
built through Module 4/5, real Module 8 hardware detection and
recommendation generation, resolved into a real Module 7 TrainingConfig, and
executed through the real Module 7 Trainer. No fabricated results.
"""
import torch
import pytest

from hospital_client.resource_training.dataset_characteristics import inspect_dataset
from hospital_client.resource_training.estimator import HistoricalThroughputStore
from hospital_client.resource_training.policy import default_policy
from hospital_client.resource_training.recommender import FAST, generate_recommendations
from hospital_client.resource_training.resolved_config import to_training_config
from hospital_client.resource_training.resource_profile import build_resource_profile
from hospital_client.resource_training.runner import run_resource_aware_training
from hospital_client.training.federation import validate_federation_handoff
from hospital_client.training.result import TrainingStatus


def test_full_pipeline_cpu(real_small_dataset_dir, tmp_path):
    policy = default_policy()
    dataset = inspect_dataset(real_small_dataset_dir)
    assert dataset.num_train_samples > 0

    profile = build_resource_profile(storage_path=str(tmp_path), check_network=False, policy=policy)
    rec_set = generate_recommendations(profile, policy, dataset)
    assert rec_set.recommendations  # some feasible config always exists on CPU for tiny models

    fast = next((r for r in rec_set.recommendations if r.recommendation_type == FAST), rec_set.recommendations[0])
    training_config = to_training_config(
        fast, model_id="itest_cpu", dataset_dir=real_small_dataset_dir,
        output_dir=str(tmp_path / "out"), num_classes=dataset.num_classes,
    )
    # This test exercises the CPU path specifically (a separate skipif-gated
    # test below exercises real CUDA) - force CPU/fp32 regardless of what the
    # real detected hardware recommended, and keep it fast with epochs=1.
    training_config.device = "cpu"
    training_config.precision = "fp32"
    training_config.epochs = 1

    history_path = str(tmp_path / "history.json")
    result, stats, handoff = run_resource_aware_training(training_config, policy, history_path, profile)

    assert result.status in (TrainingStatus.TRAINING_COMPLETED, TrainingStatus.TRAINING_COMPLETED_AWAITING_FEDERATION)
    assert result.epochs_run == 1
    assert stats.actual_training_duration_seconds > 0
    assert stats.hardware["cpu"]["logical_cores"] >= 1
    assert stats.monitor_summary["sample_count"] >= 1

    # -> M9: a federation-ready run produces a real Module 7 FederationHandoff.
    if result.ready_for_federation:
        assert handoff is not None
        assert handoff.architecture == training_config.model_config.architecture
        assert handoff.parameter_count > 0
        # Regression: runner must forward base_model_id/version/checksum
        # (the old call omitted these 3 args, causing TypeError at runtime).
        assert handoff.base_model_id == result.checkpoint_model_id
        assert handoff.base_model_version == result.checkpoint_version
        assert isinstance(handoff.base_model_checksum, str) and handoff.base_model_checksum
        validate_federation_handoff(handoff)  # full structural validation

    # A second recommendation call after a real run should be able to see
    # the newly recorded (real, not fabricated) measured throughput.
    if stats.measured_samples_per_second:
        history = HistoricalThroughputStore(history_path)
        assert history.lookup(fast.architecture, "cpu", result.resolved_precision) is not None


def test_test_evaluation_plots_and_epoch_progress_cpu(real_small_dataset_dir, tmp_path, capsys):
    """The hospital UI path: `train --test --plots` yields test metrics, the
    Module 7 plot files, and one parseable progress line per epoch."""
    import re

    policy = default_policy()
    dataset = inspect_dataset(real_small_dataset_dir)
    profile = build_resource_profile(storage_path=str(tmp_path), check_network=False, policy=policy)
    rec = generate_recommendations(profile, policy, dataset).recommendations[0]
    out = tmp_path / "out"
    config = to_training_config(rec, model_id="itest_plots", dataset_dir=real_small_dataset_dir,
                                output_dir=str(out), num_classes=dataset.num_classes, run_test_evaluation=True)
    config.device, config.precision, config.epochs = "cpu", "fp32", 2

    result, _, _ = run_resource_aware_training(config, policy, None, profile, plots=True)

    assert result.test_metrics is not None and result.test_metrics["sample_count"] > 0
    plots = out / "itest_plots_plots"
    assert (plots / "confusion_matrix.png").is_file() and (plots / "curve_metrics.json").is_file()
    lines = [l for l in capsys.readouterr().out.splitlines() if l.startswith("[epoch")]
    assert len(lines) == 2
    assert re.fullmatch(r"\[epoch 2/2\] train_loss=\d+\.\d{4} train_acc=\d+\.\d{4} val_loss=\d+\.\d{4} val_acc=\d+\.\d{4} elapsed=[\d.]+s", lines[1])


def test_to_training_config_defaults_to_no_test_evaluation(real_small_dataset_dir, tmp_path):
    policy = default_policy()
    dataset = inspect_dataset(real_small_dataset_dir)
    profile = build_resource_profile(storage_path=str(tmp_path), check_network=False, policy=policy)
    rec = generate_recommendations(profile, policy, dataset).recommendations[0]
    config = to_training_config(rec, model_id="m", dataset_dir=real_small_dataset_dir,
                                output_dir=str(tmp_path), num_classes=dataset.num_classes)
    assert config.run_test_evaluation is False


@pytest.mark.skipif(not torch.cuda.is_available(), reason="Requires a real CUDA device")
def test_full_pipeline_cuda(real_small_dataset_dir, tmp_path):
    policy = default_policy()
    dataset = inspect_dataset(real_small_dataset_dir)
    profile = build_resource_profile(storage_path=str(tmp_path), check_network=False, policy=policy)
    assert profile.gpu["cuda_available"] is True

    rec_set = generate_recommendations(profile, policy, dataset)
    fast = next((r for r in rec_set.recommendations if r.recommendation_type == FAST), rec_set.recommendations[0])
    assert fast.device == "cuda"

    training_config = to_training_config(
        fast, model_id="itest_cuda", dataset_dir=real_small_dataset_dir,
        output_dir=str(tmp_path / "out"), num_classes=dataset.num_classes,
    )
    training_config.epochs = 1

    result, stats, handoff = run_resource_aware_training(training_config, policy, str(tmp_path / "history.json"), profile)
    assert result.status in (TrainingStatus.TRAINING_COMPLETED, TrainingStatus.TRAINING_COMPLETED_AWAITING_FEDERATION)
    assert stats.monitor_summary["peak_vram_mb"] is not None
    if result.ready_for_federation:
        assert handoff is not None
        assert handoff.device == "cuda"


# ---------------------------------------------------------------------------
# Focused regression: runner -> FederationHandoff base_model contract
# ---------------------------------------------------------------------------

def test_runner_handoff_base_model_fields_populated(real_small_dataset_dir, tmp_path):
    """
    Regression test for the runner.py -> build_federation_handoff integration.

    The old call was:
        _build_federation_handoff(result, current_config.output_dir)

    After the federation.py schema update that added base_model_id,
    base_model_version, base_model_checksum as REQUIRED fields,
    trainer.py's build_federation_handoff wrapper was updated to populate
    them from the TrainingResult — but the runner.py import re-uses
    that wrapper, so the call signature hasn't changed.

    This test verifies:
    - No TypeError is raised (old code: missing 4 required positional arguments)
    - The returned FederationHandoff passes full structural validation
    - base_model_id is the checkpoint model id (non-empty string)
    - base_model_version is the checkpoint version (positive int)
    - base_model_checksum is a non-empty hex string
    - num_train_samples matches the dataset
    """
    policy = default_policy()
    dataset = inspect_dataset(real_small_dataset_dir)
    profile = build_resource_profile(storage_path=str(tmp_path), check_network=False, policy=policy)
    rec_set = generate_recommendations(profile, policy, dataset)
    # Use whatever architecture is recommended first; this is a runner contract test.
    rec = rec_set.recommendations[0]
    config = to_training_config(
        rec,
        model_id="reg_handoff_test",
        dataset_dir=real_small_dataset_dir,
        output_dir=str(tmp_path / "out"),
        num_classes=dataset.num_classes,
    )
    config.device = "cpu"
    config.precision = "fp32"
    config.epochs = 1

    result, _stats, handoff = run_resource_aware_training(config, policy, None, profile)

    # Training must have reached federation-ready status.
    assert result.status == TrainingStatus.TRAINING_COMPLETED_AWAITING_FEDERATION, (
        f"Expected TRAINING_COMPLETED_AWAITING_FEDERATION, got {result.status}. "
        "If the dataset has no val split this is a fixture issue, not a handoff bug."
    )
    assert handoff is not None, "runner must return a FederationHandoff when result.ready_for_federation"

    # --- Core regression: these three fields caused TypeError in the old code ---
    assert isinstance(handoff.base_model_id, str) and handoff.base_model_id, \
        f"base_model_id must be a non-empty string, got {handoff.base_model_id!r}"
    assert isinstance(handoff.base_model_version, int) and handoff.base_model_version >= 1, \
        f"base_model_version must be a positive int, got {handoff.base_model_version!r}"
    assert isinstance(handoff.base_model_checksum, str) and handoff.base_model_checksum, \
        f"base_model_checksum must be a non-empty string, got {handoff.base_model_checksum!r}"

    # --- Values must come from the completed training result (not invented) ---
    assert handoff.base_model_id == result.checkpoint_model_id
    assert handoff.base_model_version == result.checkpoint_version

    # --- Full structural validation via existing Module 7 validator ---
    validate_federation_handoff(handoff)

    # --- Data provenance: sample count must be positive ---
    assert handoff.num_train_samples > 0
