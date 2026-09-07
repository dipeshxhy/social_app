import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Input } from '../components/ui/input';
import instance from '../utils/axios';

const Search = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchDiscoveryData = async () => {
      try {
        const [usersResp, postsResp] = await Promise.all([
          instance.get('/users/suggested'),
          instance.get('/posts'),
        ]);
        if (usersResp.data.success) {
          setUsers(usersResp.data.data || []);
        }
        if (postsResp.data.success) {
          setPosts(postsResp.data.data || []);
        }
      } catch {
        setUsers([]);
        setPosts([]);
      }
    };

    fetchDiscoveryData();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return users.filter((user) => {
      return (
        user.username?.toLowerCase().includes(normalizedQuery) ||
        user.bio?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, users]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return posts.filter((post) => {
      return (
        post.caption?.toLowerCase().includes(normalizedQuery) ||
        post.author?.username?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, posts]);

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Search</h1>
          <p className="mt-2 text-sm text-gray-500">Search people and posts across the app.</p>
          <Input
            className="mt-4"
            placeholder="Search users or posts..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">People</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredUsers.map((user) => (
              <Link
                key={user._id}
                to={`/profile?user=${user._id}`}
                className="flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm hover:border-gray-300"
              >
                <Avatar>
                  <AvatarImage src={user.profilePicture} alt={user.username} />
                  <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.username}</p>
                  <p className="text-xs text-gray-500 truncate">{user.bio || 'No bio yet'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Posts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <article
                key={post._id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <img src={post.image} alt={post.caption} className="h-56 w-full object-cover" />
                <div className="p-4">
                  <p className="font-medium">{post.author?.username}</p>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {post.caption || 'No caption'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Search;
