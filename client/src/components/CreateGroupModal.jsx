import { useState } from 'react';
import api from '../services/api.js';

export default function CreateGroupModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '',
    subject: '',
    description: '',
    maxMembers: 50,
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/groups', form);
      onCreated();
      //onCreated will trigger a refetch in Dashboard to show the new group immediately
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
      //error.response?.data?.message is the error message sent by the backend, if available
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Create New Group</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Data Structures Study Group"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Computer Science"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="input-field resize-none"
              rows={3}
              placeholder="What is this group about?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Members</label>
            <input
              type="number"
              name="maxMembers"
              value={form.maxMembers}
              onChange={handleChange}
              className="input-field"
              min={2}
              max={200}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isPrivate"
              checked={form.isPrivate}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-gray-700">Make this group private</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
