const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const app = express();
const port = 8080;
const CONFIG_PATH = path.join(__dirname, "config.json");
const DEFAULT_CONFIG_PATH = path.join(__dirname, "default_config.json");
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());
app.use('/temp/download', express.static(path.join(__dirname, 'temp/download')));

function cleanupUploadedFiles(reqFiles) {
  // Delete uploaded temp files
  reqFiles.forEach((file) => {
    fs.unlink(file.path, (err) => {
      if (err) console.error(`Error deleting uploaded file ${file.path}:`, err);
    });
  });

  // Delete files inside train_data and test_data folders
  ['temp/train_data', 'temp/test_data'].forEach((dir) => {
    const dirPath = path.join(__dirname, dir);
    fs.readdir(dirPath, (err, files) => {
      if (err) {
        console.error(`Error reading ${dirPath}:`, err);
        return;
      }
      files.forEach((filename) => {
        const filePath = path.join(dirPath, filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Error deleting file ${filePath}:`, err);
        });
      });
    });
  });
}

function copyFilesToTrainTestFolders(files, trainIndicesRaw, testIndicesRaw) {
  const trainIndices = JSON.parse(trainIndicesRaw);
  const testIndices = JSON.parse(testIndicesRaw);

  const trainDir = path.join(__dirname, 'temp/train_data');
  const testDir = path.join(__dirname, 'temp/test_data');

  files.forEach((file, index) => {
    const srcPath = path.join(__dirname, file.path);
    const destFileName = path.basename(file.path)

    if (trainIndices.includes(index)) {
      const destPath = path.join(trainDir, destFileName);
      fs.copyFileSync(srcPath, destPath);
    } else if (testIndices.includes(index)) {
      const destPath = path.join(testDir, destFileName);
      fs.copyFileSync(srcPath, destPath);
    }
  });

}

// Route to get the current model settings
app.get("/getConfig", (req, res) => {
  fs.readFile(CONFIG_PATH, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading config file:", err);
      return res.status(500).json({ error: "Failed to read config file" });
    }
    res.json(JSON.parse(data));
  });
});

// Route to update the model settings
app.post("/updateConfig", (req, res) => {
  const newConfig = req.body;
  fs.writeFile(CONFIG_PATH, JSON.stringify(newConfig, null, 2), "utf8", (err) => {
    if (err) {
      console.error("Error updating config file:", err);
      return res.status(500).json({ error: "Failed to update config file" });
    }
    res.json({ message: "Configuration updated successfully" });
  });
});

// Route to reset config.json to default values
app.post("/resetConfig", (req, res) => {
  fs.copyFile(DEFAULT_CONFIG_PATH, CONFIG_PATH, (err) => {
    if (err) {
      console.error("Error resetting config file:", err);
      return res.status(500).json({ error: "Failed to reset config file" });
    }
    res.json({ message: "Configuration reset to default" });
  });
});

// Route to train model from multiple file uploads
app.post('/trainModel', upload.array('files'), (req, res) => {
  const { train_indices, test_indices } = req.body;

  try {
    copyFilesToTrainTestFolders(req.files, train_indices, test_indices);
  } catch (err) {
    console.error("Error splitting files:", err);
    cleanupUploadedFiles(req.files);
    return res.status(500).send({ message: 'Failed to split files for training' });
  }

  const trainProcess = spawn('python', ['-u', 'TrainFromUpload.py']);

  let trainOutput = '';

  trainProcess.stdout.on('data', (data) => {
    trainOutput += data.toString();
  });

  trainProcess.stderr.on('data', (data) => {
    console.error(`Training script error: ${data}`);
  });

  trainProcess.on('close', (trainCode) => {
    if (trainCode !== 0) {
      cleanupUploadedFiles(req.files);
      return res.status(500).send({ message: 'Training failed' });
    }

    let outputData;
    try {
      outputData = JSON.parse(trainOutput);
    } catch (e) {
      console.error('Failed to parse training output:', e);
      cleanupUploadedFiles(req.files);
      return res.status(500).send({ message: 'Invalid training output' });
    }

    const modelSrcPath = path.join(__dirname, 'trained_network.pkl');
    const modelDestPath = path.join(__dirname, 'temp/download', 'trained_network.pkl');

    fs.rename(modelSrcPath, modelDestPath, (err) => {
      if (err) {
        console.error("Error moving trained model:", err);
        cleanupUploadedFiles(req.files);
        return res.status(500).send({ message: 'Could not prepare download' });
      }

      res.send({
        ...outputData,
        downloadUrl: '/temp/download/trained_network.pkl',
      });

      res.on('finish', () => {
        cleanupUploadedFiles(req.files);
      });
    });
  });
});


// Route to upload a trained model (.pkl file)
app.post('/uploadModel', upload.single('trained_model'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const tempDownloadDir = path.join(__dirname, 'temp', 'download');
  const targetPath = path.join(tempDownloadDir, 'trained_network.pkl');

  fs.rename(req.file.path, targetPath, (err) => {
    if (err) {
      console.error('Error saving uploaded model:', err);
      return res.status(500).json({ error: 'Failed to save model.' });
    }

    res.json({
      message: 'Model uploaded and saved as trained_network.pkl',
      downloadUrl: '/temp/download/trained_network.pkl',
    });
  });
});

// Route to score and cluster multiple file uploads
app.post('/uploadFiles', upload.array('files'), (req, res) => {
  const inputFilePaths = req.files.map((file) => path.join(__dirname, file.path));

  const cleanupFiles = (outputData = null) => {
    // Clean uploaded files
    req.files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Error deleting uploaded file ${file.path}:`, err);
      });
    });

    // Clean processed output files if available
    if (outputData) {
      const allPaths = [
        ...Object.values(outputData.scored || {}),
        ...Object.values(outputData.clustered || {}),
      ];

      allPaths.forEach((filePath) => {
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Error deleting processed file ${filePath}:`, err);
        });
      });
    }
  };

  // Spawn a Python process to score and cluster the data
  const pythonProcess = spawn('python', ['Process.py', ...inputFilePaths]);

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
    if (code !== 0) {
      cleanupFiles(); // clean only uploads, no processed output
      return res.status(500).send({ message: 'Python script failed', error: `Exit code: ${code}` });
    }

    let outputData;
    try {
      outputData = JSON.parse(jsonOutput);
    } catch (e) {
      console.error("Failed to parse Python output:", e);
      cleanupFiles(); // clean only uploads, no processed output
      return res.status(500).send({ message: 'Invalid output from Python script' });
    }

    // Create a ZIP archive and send it to the client
    const archive = archiver('zip');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="processed_files.zip"');
    archive.pipe(res);

    req.files.forEach((file) => {
      const originalName = path.parse(file.originalname).name;
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

    archive.finalize();

    archive.on('end', () => {
      cleanupFiles(outputData);
    });

    archive.on('error', (err) => {
      console.error("Error creating ZIP archive:", err);
      cleanupFiles(outputData);
      res.status(500).send({ message: 'Failed to create archive' });
    });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
