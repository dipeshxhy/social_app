import { useEffect, useMemo, useState } from 'react';
import instance from '../utils/axios';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const resp = await instance.get('/posts');
        if (resp.data.success) {
          setPosts(resp.data.data || []);
        }
      } catch {
        setPosts([]);
      }
    };

    fetchPosts();
  }, []);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.toLowerCase();
    return posts.filter((post) => {
      return (
        post.caption?.toLowerCase().includes(normalizedQuery) ||
        post.author?.username?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [posts, query]);

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Explore</h1>
          <p className="mt-2 text-sm text-gray-500">Browse trending posts and discovery content.</p>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter posts..."
            className="mt-4 h-10 w-full rounded-md border border-gray-200 px-3 text-sm outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPosts.map((post) => (
            <article
              key={post._id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              <img src={post.image} alt={post.caption} className="h-72 w-full object-cover" />
              <div className="p-4">
                <p className="font-medium">{post.author?.username}</p>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {post.caption || 'No caption'}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;
