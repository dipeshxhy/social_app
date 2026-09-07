import Post from './Post';

const Posts = () => {
  return (
    <div>
      {[1, 2, 3, 4].map((item) => (
        <Post key={item} />
      ))}
    </div>
  );
};
export default Posts;
