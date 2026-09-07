import { createBrowserRouter, RouterProvider } from 'react-router';
import { Home, MainLayout, Profile, Signin, Signup } from './pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/profile',
        element: <Profile />,
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
