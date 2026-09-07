import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPost } from '../redux/postSlice';
import instance from '../utils/axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { toast } from './ui/toast';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef(null);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const fileChangeHandler = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : '');
    setImage(selectedFile);
  };

  const submitHandler = async () => {
    if (!image) {
      toast.add({
        type: 'error',
        title: 'Image required',
        description: 'Please choose an image before posting.',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('caption', caption);
      formData.append('image', image);

      const resp = await instance.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (resp.data.success) {
        dispatch(addPost(resp.data.data));
        toast.add({
          type: 'success',
          title: 'Post created',
          description: 'Your new post is now live.',
        });
        setCaption('');
        setImage(null);
        if (preview) {
          URL.revokeObjectURL(preview);
        }
        setPreview('');
        if (imageRef.current) {
          imageRef.current.value = '';
        }
        setOpen(false);
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not create post.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <h1 className="text-center font-semibold">Create New Post</h1>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profilePicture} alt="User Avatar" />
              <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-xs">{user?.username}</h1>
              <span className="text-gray-600 text-xs">{user?.bio || 'No bio yet'}</span>
            </div>
          </div>
          <Textarea
            className="min-h-28 border-0 focus-visible:ring-transparent"
            placeholder="Write caption..."
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
          />
          {preview ? (
            <div className="overflow-hidden rounded-2xl border">
              <img src={preview} alt="Preview" className="h-64 w-full object-cover" />
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => imageRef.current?.click()}
              className="w-fit"
            >
              Select from device
            </Button>
            <Button
              type="button"
              onClick={submitHandler}
              className="bg-[#0095F6] hover:bg-[#258bcf]"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Share'}
            </Button>
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={imageRef}
            onChange={fileChangeHandler}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default CreatePost;
