import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

function DataGridDisplay({ files, onFileClick, rows, columns }) {
  return (
    <div className="vis-display">
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
        <div className="data-grid">
        <DataGrid
            rows={rows}
            columns={columns}
            sx={{
            color: '#c9c9c9',
            '--DataGrid-containerBackground': '#1a1a1a',
            '& .MuiTablePagination-root': {
                color: '#FFFFFF',
            },
            }}
        />
        </div>
    </div>

  );
}

export default DataGridDisplay;
