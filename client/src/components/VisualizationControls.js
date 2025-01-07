import React from 'react';

function VisualizationControls({ onLinePlotClick, onViolinPlotClick }) {
  return (
    <div className="vis-btns">
      <button type="button" onClick={onLinePlotClick} className="custom-btn">
        Display Line Plot
      </button>
      <button type="button" onClick={onViolinPlotClick} className="custom-btn">
        Display Violin Plot
      </button>
    </div>
  );
}

export default VisualizationControls;
