import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type UserRole = 'admin' | 'coach' | 'player';

interface User {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
    team?: string;
    teamName?: string; // Support both just in case
    playerId?: string;
    subscriptionType: 'normal' | 'premium';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, role: UserRole) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                // Ensure subscriptionType has a default for cached data from before the field existed
                if (!parsed.subscriptionType && parsed.role === 'coach') {
                    parsed.subscriptionType = 'normal';
                }
                setUser(parsed);
            } catch {
                localStorage.removeItem('auth_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
        // 1. Check configuration
        if (!isSupabaseConfigured() || !supabase) {
            console.error('Supabase not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
            return false;
        }

        try {
            console.log('Attempting login via RPC for:', email);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase as any).rpc('verify_user_password', {
                p_email: email,
                p_password: password
            });

            if (error) {
                console.error('Supabase RPC Error:', error);
                return false;
            }

            console.log('RPC Response Data:', data);

            // Check if user was returned
            if (data && data.length > 0) {
                const dbUser = data[0];

                // Verify role matches
                if (dbUser.role !== role) {
                    console.warn(`User found but role mismatch. Expected ${role}, got ${dbUser.role}`);
                    return false;
                }

                const newUser: User = {
                    id: dbUser.id,
                    email: dbUser.email,
                    role: dbUser.role as UserRole,
                    name: `${dbUser.first_name} ${dbUser.last_name}`,
                    team: dbUser.team_name, // Using team_name from RPC join
                    playerId: dbUser.player_id,
                    subscriptionType: dbUser.subscription_type === 'premium' ? 'premium' : 'normal',
                };

                setUser(newUser);
                localStorage.setItem('auth_user', JSON.stringify(newUser));
                return true;
            } else {
                console.warn('Login failed: No user found with matching credentials.');
                return false;
            }

        } catch (err) {
            console.error('Supabase login exception:', err);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('auth_user');
    };

    // Memoize the value to prevent unnecessary re-renders in consumers
    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
    }), [user, isLoading]);

    return (
        <AuthContext.Provider value={value}>
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
                navigate(`/player/${user.playerId || 'overview'}`);
                break;
        }
    };

    return { navigateToRoleDashboard };
}
