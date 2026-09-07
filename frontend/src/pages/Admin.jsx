import {
  Heart,
  Image,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import instance from '../utils/axios';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from '../components/ui/toast';
import { Input } from '../components/ui/input';

const TABS = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard /> },
  { key: 'users', label: 'Users', icon: <Users /> },
  { key: 'posts', label: 'Posts', icon: <Image /> },
];

const StatCard = ({ label, value, icon }) => (
  <div className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm">
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0095F6]/10 text-[#0095F6]">
      {icon}
    </div>
    <div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const Admin = () => {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [postQuery, setPostQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const loadAdminData = async () => {
  const [statsResp, usersResp, postsResp] = await Promise.all([
    instance.get('/admin/stats'),
    instance.get('/admin/users'),
    instance.get('/admin/posts'),
  ]);
  return {
    stats: statsResp.data.success ? statsResp.data.data : null,
    users: usersResp.data.data || [],
    posts: postsResp.data.data || [],
  };
};

const applyAdminData = (data) => {
  setStats(data.stats);
  setUsers(data.users);
  setPosts(data.posts);
  setLoading(false);
};

useEffect(() => {
  const boot = async () => {
    try {
      applyAdminData(await loadAdminData());
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not load admin data.',
      });
      setLoading(false);
    }
  };

  boot();
}, []);

const handleRefresh = () => {
  setLoading(true);
  loadAdminData()
    .then(applyAdminData)
    .catch((error) => {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not load admin data.',
      });
      setLoading(false);
    });
};

  const filteredUsers = useMemo(() => {
    const q = userQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q),
    );
  }, [userQuery, users]);

  const filteredPosts = useMemo(() => {
    const q = postQuery.toLowerCase();
    return posts.filter(
      (post) =>
        post.caption?.toLowerCase().includes(q) ||
        post.author?.username?.toLowerCase().includes(q),
    );
  }, [postQuery, posts]);

  const toggleRole = async (user) => {
    setBusyId(`role-${user._id}`);
    try {
      const resp = await instance.patch(`/admin/users/${user._id}/role`);
      if (resp.data.success) {
        setUsers((prev) => prev.map((u) => (u._id === user._id ? resp.data.data : u)));
        toast.add({
          type: 'success',
          title: 'Role updated',
          description: resp.data.msg,
        });
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not update role.',
      });
    } finally {
      setBusyId('');
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.username}" and all their content?`)) {
      return;
    }
    setBusyId(`user-${user._id}`);
    try {
      const resp = await instance.delete(`/admin/users/${user._id}`);
      if (resp.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        setStats((prev) =>
          prev
            ? {
                ...prev,
                counts: { ...prev.counts, totalUsers: Math.max(0, prev.counts.totalUsers - 1) },
              }
            : prev,
        );
        toast.add({
          type: 'success',
          title: 'User deleted',
          description: resp.data.msg,
        });
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not delete user.',
      });
    } finally {
      setBusyId('');
    }
  };

  const deletePost = async (post) => {
    if (!window.confirm(`Delete post by "${post.author?.username}"?`)) {
      return;
    }
    setBusyId(`post-${post._id}`);
    try {
      const resp = await instance.delete(`/admin/posts/${post._id}`);
      if (resp.data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== post._id));
        setStats((prev) =>
          prev
            ? {
                ...prev,
                counts: { ...prev.counts, totalPosts: Math.max(0, prev.counts.totalPosts - 1) },
              }
            : prev,
        );
        toast.add({
          type: 'success',
          title: 'Post deleted',
          description: resp.data.msg,
        });
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not delete post.',
      });
    } finally {
      setBusyId('');
    }
  };

  const busy = (key) => busyId === key;

  if (loading && !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage users, moderate posts and monitor platform activity.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </button>
        </div>

        <div className="flex gap-2 rounded-2xl border bg-white p-1.5 shadow-sm">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                tab === item.key
                  ? 'bg-[#0095F6] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total users" value={stats.counts.totalUsers} icon={<Users />} />
              <StatCard label="Total posts" value={stats.counts.totalPosts} icon={<ImagePlus />} />
              <StatCard label="Active stories" value={stats.counts.totalStories} icon={<Heart />} />
              <StatCard label="Comments" value={stats.counts.totalComments} icon={<MessageCircle />} />
              <StatCard label="Messages" value={stats.counts.totalMessages} icon={<MessageCircle />} />
              <StatCard label="Notifications" value={stats.counts.totalNotifications} icon={<Heart />} />
              <StatCard label="New users (7d)" value={stats.counts.newUsersThisWeek} icon={<Users />} />
              <StatCard label="New posts (7d)" value={stats.counts.newPostsThisWeek} icon={<ImagePlus />} />
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Recently joined</h2>
              <div className="mt-4 divide-y divide-gray-100">
                {stats.recentUsers?.map((user) => (
                  <div key={user._id} className="flex items-center gap-3 py-3">
                    <Avatar>
                      <AvatarImage src={user.profilePicture} alt={user.username} />
                      <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{user.username}</p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                Users <span className="text-sm font-normal text-gray-400">({users.length})</span>
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Search by username or email..."
                  value={userQuery}
                  onChange={(event) => setUserQuery(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase">
                    <th className="pb-3 font-medium">User</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Joined</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const isAdmin = user.role === 'admin';
                    return (
                      <tr key={user._id} className="border-b border-gray-50">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profilePicture} alt={user.username} />
                              <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{user.username}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {isAdmin ? <ShieldCheck className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                            {isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                        <td className="py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => toggleRole(user)}
                              disabled={busy(`role-${user._id}`)}
                              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                            >
                              {busy(`role-${user._id}`) ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : isAdmin ? (
                                <Shield className="h-3.5 w-3.5" />
                              ) : (
                                <ShieldCheck className="h-3.5 w-3.5" />
                              )}
                              {isAdmin ? 'Remove admin' : 'Make admin'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteUser(user)}
                              disabled={busy(`user-${user._id}`)}
                              className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                            >
                              {busy(`user-${user._id}`) ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-sm text-gray-400">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'posts' && (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                Posts <span className="text-sm font-normal text-gray-400">({posts.length})</span>
              </h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Search by caption or author..."
                  value={postQuery}
                  onChange={(event) => setPostQuery(event.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase">
                    <th className="pb-3 font-medium">Post</th>
                    <th className="pb-3 font-medium">Author</th>
                    <th className="pb-3 font-medium">Likes / Comments</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post._id} className="border-b border-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={post.image}
                            alt={post.caption}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <p className="max-w-[240px] truncate text-gray-700">
                            {post.caption || 'No caption'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 font-medium">{post.author?.username || 'Unknown'}</td>
                      <td className="py-3 text-gray-500">
                        {post.likes?.length ?? 0} / {post.comments?.length ?? 0}
                      </td>
                      <td className="py-3 text-gray-500">{formatDate(post.createdAt)}</td>
                      <td className="py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => deletePost(post)}
                            disabled={busy(`post-${post._id}`)}
                            className="flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                          >
                            {busy(`post-${post._id}`) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPosts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-sm text-gray-400">
                        No posts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;