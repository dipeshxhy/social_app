import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import instance from '../utils/axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const RightSidebar = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const resp = await instance.get('/users/suggested');
        if (resp.data.success) {
          setSuggestedUsers(resp.data.data || []);
        }
      } catch {
        setSuggestedUsers([]);
      }
    };

    fetchSuggestedUsers();
  }, []);

  return (
    <aside className="sticky top-6 space-y-6 rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Suggestions for you
          </h2>
          <Link
            to="/search"
            className="text-xs font-medium text-[#0095F6] hover:underline"
          >
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {suggestedUsers.slice(0, 5).map((user) => (
            <Link
              key={user._id}
              to={`/profile?user=${user._id}`}
              className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-gray-100"
            >
              <Avatar>
                <AvatarImage src={user.profilePicture} alt={user.username} />
                <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{user.username}</p>
                <p className="truncate text-xs text-gray-500">{user.bio || 'No bio yet'}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
export default RightSidebar;
