import { Copy, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import instance from '../utils/axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from './ui/toast';

const ShareDialog = ({ open, setOpen, post }) => {
  const [users, setUsers] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchUsers = async () => {
      try {
        const resp = await instance.get('/users/suggested');
        if (resp.data.success) {
          setUsers(resp.data.data || []);
        }
      } catch {
        setUsers([]);
      }
    };

    fetchUsers();
  }, [open]);

  const copyLink = async () => {
    const link = post?.image;
    try {
      await navigator.clipboard.writeText(link);
      toast.add({
        type: 'success',
        title: 'Link copied',
        description: 'The post link was copied to your clipboard.',
      });
    } catch {
      toast.add({
        type: 'error',
        title: 'Error',
        description: 'Could not copy the link.',
      });
    }
  };

  const shareToUser = async (recipient) => {
    if (!recipient?._id) return;

    setSending(true);
    try {
      const resp = await instance.post(`/messages/send/${recipient._id}`, {
        message: `Shared a post: ${post?.caption || 'Check out this post'}`,
        postId: post?._id,
      });
      if (resp.data.success) {
        toast.add({
          type: 'success',
          title: 'Shared',
          description: `Post sent to ${recipient.username}.`,
        });
        setOpen(false);
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not share the post.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share post</DialogTitle>
        </DialogHeader>

        <div className="overflow-hidden rounded-2xl border">
          <img src={post?.image} alt={post?.caption} className="h-36 w-full object-cover" />
          <div className="p-3">
            <p className="text-sm font-medium">{post?.author?.username}</p>
            <p className="line-clamp-2 text-xs text-gray-500">{post?.caption || 'No caption'}</p>
          </div>
        </div>

        <Button type="button" variant="outline" onClick={copyLink} className="w-full">
          <Copy className="mr-2 h-4 w-4" />
          Copy link
        </Button>

        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-600">
            <Send className="h-4 w-4" />
            Send in message
          </p>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {sending ? (
              <p className="py-4 text-center text-sm text-gray-500">Sharing...</p>
            ) : users.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">No users to share with.</p>
            ) : (
              users.map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => shareToUser(item)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 p-3 text-left transition hover:bg-gray-50"
                >
                  <Avatar>
                    <AvatarImage src={item.profilePicture} alt={item.username} />
                    <AvatarFallback>{item.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.username}</p>
                    <p className="truncate text-xs text-gray-500">{item.bio || 'Tap to share'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ShareDialog;