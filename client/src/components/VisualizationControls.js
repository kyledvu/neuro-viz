import React from 'react';

function VisualizationControls({ features, onPlotSelect, onFeatureSelect }) {
  return (
    <div className="vis-control">
        <select name="plot-select" id="plot-select" onChange={onPlotSelect}>
            <option value="" disabled selected>-- Select a Plot --</option>
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="violin">Violin</option>
        </select>
        <select name="feature-select" id="feature-select" onChange={onFeatureSelect}>
            <option value="" disabled selected>-- Select a Feature --</option>
            {features.map((feature) => (
                <option value={feature}>
                {feature}
                </option>
            ))}
        </select>
    </div>
  );
}

export default VisualizationControls;
