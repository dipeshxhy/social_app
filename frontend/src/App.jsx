import { createBrowserRouter, RouterProvider } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import {
  Explore,
  Home,
  MainLayout,
  Messages,
  Notifications,
  Profile,
  Search,
  Signin,
  Signup,
} from './pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
      {
        path: '/messages',
        element: <Messages />,
      },
      {
        path: '/notifications',
        element: <Notifications />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/explore',
        element: <Explore />,
      },
    ],
  },
  {
    path: '/signin',
    element: <Signin />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
]);
const App = () => {
  return <RouterProvider router={router} />;
};
export default App;
