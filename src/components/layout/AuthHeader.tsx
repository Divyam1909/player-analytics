import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Monitor, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthHeaderProps {
    title?: string;
}

const AuthHeader = ({ title = 'Dashboard' }: AuthHeaderProps) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Left Side - Brand */}
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <img
                            src="/image.png"
                            alt="Thinking Engines"
                            className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                            <span className="text-lg font-semibold text-foreground">Thinking Engines</span>
                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">{title}</span>
                        </div>
                    </Link>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* User Email */}
                        {user && (
                            <span className="text-sm text-muted-foreground hidden sm:block">
                                {user.email}
                            </span>
                        )}

                        {/* Theme Toggle */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={resolvedTheme}
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            exit={{ rotate: 90, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {resolvedTheme === 'dark' ? (
                                                <Moon className="w-5 h-5" />
                                            ) : (
                                                <Sun className="w-5 h-5" />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                                <DropdownMenuItem
                                    onClick={() => setTheme('light')}
                                    className={cn(theme === 'light' && 'bg-accent')}
                                >
                                    <Sun className="mr-2 h-4 w-4" />
                                    Light
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTheme('dark')}
                                    className={cn(theme === 'dark' && 'bg-accent')}
                                >
                                    <Moon className="mr-2 h-4 w-4" />
                                    Dark
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setTheme('system')}
                                    className={cn(theme === 'system' && 'bg-accent')}
                                >
                                    <Monitor className="mr-2 h-4 w-4" />
                                    System
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Sign Out Button */}
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleLogout}
                            className="gap-2"
                        >
                            <span className="hidden sm:inline">Sign Out</span>
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default AuthHeader;
