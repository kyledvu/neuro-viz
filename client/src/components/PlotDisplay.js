import React from 'react';
import Plot from 'react-plotly.js';

function PlotDisplay({ plotType, plotData }) {
  return (
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
            violingroupgap: 0.4,
          }}
        />
      )}
    </div>
  );
}

export default PlotDisplay;
