import React, { useState } from "react";

const ModelSettings = ({ onSubmit }) => {
  const [settings, setSettings] = useState({
    learningRate: 0.00003,
    batchSize: 500,
    epochs: 400,
    earlyStop: true,
    earlyStopEpoch: 5,
    L2Penalty: 0.001,
    activationFun: "sigmoid",
    validationRatio: 5,
    EMGOutlier: 0.05,
    waveOutlierSTD: 4,
    EEGOutlierSTD: 2,
    experimentStartTime: 19,
    ZTFrequency: 2,
    // Model settings that will be left fixed for now
    layer_specs: [7, 50, 50, 3],
    momentum: true,
    momentum_gamma: 0.85,
    training_testing_ratio: 5,
    training_dataset_samples: 50 * 100,

  });

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(settings);
  };

  return (
    <div className="model-settings">
      <h3>Model Settings</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Learning Rate:
          <input type="number" step="0.00001" name="learningRate" value={settings.learningRate} onChange={handleChange} />
        </label>

        <label>
          Batch Size:
          <input type="number" name="batchSize" value={settings.batchSize} onChange={handleChange} />
        </label>

        <label>
          Epochs:
          <input type="number" name="epochs" value={settings.epochs} onChange={handleChange} />
        </label>

        <label>
          Early Stopping:
          <input type="checkbox" name="earlyStop" checked={settings.earlyStop} onChange={handleChange} />
        </label>

        <label>
          Early Stop Epoch:
          <input type="number" name="earlyStopEpoch" value={settings.earlyStopEpoch} onChange={handleChange} />
        </label>

        <label>
          L2 Penalty:
          <input type="number" step="0.0001" name="L2Penalty" value={settings.L2Penalty} onChange={handleChange} />
        </label>

        <label>
          Activation Function:
          <select name="activationFun" value={settings.activationFun} onChange={handleChange}>
            <option value="sigmoid">Sigmoid</option>
            <option value="relu">ReLU</option>
            <option value="tanh">Tanh</option>
          </select>
        </label>

        <label>
          Validation Ratio:
          <input type="number" name="validationRatio" value={settings.validationRatio} onChange={handleChange} />
        </label>

        <label>
          EMG Top Outlier:
          <input type="number" step="0.01" name="EMGOutlier" value={settings.EMGOutlier} onChange={handleChange} />
        </label>

        <label>
          Wave Length Outlier STD:
          <input type="number" name="waveOutlierSTD" value={settings.waveOutlierSTD} onChange={handleChange} />
        </label>

        <label>
          EEG Outlier STD:
          <input type="number" name="EEGOutlierSTD" value={settings.EEGOutlierSTD} onChange={handleChange} />
        </label>

        <label>
          Experiment Start Time:
          <input type="number" name="experimentStartTime" value={settings.experimentStartTime} onChange={handleChange} />
        </label>

        <label>
          ZT Frequency:
          <input type="number" name="ZTFrequency" value={settings.ZTFrequency} onChange={handleChange} />
        </label>

        <button type="submit">Apply Settings</button>
      </form>
    </div>
  );
};

export default ModelSettings;
