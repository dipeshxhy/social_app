import { Bookmark, Heart, Home, LogOut, MessageCircle, PlusSquare, Search, ShieldCheck, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { setAuthUser } from '../redux/authSlice';
import { clearMessageUnreadCount, markAllNotificationsRead } from '../redux/notificationSlice';
import instance from '../utils/axios';
import CreatePost from './CreatePost';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from './ui/toast';

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { items: notifications } = useSelector((store) => store.notification);
  const { messageUnreadCount } = useSelector((store) => store.notification);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const unreadNotificationCount = notifications.filter((item) => !item.read).length;
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
    if (textType === 'Home') {
      navigate('/');
    }
    if (textType === 'Profile') {
      navigate('/profile');
    }
    if (textType === 'Messages') {
      dispatch(clearMessageUnreadCount());
      navigate('/messages');
    }
    if (textType === 'Notifications') {
      dispatch(markAllNotificationsRead());
      navigate('/notifications');
    }
    if (textType === 'Search') {
      navigate('/search');
    }
    if (textType === 'Explore') {
      navigate('/explore');
    }
    if (textType === 'Saved') {
      navigate('/saved');
    }
    if (textType === 'Admin') {
      navigate('/admin');
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
      icon: <Bookmark />,
      text: 'Saved',
    },
    {
      icon: <MessageCircle />,
      text: 'Messages',
    },
    {
      icon: <Heart />,
      text: 'Notifications',
    },
    ...(user?.role === 'admin'
      ? [
          {
            icon: <ShieldCheck />,
            text: 'Admin',
          },
        ]
      : []),
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

  const renderIconWithBadge = (item) => {
    if (item.text !== 'Notifications' && item.text !== 'Messages') {
      return item.icon;
    }

    const badgeCount = item.text === 'Notifications' ? unreadNotificationCount : messageUnreadCount;

    return (
      <div className="relative">
        {item.icon}
        {badgeCount > 0 ? (
          <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
        <h1 className="text-lg font-bold tracking-tight">KuraKani</h1>
        <div
          onClick={() => sidebarHandler('Create')}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100"
        >
          <PlusSquare />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="grid grid-cols-6 gap-1">
          {sidebarItems
            .filter((item) => ['Home', 'Search', 'Explore', 'Messages', 'Saved', 'Notifications'].includes(item.text))
            .map((item) => (
            <div
              key={item.text}
              onClick={() => sidebarHandler(item.text)}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-medium text-slate-700"
            >
              {renderIconWithBadge(item)}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-gray-100 bg-white/95 px-4 py-6 shadow-[0_0_40px_rgba(0,0,0,0.03)] backdrop-blur md:flex md:flex-col">
        <div className="flex-1">
          <h1 className="px-2 pb-6 text-2xl font-bold tracking-tight">KuraKani</h1>
          {sidebarItems.map((item) => (
            <div
              key={item.text}
              onClick={() => sidebarHandler(item.text)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-gray-100"
            >
              {renderIconWithBadge(item)}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
        <CreatePost open={open} setOpen={setOpen} />
      </div>
    </>
  );
};
export default LeftSidebar;
