import { createBrowserRouter, RouterProvider } from 'react-router';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import {
  Admin,
  Explore,
  Home,
  MainLayout,
  Messages,
  Notifications,
  Profile,
  Saved,
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
      {
        path: '/saved',
        element: <Saved />,
      },
      {
        path: '/admin',
        element: (
          <AdminRoute>
            <Admin />
          </AdminRoute>
        ),
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
