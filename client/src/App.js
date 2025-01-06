import './App.css';
import React, { useState } from 'react';
import axios from 'axios';
import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import * as Papa from 'papaparse';
import Plot from 'react-plotly.js'; 

function App() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [zipFileUrl, setZipFileUrl] = useState(null);  // Store the blob URL for the zip file
  const [isProcessing, setIsProcessing] = useState(false);  // Track if processing is happening
  const [isDone, setIsDone] = useState(false);  // Track if processing is complete
  const [gridRows, setGridRows] = useState([]); // DataGrid rows
  const [gridColumns, setGridColumns] = useState([]); //DataGrid column headers
  const [selectedFile, setSelectedFile] = useState(null); // Most recently clicked file button
  const [plotData, setPlotData] = useState(null); // Data being used to plot
  const [plotType, setPlotType] = useState(null); // Track which plot to display

  // Handle file selection
  function handleChange(event) {
    setFiles([...event.target.files]);  // Store selected files in state
    setError(null);  // Clear any previous errors
    setIsDone(false);  // Reset done state on new file selection

    // Parse the first CSV file for demonstration
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        setSelectedFile(file);

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
  
            setGridRows(rows);
            setGridColumns(columns);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
            setError('Error parsing CSV file');
          },
        });
      }
  }

  // Handle file button click
  function handleFileClick(file) {
    setSelectedFile(file);

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

        setGridRows(rows);
        setGridColumns(columns);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setError('Error parsing CSV file');
      },
    });
  }

  const handleLinePlotClick = () => {
    setPlotType('line'); // Set plot type to 'line'
    generateLinePlot();  // Call function to prepare line plot data
  };
  
  const handleViolinPlotClick = () => {
    setPlotType('violin'); // Set plot type to 'violin'
    generateViolinPlot();  // Call function to prepare violin plot data
  };
   // Generate Line Plot data
   const generateLinePlot = () => {
    if (!selectedFile) {
      setError('No file selected for plotting');
      return;
    }

    Papa.parse(selectedFile, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const sortedData = results.data.sort((a, b) => a.idx - b.idx); // Sort by 'idx'
        const idx = sortedData.map((row) => row.idx);
        const eegRaw = sortedData.map((row) => row.EEG_raw);

        setPlotData({ idx, eegRaw });
      },
      error: (error) => {
        console.error('Error parsing CSV for plot:', error);
        setError('Error parsing CSV for plot');
      },
    });
  };
  
  const generateViolinPlot = () => {
    if (!selectedFile) {
      setError('No file selected for plotting');
      return;
    }
  
    Papa.parse(selectedFile, {
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const data = results.data.filter((row) => row.EMG_z !== undefined && row.rodent_sleep !== undefined);

        // Group EMG_z values by rodent_sleep categories
        const groupedData = {};
        data.forEach((row) => {
          const sleepStage = row.rodent_sleep; // Grouping column
          if (!groupedData[sleepStage]) {
            groupedData[sleepStage] = [];
          }
          groupedData[sleepStage].push(row.EMG_z);
        });
        
        // Prepare traces for Plotly
        const traces = Object.keys(groupedData).map((sleepStage) => ({
          type: 'violin',
          y: groupedData[sleepStage],
          name: `Sleep Stage ${sleepStage}`,
          box: { visible: true }, // Show box plot within violin
          meanline: { visible: true }, // Show mean line
        }));
  
        setPlotData({ traces });
      },
      error: (error) => {
        console.error('Error parsing CSV for plot:', error);
        setError('Error parsing CSV for plot');
      },
    });
  };


  // Handle form submission
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
  }

  

  return (
    <div className="App">
      <h1>Score and Cluster Data</h1>
      <form onSubmit={handleSubmit} className="form-container">
        {/* Row: File Input and Upload Button */}
        <div className="upload-section">
          <input
            id="file-upload"
            type="file" 
            accept=".csv" 
            onChange={handleChange} 
            multiple
          />
          <label htmlFor="file-upload" className="custom-btn">
            Choose Files
          </label>
          {/* Column: Upload Button + Status Message + Download Button */}
          <div className="button-status-column">
            <button 
            type="submit"
            className="custom-btn"
            >
              Upload and Process
            </button>
            {/* Status Message */}
            <div className="status">
              {isProcessing && (
                <div className="loader">
                  <p>Processing...</p>
                  <div className="spinner"></div>
                </div>
              )}
              {isDone && (
                <div className="done">
                  <p>Done!</p>
                  <span className="checkmark">&#10003;</span>
                </div>
              )}
            </div>
            {/* Download Button */}
            {zipFileUrl && (
              <a 
                href={zipFileUrl}
                download="processed_files.zip"
                className="download-button"
              >
                processed-files.zip
              </a>
            )}
          </div>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <div className="tabs">
        <button className="btn leftbtn">Visualization Display</button>
        <button className="btn">Edit Model Settings</button>
      </div>
      
      <div className = "vis-display"> 
        <div className = "selected-files">
          <ul className="file-names">
            {files.map((file, index) => (
              <li key={index}>
                <button 
                  type="button" 
                  onClick={() => handleFileClick(file)} 
                  className="file-btn"
                >
                  {file.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {gridRows.length > 0 && gridColumns.length > 0 && (
          <div className = "data-grid">
            <DataGrid 
            rows={gridRows}
            columns={gridColumns}
            sx={{
              color: '#c9c9c9',
              '--DataGrid-containerBackground': '#1a1a1a', // Custom CSS variable
              '--DataGrid-footerContainerBackground': '#404040', // Not working
              '& .MuiTablePagination-root': {
                color: '#FFFFFF', // Changes the text color of pagination items
              },
            }} 
            />
          </div>
        )}
      </div>

      <div className="vis-btns">
        <button
          type="button"
          onClick={handleLinePlotClick}
          className="custom-btn"
        >
          Display Line Plot
        </button>

        <button
          type="button"
          onClick={handleViolinPlotClick}
          className="custom-btn"
        >
          Display Violin Plot
        </button>
      </div>
      <div className="plot-container">
        {plotType === 'line' && plotData && (
          <Plot
            data={[
              {
                x: plotData.idx,
                y: plotData.eegRaw,
                type: 'scatter',
                mode: 'lines',
                name: 'EEG Raw',
              },
            ]}
            layout={{
              title: 'EEG Raw vs Index (Line Plot)',
              xaxis: { title: 'Index (idx)' },
              yaxis: { title: 'EEG Raw' },
            }}
          />
        )}
        {plotType === 'violin' && plotData && (
          <Plot
            data={plotData.traces}
            layout={{
              title: 'EMG_z Distribution by Rodent Sleep Stage',
              yaxis: { title: 'EMG_z' },
              violingroupgap: 0.4, // Adjust spacing between violins
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
