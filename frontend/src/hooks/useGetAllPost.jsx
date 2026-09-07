import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPosts } from '../redux/postSlice';
import instance from '../utils/axios';

export const useGetAllPosts = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const resp = await instance.get('/posts');
        if (resp.data.success) {
          dispatch(setPosts(resp.data.data || []));
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, [dispatch]);
};
