import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { FaRegHeart } from 'react-icons/fa';
import CommentDialog from './CommentDialog';
import { useState } from 'react';

const Post = () => {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim() && inputText.length <= 200) {
      setText(inputText);
    } else {
      setText('');
    }
  };
  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="" alt="User Avatar" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <h1>username</h1>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className=" flex text-sm text-center flex-col items-center">
            <Button variant="ghost" className="cursor-pointer w-fit text-[#ED4956] font-bold">
              Unfollow
            </Button>
            <Button variant="ghost" className="cursor-pointer w-fit  font-bold">
              Add to Favorites
            </Button>
            <Button variant="ghost" className="cursor-pointer w-fit  font-bold">
              Delete
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <img
        src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxhcHRvcHxlbnwwfHwwfHx8MA%3D%3D"
        alt="post-img"
        className="rounded-sm my-2 w-full aspect-square object-cover"
      />
      <div className="my-2">
        <div className="flex items-center gap-3">
          <FaRegHeart className="cursor-pointer hover:text-gray-600" size={24} />
          <MessageCircle
            onClick={() => setOpen(true)}
            className="cursor-pointer hover:text-gray-600"
          />
          <Send className="cursor-pointer hover:text-gray-600" />
          <Bookmark className="cursor-pointer hover:text-gray-600 ml-auto" />
        </div>
        <span className="font-medium block mb-1">200 likes</span>
        <p>
          <span className="font-medium mr-2">username</span>
        </p>
        <span className="cursor-pointer text-xm text-gray-400" onClick={() => setOpen(true)}>
          View all 10 comments
        </span>
        <CommentDialog open={open} setOpen={setOpen} />
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Add a comment..."
            className="outline-none text-sm w-full"
            value={text}
            onChange={changeEventHandler}
          />
          {text && <span className="text-[#3BADF8] cursor-pointer">Post</span>}
        </div>
      </div>
    </div>
  );
};
export default Post;
