import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Textarea } from './ui/textarea';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef(null);

  return (
    <div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <h1 className="text-center font-semibold">Create New Post</h1>
          </DialogHeader>
          <div className="flex items-center  gap-3 ">
            <Avatar>
              <AvatarImage src="" alt="User Avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-xs">Username</h1>
              <span className="text-gray-600 text-xs">bio...</span>
            </div>
          </div>
          <Textarea
            className={'focus-visible:ring-transparent border-0 '}
            placeholder="Write Caption..."
          ></Textarea>
          <input type="file" className="hidden" ref={imageRef} />
          <Button
            onClick={() => imageRef.current?.click()}
            className={'w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'}
          >
            Select from device
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default CreatePost;
