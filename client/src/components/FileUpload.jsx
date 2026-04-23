import { useState, useRef } from 'react';
import api from '../services/api.js';

export default function FileUpload({ groupId, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    setMessage('');
    try {
      await api.post(`/upload/group/${groupId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('✅ File uploaded successfully!');
      onUploaded?.();
    } catch (err) {
      setMessage('❌ ' + (err.response?.data?.message || 'Upload failed'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    uploadFile(file);
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-800 mb-3">Upload File</h3>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
        }`}
      >
        <div className="text-4xl mb-2">📎</div>
        <p className="text-sm text-gray-600">
          {uploading ? 'Uploading...' : 'Drop file here or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT, TXT, Images supported</p>
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
          onChange={(e) => uploadFile(e.target.files[0])}
        />
      </div>
      {message && (
        <p className="text-sm mt-2 text-gray-600">{message}</p>
      )}
    </div>
  );
}
