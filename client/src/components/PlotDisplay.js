import React from 'react';
import Plot from 'react-plotly.js';

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
            title: `${feature} vs Index (Line Plot)`,
            xaxis: { title: 'Index (idx)' },
            yaxis: { title: feature },
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
          }}
        />
      )}
      {plotType === 'bar' && plotData && (
        <Plot
          data={[
            {
              x: plotData.labels,
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
          }}
        />

      )}
    </div>
  );
}

export default PlotDisplay;
