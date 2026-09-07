import { useSelector } from 'react-redux';
import { Navigate } from 'react-router';

const AdminRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;