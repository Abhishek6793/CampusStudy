import { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes, groupsRes, msgsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/groups'),
          api.get('/admin/messages'),
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
        setGroups(groupsRes.data.groups);
        setMessages(msgsRes.data.messages);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const toggleUser = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle`);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u)));
      // When the admin clicks the "Ban" or "Unban" button for a user, the toggleUser function is called with the user's ID. 
      // It sends a PATCH request to the backend API at /admin/users/{userId}/toggle to change the user's active status. 
      // After receiving a successful response, it updates the local users state by toggling the isActive property of the affected user, which immediately reflects the change in the UI without needing to refetch the entire user list.
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const deleteGroup = async (groupId) => {
    if (!confirm('Delete this group?')) return;
    try {
      await api.delete(`/admin/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => g._id !== groupId));
    } catch {
      alert('Failed to delete group');
    }
  };

  const deleteMessage = async (msgId) => {
    try {
      await api.delete(`/admin/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch {
      alert('Failed to delete message');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-400">Loading admin data...</div>;

  const tabs = ['overview', 'users', 'groups', 'messages'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage users, groups, and content</p>

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

      {/* Overview Stats */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
            { label: 'Total Groups', value: stats.totalGroups, icon: '📚' },
            { label: 'Total Messages', value: stats.totalMessages, icon: '💬' },
            { label: 'Total Sessions', value: stats.totalSessions, icon: '📅' },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card overflow-x-auto">
          <h2 className="font-semibold text-gray-800 mb-4">All Users ({users.length})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                <th className="text-left py-2 text-gray-500 font-medium">Email</th>
                <th className="text-left py-2 text-gray-500 font-medium">Role</th>
                <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                <th className="text-left py-2 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="py-3 text-gray-500">{u.email}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>{u.role}</span>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>{u.isActive ? 'Active' : 'Banned'}</span>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleUser(u._id)}
                      className={`text-xs px-3 py-1 rounded-lg border transition-colors ${
                        u.isActive
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      {u.isActive ? 'Ban' : 'Unban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="card overflow-x-auto">
          <h2 className="font-semibold text-gray-800 mb-4">All Groups ({groups.length})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">Name</th>
                <th className="text-left py-2 text-gray-500 font-medium">Subject</th>
                <th className="text-left py-2 text-gray-500 font-medium">Creator</th>
                <th className="text-left py-2 text-gray-500 font-medium">Members</th>
                <th className="text-left py-2 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groups.map((g) => (
                <tr key={g._id}>
                  <td className="py-3 font-medium text-gray-800">{g.name}</td>
                  <td className="py-3 text-gray-500">{g.subject}</td>
                  <td className="py-3 text-gray-500">{g.creator?.name}</td>
                  <td className="py-3 text-gray-500">{g.members?.length}</td>
                  <td className="py-3">
                    <button
                      onClick={() => deleteGroup(g._id)}
                      className="text-xs px-3 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-4">Recent Messages ({messages.length})</h2>
          <ul className="divide-y divide-gray-100">
            {messages.map((msg) => (
              <li key={msg._id} className="flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                  {msg.sender?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 text-xs text-gray-500 mb-0.5">
                    <span className="font-medium text-gray-700">{msg.sender?.name}</span>
                    <span>in</span>
                    <span className="font-medium text-blue-600">{msg.group?.name}</span>
                  </div>
                  <p className="text-sm text-gray-800">{msg.content}</p>
                </div>
                <button
                  onClick={() => deleteMessage(msg._id)}
                  className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 shrink-0"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
