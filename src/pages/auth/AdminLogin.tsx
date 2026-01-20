import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const { resolvedTheme, setTheme } = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        await new Promise((r) => setTimeout(r, 500));

        const success = login(email, password, 'admin');

        if (success) {
            navigate('/admin');
        } else {
            setError('Invalid email or password');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Image Background */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-500 items-center justify-center relative overflow-hidden">
                <img
                    src="/image.png"
                    alt="Thinking Engines"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 bg-background flex flex-col">
                <div className="flex items-center justify-between p-6">
                    <Link to="/login" className="flex items-center gap-2">
                        <img
                            src="/image.png"
                            alt="Thinking Engines"
                            className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="font-semibold text-foreground">Thinking Engines</span>
                    </Link>

                    <button
                        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    >
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {resolvedTheme === 'dark' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            )}
                        </svg>
                    </button>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-sm"
                    >
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your credentials<br />
                                to access the admin dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                                >
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@postmatch.org"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-secondary/50 border-border h-11"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-secondary/50 border-border h-11"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-11 bg-red-500 hover:bg-red-600 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <Link
                                to="/login"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ← Back to role selection
                            </Link>
                        </div>

                        <div className="mt-6 pt-4 border-t border-border">
                            <div className="bg-secondary/30 rounded-lg p-3 border border-border">
                                <p className="text-xs font-semibold text-foreground text-center mb-1">🔑 Test Credentials</p>
                                <p className="text-xs text-muted-foreground text-center">
                                    <span className="font-mono">admin@postmatch.org</span>
                                </p>
                                <p className="text-xs text-muted-foreground text-center">
                                    Password: <span className="font-mono">password123</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
