import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { useState } from 'react';
import { FaRegHeart } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import { appendComment, removePost, updatePost } from '../redux/postSlice';
import instance from '../utils/axios';
import CommentDialog from './CommentDialog';
import ShareDialog from './ShareDialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { toast } from './ui/toast';

const Post = ({ post }) => {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const liked = post?.likes?.some((like) => (like?._id || like) === user?._id);
  const isOwnPost = post?.author?._id === user?._id;
  const isBookmarked = (user?.bookmarks || []).some(
    (bookmark) => (bookmark?._id || bookmark) === post?._id,
  );
  const isFollowingAuthor = (user?.following || []).some(
    (followingId) => (followingId?._id || followingId) === post?.author?._id,
  );

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim() && inputText.length <= 200) {
      setText(inputText);
    } else {
      setText('');
    }
  };

  const likeHandler = async () => {
    try {
      const resp = await instance.patch(`/posts/${post._id}/like`);
      if (resp.data.success) {
        dispatch(updatePost(resp.data.data));
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not update like.',
      });
    }
  };

  const commentHandler = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const resp = await instance.post(`/posts/${post._id}/comment`, { text });
      if (resp.data.success) {
        dispatch(appendComment({ postId: post._id, comment: resp.data.data }));
        setText('');
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not add comment.',
      });
    } finally {
      setLoading(false);
    }
  };

  const followToggleHandler = async () => {
    if (isOwnPost || !post?.author?._id) return;

    setActionLoading(true);
    try {
      const resp = await instance.post(`/users/${post.author._id}/followorunfollow`);
      if (resp.data.success) {
        dispatch(
          setAuthUser({
            ...user,
            following: isFollowingAuthor
              ? (user.following || []).filter(
                  (followingId) => (followingId?._id || followingId) !== post.author._id,
                )
              : [...(user.following || []), post.author._id],
          }),
        );
        setMenuOpen(false);
        toast.add({
          type: 'success',
          title: isFollowingAuthor ? 'Unfollowed' : 'Following',
          description: resp.data.msg || 'Profile action completed successfully.',
        });
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not update follow state.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const deletePostHandler = async () => {
    if (!isOwnPost) return;

    const confirmed = window.confirm('Delete this post?');
    if (!confirmed) return;

    setActionLoading(true);
    try {
      const resp = await instance.delete(`/posts/delete/${post._id}`);
      if (resp.data.success) {
        dispatch(removePost(post._id));
        setMenuOpen(false);
        toast.add({
          type: 'success',
          title: 'Post deleted',
          description: 'Your post has been removed.',
        });
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not delete post.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const bookmarkHandler = async () => {
    const currentlyBookmarked = (user?.bookmarks || []).some(
      (bookmark) => (bookmark?._id || bookmark) === post?._id,
    );
    setActionLoading(true);
    try {
      const resp = await instance.patch(`/posts/${post._id}/bookmark`);
      if (resp.data.success) {
        dispatch(
          setAuthUser({
            ...user,
            bookmarks: currentlyBookmarked
              ? (user.bookmarks || []).filter(
                  (bookmark) => (bookmark?._id || bookmark) !== post._id,
                )
              : [...(user.bookmarks || []), post._id],
          }),
        );
        toast.add({
          type: 'success',
          title: currentlyBookmarked ? 'Removed from saved' : 'Saved',
          description: currentlyBookmarked
            ? 'Post removed from your saved posts.'
            : 'Post added to your saved posts.',
        });
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description:
          error.response?.data?.msg || error.message || 'Could not update bookmark.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="mb-8 w-full overflow-hidden rounded-3xl border border-white/70 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={post?.author?.profilePicture} alt="User Avatar" />
            <AvatarFallback>
              {post?.author?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <h1>{post?.author?.username}</h1>
        </div>
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center gap-2 text-center text-sm">
            {!isOwnPost ? (
              <Button
                variant="ghost"
                className="w-full cursor-pointer font-bold text-[#ED4956]"
                onClick={followToggleHandler}
                disabled={actionLoading}
              >
                {actionLoading ? 'Working...' : isFollowingAuthor ? 'Unfollow' : 'Follow'}
              </Button>
            ) : null}
            {isOwnPost ? (
              <Button
                variant="ghost"
                className="w-full cursor-pointer font-bold text-[#ED4956]"
                onClick={deletePostHandler}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              className="w-full cursor-pointer font-bold"
              onClick={() => setMenuOpen(false)}
            >
              Cancel
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border-y border-gray-100 bg-black/5">
        <img src={post?.image} alt="post-img" className="w-full aspect-square object-cover" />
      </div>
      <div className="space-y-3 px-4 py-4">
        <div className="flex items-center gap-3">
          <FaRegHeart
            onClick={likeHandler}
            className={`cursor-pointer hover:text-gray-600 ${liked ? 'text-red-500 fill-red-500' : ''}`}
            size={24}
          />
          <MessageCircle
            onClick={() => setOpen(true)}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send
            onClick={() => setShareOpen(true)}
            className="cursor-pointer hover:text-gray-600"
          />
          <Bookmark
            onClick={bookmarkHandler}
            className={`cursor-pointer hover:text-gray-600 ml-auto ${isBookmarked ? 'fill-gray-900 text-gray-900' : ''}`}
          />
        </div>
        <span className="font-medium block mb-1">{post?.likes?.length || 0} likes</span>
        <p className="text-sm leading-6 text-slate-800">
          <span className="font-medium mr-2">{post?.author?.username}</span>
          {post?.caption}
        </p>
        <span className="cursor-pointer text-sm text-gray-400" onClick={() => setOpen(true)}>
          View all {post?.comments?.length || 0} comments
        </span>
        <CommentDialog open={open} setOpen={setOpen} post={post} />
        <ShareDialog open={shareOpen} setOpen={setShareOpen} post={post} />
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <input
            type="text"
            placeholder="Add a comment..."
            className="outline-none text-sm w-full"
            value={text}
            onChange={changeEventHandler}
          />
          {text && (
            <span
              onClick={commentHandler}
              className="text-[#3BADF8] cursor-pointer ml-2 disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
export default Post;
