import './App.css';
import React, { useState } from 'react';
import axios from 'axios';
import * as Papa from 'papaparse';
import FileUpload from './components/FileUpload';
import DataGridDisplay from './components/DataGridDisplay';
import VisualizationControls from './components/VisualizationControls';
import PlotDisplay from './components/PlotDisplay';
import TabDisplay from './components/TabDisplay';
import ModelSettings from './components/ModelSettings'

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

  function parseCsvFile(file) {
    Papa.parse(file, {
      header: true, // Parse the CSV header
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data.map((row, index) => ({ id: index + 1, ...row }));
        const columns = Object.keys(result.data[0] || {}).map((field) => ({
          field,
          headerName: field,
          width: 150,
        }));
        const features = Object.keys(result.data[0] || {}).filter(field => field.trim() !== "");
  
        setFeatures(features);
        setGridRows(rows);
        setGridColumns(columns);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setError('Error parsing CSV file');
      },
    });
  }

  function handleChange(event) {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setError(null);
    setIsDone(false);

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      setSelectedFile(file);
      parseCsvFile(file)
    }
  };

  function handleFileClick(file) {
    setSelectedFile(file);
    parseCsvFile(file);

    if (plotType && selectedFeature) {
      generatePlot(plotType, selectedFeature)
    }
  };

  async function handleSubmit(event) {
      event.preventDefault();

      if (files.length === 0) {
        setError('No files selected');
        return;
      }
  
      const url = 'http://localhost:8080/uploadFiles';
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
  
      try {
        setIsProcessing(true);  // Start the loader
        setIsDone(false);  // Reset done state
  
        const response = await axios.post(url, formData, {
          responseType: 'blob',  // Expect a zip file from the server
        });
  
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
        setZipFileUrl(downloadUrl);  // Store the URL for later download
        setError(null);  // Clear any previous errors
  
        setIsProcessing(false);  // Stop the loader
        setIsDone(true);  // Mark as done
      } catch (error) {
        console.error('Error uploading files:', error);
        setError('Error uploading or processing files');
        setIsProcessing(false);  // Stop the loader
        setIsDone(false);  // Do not mark as done
      }
  };

  const handleTabChange = (tab) => {
    setSelectedTab(tab);

    if (tab === "Edit Model Settings") {
      setPlotType("raw-data"); // Reset plot type
      setSelectedFeature(null); // Reset selected feature
    }
  };

  const handleModelSettingsSubmit = (settings) => {
    console.log("User-selected settings:", settings);
    // Process settings as needed
  };

  function handlePlotSelect(event) {
    const plotType = event.target.value;
    setPlotType(plotType);

    
    if (plotType && selectedFeature) {
      generatePlot(plotType, selectedFeature);
    }
  }

  function handleFeatureSelect(event) {
    const selectedFeature = event.target.value;
    setSelectedFeature(selectedFeature);

    if (plotType && selectedFeature) {
      generatePlot(plotType, selectedFeature);
    }
  }

  const generatePlot = (plotType, feature) => {
    if (!selectedFile) {
      setError('No file selected for plotting');
      return;
    }

    switch (plotType) {
      case 'line':
        generateLinePlot(feature);
        break;
      case 'violin':
        generateViolinPlot(feature);
        break;
      case 'bar':
        generateBarPlot(feature)
        break;
      default:
        console.error('Unsupported plot type');
    }
  };

  function generateLinePlot(feature) {
    Papa.parse(selectedFile, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const sortedData = results.data.sort((a, b) => a.idx - b.idx); // Sort by 'idx'
        const idx = sortedData.map((row) => row.idx);
        const featureData = sortedData.map((row) => row[feature]);

        setPlotData({ idx, featureData });
      },
      error: (error) => {
        console.error('Error parsing CSV for plot:', error);
        setError('Error parsing CSV for plot');
      },
    });
  }

  function generateViolinPlot(feature) {
    Papa.parse(selectedFile, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const data = results.data.filter(
          (row) => row[feature] !== undefined && row.rodent_sleep !== undefined
        );

        // Group feature values by rodent_sleep categories
        const groupedData = {};
        data.forEach((row) => {
          const sleepStage = row.rodent_sleep; // Grouping column
          if (!groupedData[sleepStage]) {
            groupedData[sleepStage] = [];
          }
          groupedData[sleepStage].push(row[feature]);
        });

        // Prepare traces for Plotly
        const traces = Object.keys(groupedData).map((sleepStage) => ({
          type: 'violin',
          y: groupedData[sleepStage],
          name: `Sleep Stage ${sleepStage}`,
          box: { visible: true },
          meanline: { visible: true },
        }));

        setPlotData({ traces });
      },
      error: (error) => {
        console.error('Error parsing CSV for plot:', error);
        setError('Error parsing CSV for plot');
      },
    });
  }

  function generateBarPlot(feature) {
    Papa.parse(selectedFile, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.filter(
          (row) => row[feature] !== undefined && row.rodent_sleep !== undefined
        );
  
        const featureCounts = {};
  
        data.forEach((row) => {
          if (row.hasOwnProperty(feature) && row[feature] !== undefined && row[feature] !== null && row[feature] !== '') {
            const value = String(row[feature]).trim();
            featureCounts[value] = (featureCounts[value] || 0) + 1;
          }
        });
  
        const labels = Object.keys(featureCounts);
        const counts = Object.values(featureCounts);
  
        console.log(labels, counts)
        setPlotData({ labels, counts });
      },
      error: (error) => {
        console.error("Error parsing CSV for bar plot:", error);
        setError("Error parsing CSV for bar plot");
      },
    });
  }
  
  const placeholderColumns = [
    { field: "placeholder1", headerName: "Column 1", width: 150 },
    { field: "placeholder2", headerName: "Column 2", width: 150 },
    { field: "placeholder3", headerName: "Column 3", width: 150 },
  ];
  
  const placeholderRows = Array.from({ length: 5 }, (_, index) => ({
    id: index,
    placeholder1: "",
    placeholder2: "",
    placeholder3: "",
  }));
  
  return (
    <div className="App">
      <h1>Score and Cluster Data</h1>
      <FileUpload
        onFileChange={handleChange}
        onSubmit={handleSubmit}
        isProcessing={isProcessing}
        isDone={isDone}
        zipFileUrl={zipFileUrl}
        error={error}
      />
      
      <TabDisplay selectedTab={selectedTab} setSelectedTab={handleTabChange} />

      {selectedTab === "Visualization Display" ? (
        <>
          {plotType && plotType !== "raw-data" ? (
            <PlotDisplay plotType={plotType} plotData={plotData} feature={selectedFeature} />
          ) : gridRows.length > 0 && gridColumns.length > 0 ? (
            <DataGridDisplay
              files={files}
              onFileClick={handleFileClick}
              rows={gridRows}
              columns={gridColumns}
            />
          ) : (
            <div className="empty-state-message">
              <p>
                Your uploaded data will appear here. Please select the "Choose Files" button to begin.
              </p>
            </div>
          )}

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
