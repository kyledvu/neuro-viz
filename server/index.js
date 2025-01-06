const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const app = express();
const port = 8080;

app.use(cors());

// Configure Multer to store files in the 'uploads' folder temporarily
const upload = multer({ dest: 'uploads/' });

// Route to handle multiple file uploads
app.post('/uploadFiles', upload.array('files'), (req, res) => {
  const inputFilePaths = req.files.map((file) => path.join(__dirname, file.path));

  // Spawn a Python process to score and cluster the data
  const pythonProcess = spawn('python', ['Main.py', ...inputFilePaths]);

  let jsonOutput = '';

  // Collect stdout from Python
  pythonProcess.stdout.on('data', (data) => {
    jsonOutput += data.toString();
  });

  // Handle Python errors
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python error: ${data}`);
  });

  // Once the Python process completes
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      const outputData = JSON.parse(jsonOutput);

      // Create a ZIP archive and send it to the client
      const archive = archiver('zip');
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="processed_files.zip"');
      archive.pipe(res);

      req.files.forEach((file) => {
        const originalName = path.parse(file.originalname).name; // Strip the extension
        const newScoredFilename = `${originalName}_scored.csv`;
        const scoredPath = path.normalize(outputData.scored[file.filename]);
      
        if (scoredPath && fs.existsSync(scoredPath)) {
          archive.file(scoredPath, { name: `scored/${newScoredFilename}` });
        } else {
          console.error(`Scored file not found: ${scoredPath}`);
        }
      
        const newClusteredFilename = `${originalName}_clustered.csv`;
        const clusteredPath = path.normalize(outputData.clustered[file.filename]);
      
        if (clusteredPath && fs.existsSync(clusteredPath)) {
          archive.file(clusteredPath, { name: `clustered/${newClusteredFilename}` });
        } else {
          console.error(`Clustered file not found: ${clusteredPath}`);
        }
      });
      

      // Finalize the archive and trigger cleanup after the archive stream ends
      archive.finalize();

      archive.on('end', () => {
        // Clean up uploaded files
        req.files.forEach((file) => {
          fs.unlink(file.path, (err) => {
            if (err) console.error(`Error deleting file ${file.path}:`, err);
          });
        });

        // Clean up processed files
        [...Object.values(outputData.scored), ...Object.values(outputData.clustered)].forEach((file) => {
          fs.unlink(file, (err) => {
            if (err) console.error(`Error deleting file ${file}:`, err);
          });
        });
      });
    } else {
      res.status(500).send({ message: 'Python script failed', error: `Exit code: ${code}` });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
