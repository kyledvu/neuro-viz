import * as Papa from 'papaparse';

export function generatePlot(plotType, feature, selectedFile, setPlotData, setError) {
  if (!selectedFile) {
    setError("No file selected for plotting");
    return;
  }

  switch (plotType) {
    case "line":
      generateLinePlot(feature, selectedFile, setPlotData, setError);
      break;
    case "violin":
      generateViolinPlot(feature, selectedFile, setPlotData, setError);
      break;
    case "bar":
      generateBarPlot(feature, selectedFile, setPlotData, setError);
      break;
    default:
      console.error("Unsupported plot type");
  }
}

function generateLinePlot(feature, file, setPlotData, setError) {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: (results) => {
      const sortedData = results.data.sort((a, b) => a.idx - b.idx);
      const idx = sortedData.map((row) => row.idx);
      const featureData = sortedData.map((row) => row[feature]);

      setPlotData({ idx, featureData });
    },
    error: (error) => {
      console.error("Error parsing CSV for plot:", error);
      setError("Error parsing CSV for plot");
    },
  });
}

function generateViolinPlot(feature, file, setPlotData, setError) {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: (results) => {
      const data = results.data.filter(
        (row) => row[feature] !== undefined && row.rodent_sleep !== undefined
      );

      const groupedData = {};
      data.forEach((row) => {
        const sleepStage = row.rodent_sleep;
        if (!groupedData[sleepStage]) {
          groupedData[sleepStage] = [];
        }
        groupedData[sleepStage].push(row[feature]);
      });

      const traces = Object.keys(groupedData).map((sleepStage) => ({
        type: "violin",
        y: groupedData[sleepStage],
        name: `Sleep Stage ${sleepStage}`,
        box: { visible: true },
        meanline: { visible: true },
      }));

      setPlotData({ traces });
    },
    error: (error) => {
      console.error("Error parsing CSV for plot:", error);
      setError("Error parsing CSV for plot");
    },
  });
}

function generateBarPlot(feature, file, setPlotData, setError) {
  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    complete: (results) => {
      const data = results.data.filter(
        (row) => row[feature] !== undefined && row.rodent_sleep !== undefined
      );

      const featureCounts = {};

      data.forEach((row) => {
        if (row.hasOwnProperty(feature) && row[feature] !== undefined) {
          const value = String(row[feature]).trim();
          featureCounts[value] = (featureCounts[value] || 0) + 1;
        }
      });

      const labels = Object.keys(featureCounts);
      const counts = Object.values(featureCounts);

      setPlotData({ labels, counts });
    },
    error: (error) => {
      console.error("Error parsing CSV for bar plot:", error);
      setError("Error parsing CSV for bar plot");
    },
  });
}
