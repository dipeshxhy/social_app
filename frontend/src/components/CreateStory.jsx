import { ImagePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import instance from '../utils/axios';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { toast } from './ui/toast';

const STORY_INPUT_ID = 'story-image-input';

const CreateStory = ({ open, setOpen, onCreated }) => {
  const imageRef = useRef(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((store) => store.auth);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setImage(null);
      setPreview('');
      if (imageRef.current) {
        imageRef.current.value = '';
      }
    }
    setOpen(nextOpen);
  };

  const fileChangeHandler = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(selectedFile ? URL.createObjectURL(selectedFile) : '');
    setImage(selectedFile);
    if (event.target) {
      event.target.value = '';
    }
  };

  const submitHandler = async () => {
    if (!image) {
      toast.add({
        type: 'error',
        title: 'Image required',
        description: 'Please choose an image for your story.',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);

      const resp = await instance.post('/stories', formData);

      if (resp.data.success) {
        toast.add({
          type: 'success',
          title: 'Story created',
          description: 'Your story is now live for 24 hours.',
        });
        onCreated?.(resp.data.data);
        setOpen(false);
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not create story.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <h1 className="text-center font-semibold">Add to your story</h1>
        </DialogHeader>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="User Avatar" />
            <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
            <span className="text-xs text-gray-600">Stories disappear after 24 hours</span>
          </div>
        </div>

        {preview ? (
          <div className="overflow-hidden rounded-2xl border">
            <img src={preview} alt="Story preview" className="h-[55vh] w-full object-cover" />
          </div>
        ) : (
          <label
            htmlFor={STORY_INPUT_ID}
            className="flex aspect-[9/16] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 text-sm text-gray-500 transition hover:border-[#0095F6] hover:text-[#0095F6]"
          >
            <ImagePlus className="h-10 w-10" />
            <span>Choose an image to start your story</span>
            <span className="text-xs text-gray-400">Tap anywhere to select</span>
          </label>
        )}

        <div className="flex items-center justify-between gap-3">
          <label htmlFor={STORY_INPUT_ID} className="cursor-pointer">
            <Button type="button" variant="outline" className="w-fit">
              {preview ? 'Choose another' : 'Select from device'}
            </Button>
          </label>
          <Button
            type="button"
            onClick={submitHandler}
            className="bg-[#0095F6] hover:bg-[#258bcf]"
            disabled={loading || !image}
          >
            {loading ? 'Posting...' : 'Share story'}
          </Button>
        </div>
        <input
          id={STORY_INPUT_ID}
          ref={imageRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={fileChangeHandler}
        />
      </DialogContent>
    </Dialog>
  );
};
export default CreateStory;