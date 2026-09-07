import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { connectSocket } from '../lib/socket';
import { clearMessageUnreadCount } from '../redux/notificationSlice';
import instance from '../utils/axios';

const Messages = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationPreviews, setConversationPreviews] = useState({});

  useEffect(() => {
    dispatch(clearMessageUnreadCount());
  }, [dispatch]);

  useEffect(() => {
    const socket = connectSocket(user?._id);

    const handleIncomingMessage = (incomingMessage) => {
      const senderId = incomingMessage?.senderId?._id || incomingMessage?.senderId;
      const receiverId = incomingMessage?.receiverId?._id || incomingMessage?.receiverId;
      const selectedId = selectedUser?._id;
      const otherUserId = senderId === user?._id ? receiverId : senderId;

      if (otherUserId) {
        setConversationPreviews((current) => ({
          ...current,
          [otherUserId]: {
            lastMessage: incomingMessage.message,
            lastSenderName:
              senderId === user?._id ? 'You' : incomingMessage?.senderId?.username || 'Someone',
            unread: senderId !== user?._id && selectedId !== otherUserId,
          },
        }));
      }

      if (selectedId && [senderId, receiverId].includes(selectedId)) {
        setMessages((current) => [...current, incomingMessage]);
      }
    };

    socket.on('message:created', handleIncomingMessage);

    return () => {
      socket.off('message:created', handleIncomingMessage);
    };
  }, [selectedUser?._id, user?._id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const resp = await instance.get('/users/suggested');
        if (resp.data.success) {
          setUsers(resp.data.data || []);
          setSelectedUser(resp.data.data?.[0] || null);
        }
      } catch {
        setUsers([]);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchConversationPreviews = async () => {
      if (!user?._id || users.length === 0) return;

      try {
        const previewPairs = await Promise.all(
          users.map(async (item) => {
            try {
              const resp = await instance.get(`/messages/all/${item._id}`);
              const userMessages = resp.data.success ? resp.data.data || [] : [];
              const lastMessage = userMessages.at(-1);

              if (!lastMessage) {
                return [item._id, null];
              }

              const senderId = lastMessage.senderId?._id || lastMessage.senderId;

              return [
                item._id,
                {
                  lastMessage: lastMessage.message,
                  lastSenderName:
                    senderId === user._id
                      ? 'You'
                      : lastMessage?.senderId?.username || item.username,
                  unread: senderId !== user._id,
                },
              ];
            } catch {
              return [item._id, null];
            }
          }),
        );

        setConversationPreviews(Object.fromEntries(previewPairs.filter(([, value]) => value)));
      } catch {
        setConversationPreviews({});
      }
    };

    fetchConversationPreviews();
  }, [user?._id, users]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser?._id) {
        setMessages([]);
        return;
      }

      try {
        const resp = await instance.get(`/messages/all/${selectedUser._id}`);
        if (resp.data.success) {
          setMessages(resp.data.data || []);
        }
      } catch {
        setMessages([]);
      }
    };

    fetchMessages();
  }, [selectedUser?._id]);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => item.username.toLowerCase().includes(searchText.toLowerCase()));
  }, [searchText, users]);

  const selectUser = (item) => {
    setSelectedUser(item);
    setConversationPreviews((current) => ({
      ...current,
      [item._id]: {
        ...(current[item._id] || {}),
        unread: false,
      },
    }));
  };

  const sendMessageHandler = async (event) => {
    event.preventDefault();
    if (!messageText.trim() || !selectedUser?._id) return;

    setLoading(true);
    try {
      const resp = await instance.post(`/messages/send/${selectedUser._id}`, {
        message: messageText,
      });
      if (resp.data.success) {
        setMessageText('');
        setConversationPreviews((current) => ({
          ...current,
          [selectedUser._id]: {
            lastMessage: resp.data.data?.message || messageText,
            lastSenderName: 'You',
            unread: false,
          },
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-linear-to-br from-white via-sky-50 to-indigo-50 xl:grid-cols-[320px_1fr]">
      <aside className="border-r border-gray-200 bg-white/80 p-4 backdrop-blur">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <Input
          className="mt-4"
          placeholder="Search users..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
        <div className="mt-4 space-y-2">
          {filteredUsers.map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => selectUser(item)}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                selectedUser?._id === item._id ? 'bg-slate-900 text-white' : 'hover:bg-gray-100'
              }`}
            >
              <div className="relative shrink-0">
                <Avatar>
                  <AvatarImage src={item.profilePicture} alt={item.username} />
                  <AvatarFallback>{item.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                {conversationPreviews[item._id]?.unread ? (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{item.username}</p>
                <p
                  className={`text-xs truncate ${selectedUser?._id === item._id ? 'text-white/70' : 'text-gray-500'}`}
                >
                  {conversationPreviews[item._id]?.lastMessage
                    ? `${conversationPreviews[item._id].lastSenderName}: ${conversationPreviews[item._id].lastMessage}`
                    : item.bio || 'Tap to chat'}
                </p>
              </div>
              {conversationPreviews[item._id]?.unread ? (
                <span className="ml-auto rounded-full bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white">
                  New
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </aside>

      <main className="flex flex-col">
        {selectedUser ? (
          <>
            <header className="flex items-center gap-3 border-b border-gray-200 bg-white/70 p-4 backdrop-blur">
              <Avatar>
                <AvatarImage src={selectedUser.profilePicture} alt={selectedUser.username} />
                <AvatarFallback>{selectedUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{selectedUser.username}</h2>
                <p className="text-xs text-gray-500">{selectedUser.bio || 'Available to chat'}</p>
              </div>
            </header>

            <section className="flex-1 space-y-3 overflow-y-auto p-6">
              {messages.map((message) => {
                const fromMe = (message.senderId?._id || message.senderId) === user?._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-3xl px-4 py-3 text-sm shadow-sm ${
                        fromMe ? 'bg-slate-900 text-white' : 'bg-white'
                      }`}
                    >
                      {message.message}
                    </div>
                  </div>
                );
              })}
            </section>

            <form
              onSubmit={sendMessageHandler}
              className="border-t border-gray-200 bg-white/80 p-4 backdrop-blur"
            >
              <div className="flex gap-3">
                <Input
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder="Write a message..."
                />
                <Button type="submit" disabled={loading || !messageText.trim()}>
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            Select someone to start chatting.
          </div>
        )}
      </main>
    </div>
  );
};

export default Messages;
