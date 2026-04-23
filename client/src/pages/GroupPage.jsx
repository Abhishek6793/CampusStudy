import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ChatBox from '../components/ChatBox.jsx';
import FileUpload from '../components/FileUpload.jsx';
import SessionScheduler from '../components/SessionScheduler.jsx';

export default function GroupPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const res = await api.get(`/groups/${id}`);
        setGroup(res.data.group);
      } catch {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchGroup();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading group...</div>;
  if (!group) return null;

  const isMember = group.members.some((m) => m.user._id === user._id);
  const tabs = ['chat', 'files', 'sessions', 'members'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Group Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-500 mt-1">{group.description}</p>
            <div className="flex gap-3 mt-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {group.subject}
              </span>
              <span className="text-xs text-gray-500">
                {group.members.length}/{group.maxMembers} members
              </span>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary text-sm">
            ← Back
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
              activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'chat' && <ChatBox groupId={id} />}

        {activeTab === 'files' && (
          <div className="card">
            {isMember && <FileList groupId={id} />}
            {!isMember && <p className="text-gray-400">You must be a member to view files</p>}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="card">
            {isMember && <SessionScheduler groupId={id} />}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">Members ({group.members.length})</h2>
            <ul className="divide-y divide-gray-100">
              {group.members.map((m) => (
                <li key={m.user._id} className="flex items-center gap-3 py-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                    {m.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{m.user.name}</p>
                    <p className="text-xs text-gray-500">{m.user.email}</p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    m.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline file list component
function FileList({ groupId }) {
  const [files, setFiles] = useState([]);
  const [openingFileId, setOpeningFileId] = useState('');
  const { user } = useAuth();

  const fetchFiles = () => {
    api.get(`/upload/group/${groupId}/files`)
      .then((res) => setFiles(res.data.files))
      .catch(() => {});
  };

  useEffect(() => {
    fetchFiles();
  }, [groupId]);

  const handleOpenFile = async (fileId) => {
    try {
      setOpeningFileId(fileId);
      
      // Get secure download Cloudinary URL from backend
      const res = await api.get(`/upload/group/${groupId}/files/${fileId}/download`);

      if (res.data?.redirectUrl) {
         // Create invisible link to Cloudinary URL that has `fl_attachment`
         const link = document.createElement('a');
         link.href = res.data.redirectUrl;
         link.target = '_blank';
         link.rel = 'noopener noreferrer';
         
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
      } else {
         throw new Error("Could not find file URL");
      }
    } catch (error) {
      // Fallback: Open original URL if stored
      const fileToOpen = files.find(f => f._id === fileId);
      if (fileToOpen && fileToOpen.url) {
         window.location.assign(fileToOpen.url);
      } else {
         alert(error.response?.data?.message || error.message || 'Failed to open file');
      }
    } finally {
      setOpeningFileId('');
    }
  };

  return (
    <>
      <FileUpload groupId={groupId} onUploaded={fetchFiles} />
      {files.length === 0 ? (
        <p className="text-gray-400 text-sm mt-4">No files uploaded yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {files.map((file) => (
            <li key={file._id} className="flex items-center gap-3 py-3">
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-800 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">by {file.uploadedBy?.name}</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenFile(file._id)}
                className="btn-secondary text-xs py-1 disabled:opacity-60"
                disabled={openingFileId === file._id}
              >
                {openingFileId === file._id ? 'Opening...' : 'Download'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
