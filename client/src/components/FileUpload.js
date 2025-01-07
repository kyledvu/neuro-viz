import React from 'react';

function FileUpload({ onFileChange, onSubmit, isProcessing, isDone, zipFileUrl, error }) {
  return (
    <form onSubmit={onSubmit} className="form-container">
      <div className="upload-section">
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={onFileChange}
          multiple
        />
        <label htmlFor="file-upload" className="custom-btn">
          Choose Files
        </label>
        <div className="button-status-column">
          <button type="submit" className="custom-btn">
            Upload and Process
          </button>
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
          {zipFileUrl && (
            <a href={zipFileUrl} download="processed_files.zip" className="download-button">
              processed-files.zip
            </a>
          )}
        </div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}

export default FileUpload;
