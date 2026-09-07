import { toast } from '@/components/ui/toast';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { setAuthUser } from '../redux/authSlice';
import instance from '../utils/axios';

const Signin = () => {
  const [input, setInput] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  if (user?._id) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const loginHandler = async (e) => {
    e.preventDefault();
    // Handle login logic here
    setLoading(true);
    try {
      const resp = await instance.post('/auth/login', input);
      if (resp.data.success) {
        toast.add({
          type: 'success',
          title: resp.data.msg || 'Welcome back!',
          description: 'You have been successfully logged in.',
        });
        dispatch(setAuthUser(resp.data.data));
        navigate(location.state?.from || '/');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setErrors(error.response.data.errors || {});
        return;
      }
      toast.add({
        type: 'error',
        title: 'Error',
        description:
          error.response?.data?.msg ||
          error.message ||
          'An error occurred while creating your account.',
      });
    } finally {
      setLoading(false);
      setInput({
        email: '',
        password: '',
      });
    }
  };
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <form className="shadow-lg flex flex-col gap-5 p-8" onSubmit={loginHandler}>
        <div className="my-4 text-center">
          <h1 className="text-xl font-bold">Logo</h1>
          <p className="text-sm">Sign in to see photos and videos from your friends.</p>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            {Object.entries(errors).map(([field, message]) => (
              <p key={field}>{message}</p>
            ))}
          </div>
        )}

        <div>
          <Label htmlFor="email" className="mb-1">
            Email
          </Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={input.email}
            onChange={changeEventHandler}
          />
        </div>
        <div>
          <Label htmlFor="password" className="mb-1">
            Password
          </Label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={input.password}
            onChange={changeEventHandler}
          />
        </div>
        <Button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <div className="absolute bottom-4 text-center w-full">
        <p className="text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Signin;
