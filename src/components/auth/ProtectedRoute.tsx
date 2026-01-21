import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                navigate('/login', { state: { from: location }, replace: true });
                return;
            }

            if (user && !allowedRoles.includes(user.role)) {
                switch (user.role) {
                    case 'admin':
                        navigate('/admin', { replace: true });
                        break;
                    case 'coach':
                        navigate('/dashboard', { replace: true });
                        break;
                    case 'player':
                        navigate(`/player/${user.playerId || 'overview'}`, { replace: true });
                        break;
                    default:
                        navigate('/login', { replace: true });
                }
            }
        }
    }, [isLoading, isAuthenticated, user, allowedRoles, navigate, location]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
        return null;
    }

    return <>{children}</>;
}

export default ProtectedRoute;
