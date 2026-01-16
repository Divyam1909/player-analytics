import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login selection page, preserving the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have permission
        // Redirect to their appropriate dashboard
        switch (user?.role) {
            case 'admin':
                return <Navigate to="/admin" replace />;
            case 'coach':
                return <Navigate to="/dashboard" replace />;
            case 'player':
                return <Navigate to={`/player/${user.playerId}`} replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return <>{children}</>;
}

export default ProtectedRoute;
