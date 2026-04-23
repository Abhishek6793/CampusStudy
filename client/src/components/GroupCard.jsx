import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';

export default function GroupCard({ group, isMember, onJoin, onRefresh }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLeave = async () => {
    if (!confirm('Leave this group?')) return;
    // When a user clicks the "Leave" button, the handleLeave function is called. 
    // It first shows a confirmation dialog to prevent accidental leaving. If the user confirms, it sends a POST request to the backend API at /groups/{groupId}/leave to remove the user from the group. 
    // After successfully leaving, it calls onRefresh to update the group list in the parent component (Dashboard).
    try {
      await api.post(`/groups/${group._id}/leave`);
      onRefresh?.();
      //.() is optional chaining to safely call onRefresh only if it's provided as a prop.
      //  This allows the GroupCard component to be reusable in different contexts where onRefresh may not be necessary.
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave group');
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{group.name}</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            {group.subject}
          </span>
        </div>
        {group.isPrivate && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-2">
            Private
          </span>
        )}
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{group.description}</p>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>👥 {group.members?.length || 0}/{group.maxMembers} members</span>
        <span>by {group.creator?.name}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2 border-t border-gray-50">
        {isMember ? (
          <>
            <button
              onClick={() => navigate(`/groups/${group._id}`)}
              //navigate is a function from react-router-dom that programmatically changes the URL. 
              // Here, it takes the user to the group detail page when they click "Open".
              className="btn-primary flex-1 text-sm py-1.5"
            >
              Open
            </button>
            <button
              onClick={handleLeave}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Leave
            </button>
          </>
        ) : (
          <button
            onClick={() => onJoin?.(group._id)}
            className="btn-primary flex-1 text-sm py-1.5"
          >
            Join Group
          </button>
        )}
      </div>
    </div>
  );
}
