import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useNavigate } from 'react-router';
import instance from '../utils/axios';
import { toast } from './ui/toast';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/authSlice';
import { useState } from 'react';
import CreatePost from './CreatePost';

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const logoutHandler = async () => {
    try {
      const resp = await instance.post('/auth/logout');
      if (resp.data.success) {
        navigate('/signin');
        toast.add({
          type: 'success',
          title: 'Logged out',
          description: 'You have been successfully logged out.',
        });
        dispatch(setAuthUser(null));
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description:
          error.response?.data?.msg || error.message || 'An error occurred while logging out.',
      });
    }
  };
  const sidebarHandler = (textType) => {
    if (textType === 'Logout') {
      logoutHandler();
    }
    if (textType === 'Create') {
      setOpen(true);
    }
  };
  const sidebarItems = [
    {
      icon: <Home />,
      text: 'Home',
    },
    {
      icon: <Search />,
      text: 'Search',
    },
    {
      icon: <TrendingUp />,
      text: 'Explore',
    },
    {
      icon: <MessageCircle />,
      text: 'Messages',
    },
    {
      icon: <Heart />,
      text: 'Notifications',
    },
    {
      icon: <PlusSquare />,
      text: 'Create',
    },
    {
      icon: (
        <Avatar>
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>
            {user?.username
              ?.split(' ')
              .map((n) => `${n[0]}${n[1]}`.toUpperCase())

              .join('')}
          </AvatarFallback>
        </Avatar>
      ),
      text: 'Profile',
    },
    {
      icon: <LogOut />,
      text: 'Logout',
    },
  ];
  return (
    <div className="w-64 bg-white shadow-md">
      <div>
        <h1 className="p-2 text-lg font-bold">KuraKani</h1>
        {sidebarItems.map((item) => (
          <div
            key={item.text}
            onClick={() => sidebarHandler(item.text)}
            className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer"
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};
export default LeftSidebar;
