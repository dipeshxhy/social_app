import { toast } from '@/components/ui/toast';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import instance from '../utils/axios';

const Signup = () => {
  const [input, setInput] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  if (user?._id) {
    return <Navigate to="/" replace />;
  }
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const signupHandler = async (e) => {
    e.preventDefault();
    // Handle signup logic here
    setLoading(true);
    try {
      const resp = await instance.post('/auth/register', input);
      if (resp.data.success) {
        toast.add({
          type: 'success',
          title: 'Account created',
          description: 'Your account has been created successfully.',
        });
        navigate('/signin');
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
        username: '',
        email: '',
        password: '',
      });
    }
  };
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <form className="shadow-lg flex flex-col gap-5 p-8" onSubmit={signupHandler}>
        <div className="my-4 text-center">
          <h1 className="text-xl font-bold">Logo</h1>
          <p className="text-sm">Sign up to see photos and videos from your friends.</p>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-100 text-red-700 p-2 rounded">
            {Object.entries(errors).map(([field, message]) => (
              <p key={field}>{message}</p>
            ))}
          </div>
        )}
        <div>
          <Label htmlFor="username" className="mb-1">
            Username
          </Label>
          <Input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            value={input.username}
            onChange={changeEventHandler}
          />
        </div>
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
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>
      </form>
      <div className="absolute bottom-4 text-center w-full">
        <p className="text-sm">
          Already have an account?{' '}
          <Link to="/signin" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Signup;
