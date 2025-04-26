import React from 'react';
import Plot from 'react-plotly.js';

const darkLayout = {
  paper_bgcolor: '#1a1a1a',
  plot_bgcolor: '#1a1a1a',
  font: { color: '#ffffff' },
  height: 547,
  width: 950,
  xaxis: {
    gridcolor: '#333333', 
    zerolinecolor: '#555555', 
  },
  yaxis: {
    gridcolor: '#333333', 
    zerolinecolor: '#555555',
  },
};

function PlotDisplay({ plotType, plotData, feature }) {
  return (
    <div className="plot-container">
      {plotType === 'line' && plotData && (
        <Plot
          data={[
            {
              x: plotData.idx,
              y: plotData.featureData,
              type: 'scatter',
              mode: 'lines',
            },
          ]}
          layout={{
            title: `${feature} vs Index`,
            xaxis: { title: 'Index' },
            yaxis: { title: feature },
            ...darkLayout,
          }}
        />
      )}
      {plotType === 'violin' && plotData && (
        <Plot
          data={plotData.traces}
          layout={{
            title: `${feature} Distribution by Rodent Sleep Stage`,
            yaxis: { title: feature },
            violingroupgap: 0.4,
            ...darkLayout,
          }}
        />
      )}
      {plotType === 'bar' && plotData && (
        <Plot
          data={[
            {
              x: plotData.labels.map(String),
              y: plotData.counts,
              type: 'bar',
            },
          ]}
          layout={{
            title: `${feature} Distribution`,
            xaxis: { 
              title: 'Labels',
              type: 'category'
            },
            yaxis: { title: 'Counts' },
            ...darkLayout,
          }}
        />

      )}
    </div>
  );
}

export default PlotDisplay;
