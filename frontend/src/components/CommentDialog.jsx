import { Link } from 'react-router';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MoreHorizontal } from 'lucide-react';
import Comment from './Comment';
import { useState } from 'react';
import { Button } from './ui/button';

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState('');
  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim() && inputText.length <= 200) {
      setText(inputText);
    } else {
      setText('');
    }
  };
  const sendMessageHandler = async () => {
    alert(text);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={'sm:max-w-[1024px] p-0 flex flex-col'}>
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxhcHRvcHxlbnwwfHwwfHx8MA%3D%3D"
              alt="post-img"
              className="rounded-l-lg  w-full h-full object-cover"
            />
          </div>
          <div className="w-1/2 flex flex-col justify-between">
            <div className="flex items-center justify-between p-4 mt-4">
              <div className="flex gap-3 items-center">
                <Link to="/profile">
                  <Avatar>
                    <AvatarImage src="" alt="User Avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold text-xs">username</Link>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer" />
                  <DialogContent className={'flex flex-col items-center text-sm text-center'}>
                    <div className="cursor-pointer w-full text-[#ED4956" font-bold>
                      Unfollow
                    </div>
                    <div className="cursor-pointer w-full font-bold">Add to Favorites</div>
                  </DialogContent>
                </DialogTrigger>
              </Dialog>
            </div>
            <hr />
            <div className="flex-1 overflow-y-auto max-h-96 p-4">
              <Comment />
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
                <Button onClick={sendMessageHandler} variant="outline" disabled={!text.trim()}>
                  send
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
