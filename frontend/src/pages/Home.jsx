import Feed from '../components/Feed';
import RightSidebar from '../components/RightSidebar';
import { useGetAllPosts } from '../hooks/useGetAllPost';

const Home = () => {
  useGetAllPosts();

  return (
    <div className="mx-auto flex w-full max-w-[1400px] gap-8 px-4 py-6 lg:px-8">
      <div className="min-w-0 flex-1">
        <Feed />
      </div>
      <div className="hidden xl:block w-80 shrink-0">
        <RightSidebar />
      </div>
    </div>
  );
};
export default Home;
