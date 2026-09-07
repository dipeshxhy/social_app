import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import instance from '../utils/axios';

const Saved = () => {
  const { user } = useSelector((store) => store.auth);
  const [posts, setPosts] = useState([]);

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

  const bookmarkedPostIds = useMemo(() => {
    const bookmarkIds = new Set(
      (user?.bookmarks || []).map((bookmark) => bookmark?._id || bookmark),
    );
    return bookmarkIds;
  }, [user?.bookmarks]);

  const savedPosts = useMemo(() => {
    return posts.filter((post) => bookmarkedPostIds.has(post._id));
  }, [posts, bookmarkedPostIds]);

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Saved posts</h1>
          <p className="mt-2 text-sm text-gray-500">
            Posts you&apos;ve bookmarked from your feed.
          </p>
        </div>

        {savedPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-white p-12 text-center text-gray-500 shadow-sm">
            No saved posts yet. Tap the bookmark icon on any post to save it here.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedPosts.map((post) => (
              <article
                key={post._id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >
                <img src={post.image} alt={post.caption} className="h-56 w-full object-cover" />
                <div className="p-4">
                  <Link
                    to={`/profile?user=${post.author?._id}`}
                    className="font-medium hover:underline"
                  >
                    {post.author?.username}
                  </Link>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {post.caption || 'No caption'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
