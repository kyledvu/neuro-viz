import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

function DataGridDisplay({ rows, columns }) {
  return (
    <div className="data-grid">
        <ThemeProvider theme={darkTheme}>
            <Box sx={{ height: 550 }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={5}
                    disableRowSelectionOnClick
                    sx={{
                        '--DataGrid-containerBackground': '#1a1a1a',
                        '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#1a1a1a',
                        color: '#fff',
                        },
                        '& .MuiDataGrid-footerContainer': {
                        backgroundColor: '#1a1a1a',
                        color: '#ccc',
                        },
                    }}
                />
            </Box>
        </ThemeProvider>
    </div>
  );
}

export default DataGridDisplay;
