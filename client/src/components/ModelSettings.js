import { useRef, useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log(API_BASE_URL);

function ModelSettings() {
  const [settings, setSettings] = useState(null);

  const [files, setFiles] = useState([]);
  const [modelStats, setModelStats] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [trainingError, setTrainingError] = useState(null);
  const [isTraining, setIsTraining] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/getConfig`)
      .then((response) => setSettings(response.data))
      .catch((error) => console.error("Error fetching config:", error));
  }, []);

  if (!settings) return <p>Loading settings...</p>;

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const updatedSettings = {
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    };
    setSettings(updatedSettings);

    axios.post(`${API_BASE_URL}/updateConfig`, updatedSettings)
      .catch((error) => console.error("Error updating config:", error));
  };

  const handleReset = () => {
    axios.post(`${API_BASE_URL}/resetConfig`)
      .then((response) => {
        if (response.data.message) {
          axios.get(`${API_BASE_URL}/getConfig`)
            .then((res) => setSettings(res.data)) // Update state with fresh default values
            .catch((error) => console.error("Error fetching config:", error));
        }
      })
      .catch((error) => console.error("Error resetting config:", error));
  };

  const handleSubmit = (e, selectedFiles) => {
    e.preventDefault();

    const formData = new FormData();
    Array.from(selectedFiles).forEach(file => {
      formData.append("files", file);
    });

    setIsTraining(true);
    setModelStats(null);
    setDownloadUrl(null);
    setTrainingError(null);

    axios.post(`${API_BASE_URL}/trainModel`, formData)
      .then((response) => {
        setModelStats(response.data);
        setDownloadUrl(`${API_BASE_URL}${response.data.downloadUrl}`);
      })
      .catch((error) => {
        console.error("Training failed:", error);
        setTrainingError("Model training failed.");
      })
      .finally(() => {
        setIsTraining(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      });
  };


  return (
    <div className="model-settings">
      <h3>Model Settings</h3>
      <form>
        <label>
          Learning Rate:
          <input type="number" step="0.00001" name="learning_rate" value={settings.learning_rate} min="0" max="1" onChange={handleChange} />
        </label>

        <label>
          Batch Size:
          <input type="number" name="batch_size" value={settings.batch_size} min="0" onChange={handleChange} />
        </label>

        <label>
          Epochs:
          <input type="number" name="epochs" value={settings.epochs} min="0" onChange={handleChange} />
        </label>

        <label>
          Early Stopping:
          <input type="checkbox" name="early_stop" checked={settings.early_stop} onChange={handleChange} />
        </label>

        <label>
          Early Stop Epoch:
          <input type="number" name="early_stop_epoch" value={settings.early_stop_epoch} min="0" onChange={handleChange} />
        </label>

        <label>
          L2 Penalty:
          <input type="number" step="0.0001" name="L2_penalty" value={settings.L2_penalty} min="0" onChange={handleChange} />
        </label>

        <label>
          Activation Function:
          <select name="activation_fun" value={settings.activation_fun} onChange={handleChange}>
            <option value="sigmoid">Sigmoid</option>
            <option value="relu">ReLU</option>
            <option value="tanh">Tanh</option>
          </select>
        </label>

        <label>
          Validation Ratio:
          <input type="number" name="validation_ratio" value={settings.validation_ratio} min="0" onChange={handleChange} />
        </label>

        <label>
          EMG Top Outlier:
          <input type="number" step="0.01" name="EMG_top_outlier" value={settings.EMG_top_outlier} min="0" max="1" onChange={handleChange} />
        </label>

        <label>
          Wave Length Outlier STD:
          <input type="number" name="wave_length_outlier_STD" value={settings.wave_length_outlier_STD} min="0" onChange={handleChange} />
        </label>

        <label>
          EEG Outlier STD:
          <input type="number" name="EEG_outlier_STD" value={settings.EEG_outlier_STD} min="0" onChange={handleChange} />
        </label>

        <label>
          Experiment Start Time:
          <input type="number" name="experiment_start_time" value={settings.experiment_start_time} min="0" max="23" onChange={handleChange} />
        </label>

        <label>
          ZT Frequency:
          <input type="number" name="ZT_frequency" value={settings.ZT_frequency} min="1" max="24" onChange={handleChange} />
        </label>
        <div className='model-select'>
          <label className='model-upload'>
            Upload Model
            <input
             type="file"
             accept='.pkl'
             name='trained_model'
            />
          </label>
        </div>

        <div className='model-training'>
          <label className='train-data-upload'>
            Upload Training Data
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              multiple
              name="train_data"
              onChange={(e) => {
                const selected = e.target.files;
                if (selected.length === 0) {
                  console.warn("No files selected.");
                  return;
                }

                console.log("Selected files:", selected);
                setFiles(selected);
                handleSubmit(e, selected);
              }}
            />
          </label>
          <div className="model-output">
            {isTraining && <p>Training in progress...</p>}
            {modelStats && (
              <div>
                <p>Training Accuracy: {modelStats.train_accuracy}</p>
                <p>Validation Accuracy: {modelStats.validation_accuracy}</p>
                <p>Loss: {modelStats.train_loss}</p>

                {downloadUrl && (
                  <a href={downloadUrl} download className="btn btn-primary">
                    Download Trained Model
                  </a>
                )}
              </div>
            )}
            {trainingError && <p style={{ color: 'red' }}>{trainingError}</p>}
          </div>

        </div>

        <button type="button" onClick={handleReset}>Reset to Default</button>
      </form>
    </div>
  );
}

export default ModelSettings;
