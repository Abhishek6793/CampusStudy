import { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function SessionScheduler({ groupId }) {
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: 'Online',
    meetingLink: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await api.get(`/sessions/group/${groupId}`);
      setSessions(res.data.sessions);
    } catch {
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [groupId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/sessions', { ...form, groupId });
      setShowForm(false);
      setForm({ title: '', description: '', startTime: '', endTime: '', location: 'Online', meetingLink: '' });
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-600',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">Study Sessions</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          {showForm ? 'Cancel' : '+ Schedule Session'}
        </button>
      </div>

      {/* Schedule Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Title *</label>
            <input name="title" value={form.title} onChange={handleChange} className="input-field" placeholder="e.g. Mid-term Revision" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input name="location" value={form.location} onChange={handleChange} className="input-field" placeholder="Online / Library Room 3" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link (optional)</label>
            <input name="meetingLink" value={form.meetingLink} onChange={handleChange} className="input-field" placeholder="https://meet.google.com/..." />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Scheduling...' : 'Schedule Session'}
          </button>
        </form>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <p className="text-gray-400 text-sm">No sessions scheduled yet.</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s._id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-gray-800">{s.title}</h3>
                  {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                  <div className="text-xs text-gray-400 mt-2 space-y-0.5">
                    <p>🕐 {formatDate(s.startTime)} → {formatDate(s.endTime)}</p>
                    <p>📍 {s.location}</p>
                    {s.meetingLink && (
                      <a href={s.meetingLink} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                        🔗 Join Meeting
                      </a>
                    )}
                    <p>Scheduled by {s.scheduledBy?.name}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${statusColors[s.status] || ''}`}>
                  {s.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
