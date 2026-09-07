import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from '../components/ui/toast';
import { setAuthUser } from '../redux/authSlice';
import instance from '../utils/axios';

const Profile = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState(() => user);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', gender: 'prefer not to say' });
  const [file, setFile] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [listDialogType, setListDialogType] = useState('followers');

  const viewedUserId = searchParams.get('user') || user?._id;
  const isOwnProfile = viewedUserId === user?._id;

  useEffect(() => {
    if (!viewedUserId) return;

    const fetchProfileData = async () => {
      try {
        const [profileResp, postsResp] = await Promise.all([
          instance.get(`/users/${viewedUserId}`),
          instance.get('/posts'),
        ]);

        if (profileResp.data.success) {
          setProfile(profileResp.data.data);
          setForm({
            bio: profileResp.data.data?.bio || '',
            gender: profileResp.data.data?.gender || 'prefer not to say',
          });
        }

        if (postsResp.data.success) {
          setAllPosts(postsResp.data.data || []);
        }
      } catch (error) {
        toast.add({
          type: 'error',
          title: 'Error',
          description: error.response?.data?.msg || error.message || 'Could not load profile.',
        });
      }
    };

    fetchProfileData();
  }, [viewedUserId]);

  const stats = useMemo(
    () => [
      {
        label: 'Posts',
        value: allPosts.filter((post) => post.author?._id === viewedUserId).length,
      },
      { label: 'Followers', value: profile?.followers?.length || 0 },
      { label: 'Following', value: profile?.following?.length || 0 },
    ],
    [allPosts, profile?.followers?.length, profile?.following?.length, viewedUserId],
  );

  const viewedPosts = useMemo(
    () => allPosts.filter((post) => post.author?._id === viewedUserId),
    [allPosts, viewedUserId],
  );

  const isFollowing = useMemo(() => {
    return (profile?.followers || []).some((follower) => (follower?._id || follower) === user?._id);
  }, [profile?.followers, user?._id]);

  const activeList = useMemo(() => {
    return listDialogType === 'followers' ? profile?.followers || [] : profile?.following || [];
  }, [listDialogType, profile?.followers, profile?.following]);

  const openListDialog = (type) => {
    setListDialogType(type);
    setListDialogOpen(true);
  };

  const changeHandler = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('bio', form.bio);
    formData.append('gender', form.gender);
    if (file) {
      formData.append('profilePicture', file);
    }

    try {
      const resp = await instance.patch('/users/profile/edit', formData);

      if (resp.data.success) {
        setProfile(resp.data.data);
        dispatch(setAuthUser(resp.data.data));
        setEditing(false);
        setFile(null);
        toast.add({
          type: 'success',
          title: 'Profile updated',
          description: 'Your profile changes were saved.',
        });
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not update profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  const followToggleHandler = async () => {
    if (!profile?._id || isOwnProfile) return;

    setLoading(true);
    try {
      const resp = await instance.post(`/users/${profile._id}/followorunfollow`);
      if (resp.data.success) {
        const currentUserId = user?._id;
        setProfile((current) => ({
          ...current,
          followers: isFollowing
            ? (current.followers || []).filter(
                (follower) => (follower?._id || follower) !== currentUserId,
              )
            : [...(current.followers || []), currentUserId],
        }));
        dispatch(
          setAuthUser({
            ...user,
            following: isFollowing
              ? (user.following || []).filter(
                  (followingId) => (followingId?._id || followingId) !== profile._id,
                )
              : [...(user.following || []), profile._id],
          }),
        );
        toast.add({
          type: 'success',
          title: isFollowing ? 'Unfollowed' : 'Following',
          description: resp.data.msg || 'Profile action completed successfully.',
        });
      }
    } catch (error) {
      toast.add({
        type: 'error',
        title: 'Error',
        description: error.response?.data?.msg || error.message || 'Could not update follow state.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile?.profilePicture} alt={profile?.username} />
                <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">{profile?.username}</h1>
                <p className="mt-1 text-sm text-gray-500">{profile?.email}</p>
                <p className="mt-3 max-w-xl text-sm text-gray-700">
                  {profile?.bio || 'No bio yet.'}
                </p>
                {!isOwnProfile && (
                  <Button className="mt-4 w-fit" onClick={followToggleHandler} disabled={loading}>
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 rounded-2xl bg-gray-50 p-4 text-center">
              {stats.map((stat) => (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() =>
                    stat.label === 'Followers'
                      ? openListDialog('followers')
                      : stat.label === 'Following'
                        ? openListDialog('following')
                        : null
                  }
                  className={`rounded-xl p-2 transition ${
                    stat.label === 'Followers' || stat.label === 'Following'
                      ? 'hover:bg-white/80'
                      : 'cursor-default'
                  }`}
                >
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    {stat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className={isOwnProfile ? 'grid gap-6 lg:grid-cols-[360px_1fr]' : 'grid gap-6'}>
          {isOwnProfile ? (
            <form
              onSubmit={submitHandler}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Edit profile</h2>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditing((current) => !current)}
                >
                  {editing ? 'Close' : 'Edit'}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Bio</Label>
                  <Textarea
                    name="bio"
                    value={form.bio}
                    onChange={changeHandler}
                    disabled={!editing}
                    placeholder="Write something about yourself..."
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Gender</Label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={changeHandler}
                    disabled={!editing}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-2.5 py-1 text-sm shadow-xs outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <Label className="mb-2 block">Profile picture</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={!editing}
                    onChange={(event) => setFile(event.target.files?.[0] || null)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!editing || loading}>
                  {loading ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          ) : null}

          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{isOwnProfile ? 'Your posts' : 'Posts'}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {viewedPosts.map((post) => (
                <div key={post._id} className="overflow-hidden rounded-2xl border bg-gray-50">
                  <img src={post.image} alt={post.caption} className="h-52 w-full object-cover" />
                  <div className="p-4">
                    <p className="line-clamp-2 text-sm text-gray-700">
                      {post.caption || 'No caption'}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">{post.likes?.length || 0} likes</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>

      <Dialog open={listDialogOpen} onOpenChange={setListDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl capitalize">{listDialogType}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {activeList.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-gray-500">
                No {listDialogType} yet.
              </div>
            ) : (
              activeList.map((item) => {
                const person = item?.username ? item : null;

                return (
                  <div
                    key={person?._id || item}
                    className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3"
                  >
                    <Avatar>
                      <AvatarImage src={person?.profilePicture} alt={person?.username} />
                      <AvatarFallback>
                        {person?.username?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{person?.username || 'Unknown user'}</p>
                      <p className="text-xs text-gray-500 truncate">{person?.bio || ''}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
