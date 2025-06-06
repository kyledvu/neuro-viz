import { useRef, useState, useEffect } from "react";
import axios from "axios";
import TrainDataListDisplay from './TrainDataListDisplay';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
console.log(API_BASE_URL);

function ModelSettings() {
  const [settings, setSettings] = useState(null);

  const [files, setFiles] = useState([]);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
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

  const handSettingChange = (e) => {
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
            .then((res) => setSettings(res.data)) 
            .catch((error) => console.error("Error fetching config:", error));
        }
      })
      .catch((error) => console.error("Error resetting config:", error));
  };

  const handleModelUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('trained_model', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/uploadModel`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Model uploaded successfully:', response.data);
      setUploadSuccess('Model uploaded successfully!');
      setUploadError(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Model upload failed.';
      console.error('Error uploading model:', error);
      setUploadError(errorMsg);
      setUploadSuccess(null);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length === 0) {
      console.warn("No files selected.");
      return;
    }
    setModelStats(null);
    setDownloadUrl(null);
    setTrainingError(null);
    setFiles(selected.map(f => ({ file: f, checked: false })));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const trainIndices = [];
    const testIndices = [];

    // Append all files and track training/testing indices
    files.forEach((f, index) => {
      formData.append('files', f.file);
      if (f.checked) {
        trainIndices.push(index);
      } else {
        testIndices.push(index);
      }
    });

    formData.append('train_indices', JSON.stringify(trainIndices));
    formData.append('test_indices', JSON.stringify(testIndices));

    setIsTraining(true);
    setModelStats(null);
    setDownloadUrl(null);
    setTrainingError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/trainModel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setModelStats(response.data);
      setDownloadUrl(`${API_BASE_URL}${response.data.downloadUrl}`);
    } catch (error) {
      console.error("Training failed:", error);
      setTrainingError("Model training failed.");
    } finally {
      setIsTraining(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCheckToggle = (index) => {
    const updatedFiles = [...files];
    updatedFiles[index].checked = !updatedFiles[index].checked;
    setFiles(updatedFiles);
  };

  const handleShuffle = () => {
    const total = files.length;
    const trainProportion = 1 - 1 / parseFloat(settings.validation_ratio)
    const numToCheck = Math.floor(total * trainProportion);

    const selectedIndices = new Set();
    while (selectedIndices.size < numToCheck) {
      const randIndex = Math.floor(Math.random() * total);
      selectedIndices.add(randIndex);
    }

    const updatedFiles = files.map((file, index) => ({
      ...file,
      checked: selectedIndices.has(index),
    }));

    setFiles(updatedFiles);
  };


  return (
    <div className="model-settings">
      <h3>Model Settings</h3>
      <form>
        <label>
          Learning Rate:
          <input type="number" step="0.00001" name="learning_rate" value={settings.learning_rate} min="0" max="1" onChange={handSettingChange} />
        </label>

        <label>
          Batch Size:
          <input type="number" name="batch_size" value={settings.batch_size} min="0" onChange={handSettingChange} />
        </label>

        <label>
          Epochs:
          <input type="number" name="epochs" value={settings.epochs} min="0" onChange={handSettingChange} />
        </label>

        <label>
          Early Stopping:
          <input type="checkbox" name="early_stop" checked={settings.early_stop} onChange={handSettingChange} />
        </label>

        <label>
          Early Stop Epoch:
          <input type="number" name="early_stop_epoch" value={settings.early_stop_epoch} min="0" onChange={handSettingChange} />
        </label>

        <label>
          L2 Penalty:
          <input type="number" step="0.0001" name="L2_penalty" value={settings.L2_penalty} min="0" onChange={handSettingChange} />
        </label>

        <label>
          Activation Function:
          <select name="activation_fun" value={settings.activation_fun} onChange={handSettingChange}>
            <option value="sigmoid">Sigmoid</option>
            <option value="relu">ReLU</option>
            <option value="tanh">Tanh</option>
          </select>
        </label>

        <label>
          Validation Ratio:
          <input type="number" name="validation_ratio" value={settings.validation_ratio} min="1" onChange={handSettingChange} />
        </label>

        <label>
          EMG Top Outlier:
          <input type="number" step="0.01" name="EMG_top_outlier" value={settings.EMG_top_outlier} min="0" max="1" onChange={handSettingChange} />
        </label>

        <label>
          Wave Length Outlier STD:
          <input type="number" name="wave_length_outlier_STD" value={settings.wave_length_outlier_STD} min="0" onChange={handSettingChange} />
        </label>

        <label>
          EEG Outlier STD:
          <input type="number" name="EEG_outlier_STD" value={settings.EEG_outlier_STD} min="0" onChange={handSettingChange} />
        </label>

        <label>
          Experiment Start Time:
          <input type="number" name="experiment_start_time" value={settings.experiment_start_time} min="0" max="23" onChange={handSettingChange} />
        </label>

        <label>
          ZT Frequency:
          <input type="number" name="ZT_frequency" value={settings.ZT_frequency} min="1" max="24" onChange={handSettingChange} />
        </label>

        <div className='model-select'>
          <label className='model-upload'>
            Upload Model
            <input
             type="file"
             accept='.pkl'
             name='trained_model'
             onChange={handleModelUpload}
            />
          </label>
          <div className="model-upload-output">
            {uploadSuccess && <p>{uploadSuccess}</p>}
            {uploadError && <p style={{ color: 'red' }}>{uploadError}</p>}
          </div>

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
              onChange={handleFileChange}
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

          {files.length > 0 && !isTraining && !modelStats && (
            <TrainDataListDisplay
              files={files}
              onCheckToggle={handleCheckToggle}
              onSubmit={handleSubmit}
              onShuffle={handleShuffle}
            />
          )}
          
        </div>

        <button type="button" onClick={handleReset}>Reset to Default</button>
      </form>
    </div>
  );
}

export default ModelSettings;
