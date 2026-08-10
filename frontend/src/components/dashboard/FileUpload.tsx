'use client';

import { useState } from 'react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<{ success: boolean; message: string }>;
  uploading?: boolean;
}

export function FileUpload({ onUpload, uploading: externalUploading }: FileUploadProps) {
  const [internalUploading, setInternalUploading] = useState(false);
  const [message, setMessage] = useState('');

  const isUploading = externalUploading !== undefined ? externalUploading : internalUploading;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInternalUploading(true);
    setMessage('');

    try {
      const result = await onUpload(file);
      setMessage(result.message);
    } catch (error) {
      setMessage('Upload failed. Please try again.');
    } finally {
      setInternalUploading(false);
    }
  };

  return (
    <div className="file-upload-container">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={isUploading}
        className="form-control file-upload-input"
        id="file-upload"
      />
      <label htmlFor="file-upload" className={`file-upload-label ${isUploading ? 'disabled' : ''}`}>
        <i className="fas fa-cloud-upload-alt"></i>
        <span>{isUploading ? 'Uploading...' : 'Choose CSV File'}</span>
      </label>
      {message && (
        <div className={`alert ${message.includes('SUCCESS') ? 'alert-success' : 'alert-danger'} mt-2`}>
          {message}
        </div>
      )}
    </div>
  );
}
