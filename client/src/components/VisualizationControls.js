import React, { useState, useEffect } from 'react';

function VisualizationControls({ features, onPlotSelect, onFeatureSelect }) {
  const [selectedPlot, setSelectedPlot] = useState("");
  const [isFirstUpload, setIsFirstUpload] = useState(true); // Track first file upload

  useEffect(() => {
    if (isFirstUpload && features.length > 0) {
      setSelectedPlot("raw-data");
      onPlotSelect({ target: { value: "raw-data" } }); // Notify parent component
      setIsFirstUpload(false); // Prevent further auto-updates
    }
  }, [features, isFirstUpload, onPlotSelect]);

  const handlePlotChange = (event) => {
    setSelectedPlot(event.target.value);
    onPlotSelect(event);
  };

  return (
    <div className="vis-control">
      <select 
        name="plot-select" 
        id="plot-select" 
        value={selectedPlot} 
        onChange={handlePlotChange}
      >
        <option key="default" value="" disabled>-- Select a Plot --</option>
        <option key="raw" value="raw-data">Raw Data</option>
        <option key="line" value="line">Line</option>
        <option key="bar" value="bar">Bar</option>
        <option key="violin" value="violin">Violin</option>
      </select>

      <select name="feature-select" id="feature-select" onChange={onFeatureSelect} defaultValue="">
        <option key="default" value="" disabled>-- Select a Feature --</option>
        {selectedPlot !== "raw-data" && (
          features.map((feature) => (
            <option key={feature} value={feature}>
              {feature}
            </option>
          ))
        )}
      </select>

    </div>
  );
}

export default VisualizationControls;
