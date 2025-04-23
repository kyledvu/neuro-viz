import React from 'react';

function FileListDisplay({ files, onFileClick }) {
  return (
    <div className="selected-files">
      <ul className="file-names">
        {files.map((file, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => onFileClick(file)}
              className="file-btn"
            >
              {file.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FileListDisplay;
