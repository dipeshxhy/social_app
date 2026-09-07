import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((store) => store.auth);
  const location = useLocation();

  if (!user?._id) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
