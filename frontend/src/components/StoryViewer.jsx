import { ChevronLeft, ChevronRight, Loader2, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import instance from '../utils/axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from './ui/toast';

const StoryViewer = ({ groups, initialGroupIndex, onClose }) => {
  const { user } = useSelector((store) => store.auth);
  const [viewerGroups, setViewerGroups] = useState(groups);
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const currentGroup = viewerGroups[groupIndex];
  const currentStory = currentGroup?.stories?.[storyIndex];
  const isOwnStory = currentGroup?.author?._id === user?._id;

  const markViewed = useCallback((story) => {
    if (story?._id) {
      instance.patch(`/stories/${story._id}/view`).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (currentStory) {
      markViewed(currentStory);
    }
  }, [currentStory, markViewed]);

  useEffect(() => {
    if (!currentStory) return undefined;
    const timer = setTimeout(() => {
      if (storyIndex < (currentGroup?.stories?.length || 1) - 1) {
        setStoryIndex((current) => current + 1);
      } else if (groupIndex < viewerGroups.length - 1) {
        setGroupIndex((current) => current + 1);
        setStoryIndex(0);
      } else {
        onClose();
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [
    storyIndex,
    groupIndex,
    currentGroup?.stories?.length,
    currentStory,
    viewerGroups.length,
    onClose,
  ]);

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((current) => current - 1);
    } else if (groupIndex > 0) {
      const prevGroup = viewerGroups[groupIndex - 1];
      setGroupIndex(groupIndex - 1);
      setStoryIndex((prevGroup?.stories?.length || 1) - 1);
    }
  };

  const goNext = () => {
    if (storyIndex < (currentGroup?.stories?.length || 1) - 1) {
      setStoryIndex((current) => current + 1);
    } else if (groupIndex < viewerGroups.length - 1) {
      setGroupIndex((current) => current + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!currentStory) return;
    if (!window.confirm('Delete this story?')) {
      return;
    }
    setDeleting(true);
    try {
      const resp = await instance.delete(`/stories/${currentStory._id}`);
      if (resp.data.success) {
        toast.add({
          type: 'success',
          title: 'Story deleted',
          description: 'Your story has been removed.',
        });

        const updatedGroups = viewerGroups
          .map((group) =>
            group.author?._id === currentGroup?.author?._id
              ? { ...group, stories: group.stories.filter((story) => story._id !== currentStory._id) }
              : group,
          )
          .filter((group) => group.stories.length > 0);

        if (updatedGroups.length === 0) {
          onClose();
          return;
        }

        const sameAuthorIndex = updatedGroups.findIndex(
          (group) => group.author?._id === currentGroup?.author?._id,
        );

        if (sameAuthorIndex === -1) {
          const nextIndex = Math.min(groupIndex, updatedGroups.length - 1);
          setViewerGroups(updatedGroups);
          setGroupIndex(nextIndex);
          setStoryIndex(0);
        } else {
          const remaining = updatedGroups[sameAuthorIndex].stories;
          setViewerGroups(updatedGroups);
          setGroupIndex(sameAuthorIndex);
          setStoryIndex(Math.min(storyIndex, remaining.length - 1));
        }
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not delete this story.',
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-md">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            <Avatar className="h-9 w-9 border-2 border-white/40">
              <AvatarImage
                src={currentGroup.author?.profilePicture}
                alt={currentGroup.author?.username}
              />
              <AvatarFallback>
                {currentGroup.author?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{currentGroup.author?.username}</span>
            <span className="text-xs text-white/70">
              {currentStory.createdAt
                ? new Date(currentStory.createdAt).toLocaleTimeString()
                : ''}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isOwnStory && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="text-white/80 transition hover:text-rose-400 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}
              </button>
            )}
            <X onClick={onClose} className="h-6 w-6 cursor-pointer text-white" />
          </div>
        </div>

        <div className="mb-2 flex gap-1">
          {(currentGroup.stories || []).map((story, index) => (
            <div
              key={story._id}
              className={`h-1 flex-1 rounded-full ${
                index <= storyIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={currentStory.image}
            alt="story"
            className="aspect-[9/16] w-full object-cover"
          />
          <div onClick={goPrev} className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" />
          <div onClick={goNext} className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" />
        </div>

        <div className="mt-3 flex items-center justify-center gap-3 text-white/80">
          <ChevronLeft onClick={goPrev} className="h-6 w-6 cursor-pointer" />
          <ChevronRight onClick={goNext} className="h-6 w-6 cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
export default StoryViewer;