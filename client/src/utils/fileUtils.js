import axios from "axios";
import { parseCsvFile } from './csvUtils';

export function handleFileChange(fileList, setFiles, setError, setIsDone, setSelectedFile, setFeatures, setGridRows, setGridColumns) {
    const selectedFiles = Array.from(fileList);
    setFiles(selectedFiles);
    setError(null);
    setIsDone(false);

    if (selectedFiles.length > 0) {
      const file = selectedFiles[0];
      setSelectedFile(file);
      parseCsvFile(file, setFeatures, setGridRows, setGridColumns, setError);
    }
}

  

export async function handleFileSubmit(files, setIsProcessing, setIsDone, setZipFileUrl, setError) {
  if (files.length === 0) {
    setError("No files selected");
    return;
  }

  const url = "http://localhost:8080/uploadFiles";
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    setIsProcessing(true);
    setIsDone(false);

    const response = await axios.post(url, formData, {
      responseType: "blob",
    });

    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    setZipFileUrl(downloadUrl);
    setError(null);
    setIsProcessing(false);
    setIsDone(true);
  } catch (error) {
    console.error("Error uploading files:", error);
    setError("Error uploading or processing files");
    setIsProcessing(false);
    setIsDone(false);
  }
}
