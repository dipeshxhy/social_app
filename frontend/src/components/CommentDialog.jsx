import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router';
import { appendComment } from '../redux/postSlice';
import instance from '../utils/axios';
import Comment from './Comment';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { toast } from './ui/toast';

const CommentDialog = ({ open, setOpen, post }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim() && inputText.length <= 200) {
      setText(inputText);
    } else {
      setText('');
    }
  };
  const sendMessageHandler = async () => {
    if (!text.trim() || !post?._id) return;

    setLoading(true);
    try {
      const resp = await instance.post(`/posts/${post._id}/comment`, { text });
      if (resp.data.success) {
        dispatch(appendComment({ postId: post._id, comment: resp.data.data }));
        setText('');
        toast.add({
          type: 'success',
          title: 'Comment added',
          description: 'Your comment was posted successfully.',
        });
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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={'sm:max-w-5xl p-0 flex flex-col'}>
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src={post?.image}
              alt="post-img"
              className="rounded-l-lg  w-full h-full object-cover"
            />
          </div>
          <div className="w-1/2 flex flex-col justify-between">
            <div className="flex items-center justify-between p-4 mt-4">
              <div className="flex gap-3 items-center">
                <Link to="/profile">
                  <Avatar>
                    <AvatarImage src={post?.author?.profilePicture} alt="User Avatar" />
                    <AvatarFallback>
                      {post?.author?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold text-xs">
                    {post?.author?.username || 'username'}
                  </Link>
                </div>
              </div>
              <MoreHorizontal className="cursor-pointer" />
            </div>
            <hr />
            <div className="flex-1 overflow-y-auto max-h-96 p-4">
              {(post?.comments || []).map((comment) => (
                <Comment key={comment._id} comment={comment} />
              ))}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="outline-none text-sm w-full border-gray-300 p-2 rounded"
                  value={text}
                  onChange={changeEventHandler}
                />
                <Button
                  onClick={sendMessageHandler}
                  variant="outline"
                  disabled={!text.trim() || loading}
                >
                  {loading ? 'sending...' : 'send'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
