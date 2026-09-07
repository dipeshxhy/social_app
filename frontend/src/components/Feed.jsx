import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Posts from './Posts';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Feed = () => {
  const { posts } = useSelector((store) => store.post);

  const stories = useMemo(() => {
    const seen = new Set();
    return posts
      .map((post) => post.author)
      .filter((author) => {
        if (!author?._id || seen.has(author._id)) {
          return false;
        }
        seen.add(author._id);
        return true;
      })
      .slice(0, 8);
  }, [posts]);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full max-w-[630px]">
        <div className="mb-6 rounded-3xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
              Stories
            </h2>
            <span className="text-xs font-medium text-gray-400">For you</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-1">
            {stories.map((author) => (
              <div key={author._id} className="flex min-w-[72px] flex-col items-center gap-2">
                <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-fuchsia-500 p-[2px]">
                  <Avatar className="h-14 w-14 border-2 border-white">
                    <AvatarImage src={author.profilePicture} alt={author.username} />
                    <AvatarFallback>{author.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="max-w-[72px] truncate text-[11px] text-center font-medium text-gray-600">
                  {author.username}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Posts />
      </div>
    </div>
  );
};
export default Feed;
