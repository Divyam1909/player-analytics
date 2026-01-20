import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'coach' | 'player';

interface User {
    email: string;
    role: UserRole;
    name?: string;
    team?: string;
    playerId?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, role: UserRole) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credentials from environment variables
const CREDENTIALS = {
    admin: {
        email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@postmatch.org',
        password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
    },
    coach: {
        email: import.meta.env.VITE_COACH_EMAIL || 'bombaygymkhanamen@post-match.org',
        password: import.meta.env.VITE_COACH_PASSWORD || 'coach123',
        name: import.meta.env.VITE_COACH_NAME || 'Rudrashish',
        team: import.meta.env.VITE_COACH_TEAM || 'Bombay Gymkhana Men',
    },
    player: {
        email: import.meta.env.VITE_PLAYER_EMAIL || 'player1@postmatch.org',
        password: import.meta.env.VITE_PLAYER_PASSWORD || 'player123',
        playerId: import.meta.env.VITE_PLAYER_ID || 'p1',
    },
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('auth_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (email: string, password: string, role: UserRole): boolean => {
        const creds = CREDENTIALS[role];

        if (email === creds.email && password === creds.password) {
            const newUser: User = {
                email,
                role,
                ...(role === 'coach' && { name: CREDENTIALS.coach.name, team: CREDENTIALS.coach.team }),
                ...(role === 'player' && { playerId: CREDENTIALS.player.playerId }),
            };

            setUser(newUser);
            localStorage.setItem('auth_user', JSON.stringify(newUser));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Hook for navigation after auth actions
export function useAuthNavigation() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const navigateToRoleDashboard = () => {
        if (!user) {
            navigate('/login');
            return;
        }

        switch (user.role) {
            case 'admin':
                navigate('/admin');
                break;
            case 'coach':
                navigate('/dashboard');
                break;
            case 'player':
                navigate(`/player/${user.playerId}`);
                break;
        }
    };

    return { navigateToRoleDashboard };
}
