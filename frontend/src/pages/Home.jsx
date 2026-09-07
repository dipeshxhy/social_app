import Feed from '../components/Feed';
import RightSidebar from '../components/RightSidebar';

const Home = () => {
  return (
    <div className="flex">
      <div className="flex-grow">
        <Feed />
      </div>
      <RightSidebar />
    </div>
  );
};
export default Home;
