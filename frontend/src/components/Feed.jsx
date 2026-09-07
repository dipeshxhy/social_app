import { Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { connectSocket } from '../lib/socket';
import instance from '../utils/axios';
import CreateStory from './CreateStory';
import Posts from './Posts';
import StoryViewer from './StoryViewer';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const Feed = () => {
  const { user } = useSelector((store) => store.auth);
  const onlineUsers = useSelector((store) => store.online.users);
  const [stories, setStories] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [viewerGroups, setViewerGroups] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    let active = true;

    const loadStories = async () => {
      try {
        const resp = await instance.get('/stories');
        if (active && resp.data.success) {
          setStories(resp.data.data || []);
        }
      } catch {
        if (active) {
          setStories([]);
        }
      }
    };

    loadStories();

    const socket = connectSocket(user?._id);
    const handleStoryCreated = () => {
      loadStories();
    };
    const handleStoryDeleted = () => {
      loadStories();
    };

    socket.on('story:created', handleStoryCreated);
    socket.on('story:deleted', handleStoryDeleted);

    return () => {
      active = false;
      socket.off('story:created', handleStoryCreated);
      socket.off('story:deleted', handleStoryDeleted);
    };
  }, [user?._id]);

  const groups = useMemo(() => {
    const map = new Map();
    stories.forEach((story) => {
      const authorId = story.author?._id;
      if (!authorId) return;
      if (!map.has(authorId)) {
        map.set(authorId, { author: story.author, stories: [] });
      }
      map.get(authorId).stories.push(story);
    });
    return [...map.values()].sort(
      (a, b) =>
        new Date(b.stories[0].createdAt).getTime() - new Date(a.stories[0].createdAt).getTime(),
    );
  }, [stories]);

  const ownStories = useMemo(
    () => groups.filter((group) => group.author?._id === user?._id),
    [groups, user?._id],
  );
  const storyGroups = useMemo(
    () => [
      ...ownStories,
      ...groups.filter((group) => group.author?._id !== user?._id),
    ],
    [groups, ownStories, user?._id],
  );

  const openViewer = (groupIndex) => {
    setViewerGroups(storyGroups);
    setViewerIndex(groupIndex);
  };

  const handleCreated = (story) => {
    if (story?.author?._id === user?._id) {
      setStories((current) => [story, ...current]);
    }
  };

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
            <div
              key="your-story"
              onClick={() => setShowCreate(true)}
              className="flex min-w-[72px] cursor-pointer flex-col items-center gap-2"
            >
              <div className="relative">
                <div className="rounded-full bg-white/70 p-[2px]">
                  <Avatar className="h-14 w-14 border-2 border-white">
                    <AvatarImage src={user?.profilePicture} alt={user?.username} />
                    <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
                {ownStories.length > 0 ? (
                  <span className="absolute -bottom-0 -right-4 flex h-8 w-8 items-center justify-center rounded-full">
                    <span className="rounded-full bg-white p-0.5">
                      <Plus className="h-6 w-6 rounded-full bg-[#0095F6] p-1 text-white" />
                    </span>
                  </span>
                ) : (
                  <span className="absolute -bottom-0 -right-4 rounded-full bg-[#0095F6] p-0.5">
                    <Plus className="h-6 w-6 text-white" />
                  </span>
                )}
              </div>
              <span className="max-w-[72px] truncate text-center text-[11px] font-medium text-gray-600">
                {ownStories.length > 0 ? 'Your story' : 'Add story'}
              </span>
            </div>

            {storyGroups.map((group, index) => (
              <div
                key={group.author?._id}
                onClick={() => openViewer(index)}
                className="flex min-w-[72px] cursor-pointer flex-col items-center gap-2"
              >
                <div className="relative rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-fuchsia-500 p-[2px]">
                  <Avatar className="h-14 w-14 border-2 border-white">
                    <AvatarImage src={group.author?.profilePicture} alt={group.author?.username} />
                    <AvatarFallback>
                      {group.author?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {onlineUsers.includes(group.author?._id) ? (
                    <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white" />
                  ) : null}
                </div>
                <span className="max-w-[72px] truncate text-center text-[11px] font-medium text-gray-600">
                  {group.author?.username}
                </span>
              </div>
            ))}
          </div>
        </div>
        <Posts />
        <CreateStory open={showCreate} setOpen={setShowCreate} onCreated={handleCreated} />
        {viewerGroups ? (
          <StoryViewer
            groups={viewerGroups}
            initialGroupIndex={viewerIndex}
            onClose={() => setViewerGroups(null)}
          />
        ) : null}
      </div>
    </div>
  );
};
export default Feed;