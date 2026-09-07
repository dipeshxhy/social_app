import { Outlet } from 'react-router';
import LeftSidebar from '../components/LeftSidebar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      <LeftSidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};
export default MainLayout;
