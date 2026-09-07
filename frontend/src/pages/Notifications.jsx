import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../components/ui/button';
import {
  clearNotifications,
  markAllNotificationsRead,
  setNotifications,
} from '../redux/notificationSlice';
import instance from '../utils/axios';

const typeLabels = {
  like: 'New like',
  comment: 'New comment',
  message: 'New message',
  follow: 'New follower',
  post: 'New post',
};

const Notifications = () => {
  const { items } = useSelector((store) => store.notification);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const resp = await instance.get('/notifications');
        if (resp.data.success) {
          const notifications = resp.data.data || [];
          const unreadNotifications = notifications.filter((item) => !item.read);

          if (unreadNotifications.length > 0) {
            await Promise.all(
              unreadNotifications.map((item) => instance.patch(`/notifications/${item._id}/read`)),
            );
          }

          dispatch(
            setNotifications(
              notifications.map((item) => ({
                ...item,
                read: true,
              })),
            ),
          );
          dispatch(markAllNotificationsRead());
        }
      } catch {
        dispatch(setNotifications([]));
      }
    };

    fetchNotifications();
  }, [dispatch]);

  const clearAll = async () => {
    try {
      await instance.delete('/notifications/clear');
    } finally {
      dispatch(clearNotifications());
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between rounded-3xl border bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-semibold">Notifications</h1>
            <p className="mt-2 text-sm text-gray-500">Live activity from posts and messages.</p>
          </div>
          <Button type="button" variant="outline" onClick={clearAll}>
            Clear all
          </Button>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="rounded-3xl border bg-white p-8 text-center text-gray-500 shadow-sm">
              No notifications yet.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id || item._id}
                className="flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="pointer-events-none h-12 w-12 shrink-0 cursor-default rounded-full p-0 text-xl font-semibold uppercase text-[#0095F6]"
                >
                  {item.sender?.username?.charAt(0) || item.type?.charAt(0) || 'N'}
                </Button>
                <div className="min-w-0">
                  <p className="font-medium">
                    {item.title || typeLabels[item.type] || 'Notification'}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{item.message}</p>
                  <p className="mt-2 text-xs text-gray-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
