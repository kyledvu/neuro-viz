import React from 'react';
// import './FileUpload.css'; // Import component-specific CSS if needed

function FileUpload({ files, onUpload, onError, onProcessStart, onProcessComplete }) {
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    onUpload(selectedFiles);
  };

  return (
    <div className="upload-section">
      <input
        id="file-upload"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        multiple
      />
      <label htmlFor="file-upload" className="custom-btn">
        Choose Files
      </label>
    </div>
  );
}

export default FileUpload;