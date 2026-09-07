import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router';
import LeftSidebar from '../components/LeftSidebar';
import { toast } from '../components/ui/toast';
import { connectSocket, disconnectSocket } from '../lib/socket';
import { setOnlineUsers, setUserOffline, setUserOnline } from '../redux/onlineSlice';
import { addNotification, incrementMessageUnreadCount } from '../redux/notificationSlice';
import { addPost, appendComment, removePost, updatePost } from '../redux/postSlice';
import instance from '../utils/axios';

const MainLayout = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?._id) {
      return undefined;
    }

    const socket = connectSocket(user._id);

    const loadOnline = async () => {
      try {
        const resp = await instance.get('/users/online');
        if (resp.data.success) {
          dispatch(setOnlineUsers(resp.data.data || []));
        }
      } catch {
        // ignore
      }
    };

    loadOnline();

    const handlePostCreated = (post) => {
      dispatch(addPost(post));
    };

    const handlePostUpdated = (post) => {
      dispatch(updatePost(post));
    };

    const handlePostDeleted = (postId) => {
      dispatch(removePost(postId));
    };

    const handleCommentAdded = ({ postId, comment }) => {
      dispatch(appendComment({ postId, comment }));
    };

    const handleMessageCreated = (message) => {
      const receiverId = message?.receiverId?._id || message?.receiverId;
      if (receiverId === user._id) {
        dispatch(incrementMessageUnreadCount());
        toast.add({
          type: 'success',
          title: 'New message',
          description: `${message?.senderId?.username || 'Someone'} sent you a message.`,
        });
      }
    };

    const handleNotificationCreated = (notification) => {
      dispatch(
        addNotification({
          ...notification,
          id: notification.id || notification._id,
        }),
      );
    };

    const handleOnlineChanged = (data) => {
      if (data?.online) {
        dispatch(setUserOnline(data.userId));
      } else {
        dispatch(setUserOffline(data.userId));
      }
    };

    socket.on('post:created', handlePostCreated);
    socket.on('post:updated', handlePostUpdated);
    socket.on('post:deleted', handlePostDeleted);
    socket.on('post:comment-added', handleCommentAdded);
    socket.on('message:created', handleMessageCreated);
    socket.on('notification:created', handleNotificationCreated);
    socket.on('online:changed', handleOnlineChanged);

    return () => {
      socket.off('post:created', handlePostCreated);
      socket.off('post:updated', handlePostUpdated);
      socket.off('post:deleted', handlePostDeleted);
      socket.off('post:comment-added', handleCommentAdded);
      socket.off('message:created', handleMessageCreated);
      socket.off('notification:created', handleNotificationCreated);
      socket.off('online:changed', handleOnlineChanged);
      disconnectSocket();
    };
  }, [dispatch, user?._id]);

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-slate-900">
      <LeftSidebar />
      <div className="min-w-0 flex-1 pb-20 pt-16 md:pb-0 md:pt-0">
        <Outlet />
      </div>
    </div>
  );
};
export default MainLayout;
