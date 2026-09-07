import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const LeftSidebar = () => {
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
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
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
            className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer"
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default LeftSidebar;
