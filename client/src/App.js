import './App.css';
import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import DataGridDisplay from './components/DataGridDisplay';
import VisualizationControls from './components/VisualizationControls';
import PlotDisplay from './components/PlotDisplay';
import TabDisplay from './components/TabDisplay';
import ModelSettings from './components/ModelSettings';
import { parseCsvFile } from './utils/csvUtils';
import { handleFileChange, handleFileSubmit } from './utils/fileUtils';
import { generatePlot } from './utils/plotUtils';

function App() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [zipFileUrl, setZipFileUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [gridRows, setGridRows] = useState([]);
  const [gridColumns, setGridColumns] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [plotData, setPlotData] = useState(null);
  const [plotType, setPlotType] = useState(null);
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [selectedTab, setSelectedTab] = useState("Visualization Display");

  function handleFileClick(file) {
    setSelectedFile(file);
    parseCsvFile(file, setFeatures, setGridRows, setGridColumns, setError)

    if (plotType && selectedFeature) {
      generatePlot(plotType, selectedFeature)
    }
  };

  function handleTabChange(tab) {
    setSelectedTab(tab);

    if (tab === "Edit Model Settings") {
      setPlotType("raw-data"); // Reset plot type
      setSelectedFeature(null); // Reset selected feature
    }
  }

  function handleModelSettingsSubmit(settings) {
    console.log("User-selected settings:", settings);
    // Process settings as needed
  }

  function handlePlotSelect(event) {
    const plotType = event.target.value;
    setPlotType(plotType);

    
    if (plotType && selectedFeature) {
      generatePlot(plotType, selectedFeature, selectedFile, setPlotData, setError);
    }
  }

  function handleFeatureSelect(event) {
    const selectedFeature = event.target.value;
    setSelectedFeature(selectedFeature);

    if (plotType && selectedFeature) {
      generatePlot(plotType, selectedFeature, selectedFile, setPlotData, setError);
    }
  }
  
  return (
    <div className="App">
      <h1>Score and Cluster Data</h1>
      <FileUpload
        onFileChange={(event) =>
          handleFileChange(event.target.files, setFiles, setError, setIsDone, setSelectedFile, setFeatures, setGridRows, setGridColumns)
        }
        onSubmit={(event) =>
          handleFileSubmit(event, files, setIsProcessing, setIsDone, setZipFileUrl, setError)
        }
        isProcessing={isProcessing}
        isDone={isDone}
        zipFileUrl={zipFileUrl}
        error={error}
      />
      
      <TabDisplay selectedTab={selectedTab} setSelectedTab={handleTabChange} />

      {selectedTab === "Visualization Display" ? (
        <>
          {files.length === 0 ? (
            <div className="empty-state-message">
              <p>
                Your uploaded data will appear here. Please select the "Choose Files" button to begin.
              </p>
            </div>
          ) : selectedFeature && plotType && plotType !== "raw-data" ? (
            <PlotDisplay plotType={plotType} plotData={plotData} feature={selectedFeature} />
          ) : gridRows.length > 0 && gridColumns.length > 0 ? (
            <DataGridDisplay
              files={files}
              onFileClick={handleFileClick}
              rows={gridRows}
              columns={gridColumns}
            />
          ) : null}

          <VisualizationControls
            features={features}
            onPlotSelect={handlePlotSelect}
            onFeatureSelect={handleFeatureSelect}
          />
        </>
      ) : (
        <ModelSettings onSubmit={handleModelSettingsSubmit} />
      )}
    </div>
  );

}

export default App;
