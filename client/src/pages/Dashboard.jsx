import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import GroupCard from '../components/GroupCard.jsx';
import CreateGroupModal from '../components/CreateGroupModal.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('my');
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const [myRes, allRes] = await Promise.all([
        api.get('/groups/my'),
        api.get(`/groups?search=${search}`),

        //api.get('/groups/my') fetches the groups the user has joined, while api.get(`/groups?search=${search}`) fetches all groups matching the search query. Both requests are made in parallel using Promise.all for efficiency.
      ]);
      setMyGroups(myRes.data.groups);
      setAllGroups(allRes.data.groups);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [search]);

  const handleJoin = async (groupId) => {
    try {
      await api.post(`/groups/${groupId}/join`);
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join group');
    }
  };

  const myGroupIds = myGroups.map((g) => g._id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name} 👋</h1>
          <p className="text-gray-500 mt-1">Find and manage your study groups</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Create Group
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-6">
        {['my', 'explore'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'my' ? `My Groups (${myGroups.length})` : 'Explore'}
          </button>
        ))}
      </div>

      {/* Search (Explore tab only) */}
      {activeTab === 'explore' && (
        <input
          type="text"
          placeholder="Search groups by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md mb-6"
        />
      )}

      {/* Group Grid */}
      {loading ? (
        <div className="text-center text-gray-400 py-16">Loading groups...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(activeTab === 'my' ? myGroups : allGroups).map((group) => (
            <GroupCard
              key={group._id}
              group={group}
              isMember={myGroupIds.includes(group._id)}
              //myGroupIds is an array of group IDs that the user has joined, used to determine if the user is a member of each group when rendering the GroupCard component.
              //.includes(group._id) checks if the current group ID is in the myGroupIds array, returning true if the user is a member of that group.
              onJoin={() => handleJoin(group._id)}
              onRefresh={fetchGroups}
            />
          ))}
          {(activeTab === 'my' ? myGroups : allGroups).length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-16">
              {activeTab === 'my' ? 'You have not joined any groups yet.' : 'No groups found.'}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <CreateGroupModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); fetchGroups(); }}
        />
      )}
      {/* //when I am clicking the "Create Group" button, it sets showModal to true,
      // which renders the CreateGroupModal component. 
      //The onCreated prop is a callback function that will be called after a new group is successfully created. 
      //It closes the modal and triggers a refetch of the groups to show the new group in the list immediately. */}

       {/* but why page is coming top of the dashboard when I am clicking the create group button? I want to stay in the same place where I am clicking the button.
       This is likely because when the modal opens, it causes a re-render of the Dashboard component, which resets the scroll position to the top. To fix this, you can save the current scroll position before opening the modal and restore it after the modal is closed. */}
    </div>
  );
}
