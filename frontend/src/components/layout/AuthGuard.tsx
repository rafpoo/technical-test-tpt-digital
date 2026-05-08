import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../lib/auth';
import SidebarLayout from './SidebarLayout';

export default function AuthGuard() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <SidebarLayout />;
}
