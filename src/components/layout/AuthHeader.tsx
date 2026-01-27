import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Monitor, LogOut, ArrowLeft } from 'lucide-react';
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

interface MatchOption {
    id: string;
    label: string;
    date?: string;
}

interface AuthHeaderProps {
    title?: string;
    showBack?: boolean;
    onBack?: () => void;
    matchOptions?: MatchOption[];
    selectedMatchId?: string;
    onMatchChange?: (matchId: string) => void;
}

const AuthHeader = ({ title = 'Dashboard', showBack = false, onBack, matchOptions, selectedMatchId, onMatchChange }: AuthHeaderProps) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <header className="fixed top-0 left-64 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto px-6">
                <div className="flex h-16 items-center justify-between">
                    {/* Left Side - Back Button & Page Title */}
                    <div className="flex items-center gap-4">
                        {showBack && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBack}
                                className="gap-2 text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Back</span>
                            </Button>
                        )}
                        <h1 className="text-xl font-semibold text-foreground">{title}</h1>

                        {/* Match Selector Dropdown */}
                        {matchOptions && matchOptions.length > 0 && onMatchChange && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 ml-2">
                                        <span className="text-sm">
                                            {matchOptions.find(m => m.id === selectedMatchId)?.label || 'Select Match'}
                                        </span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="bg-popover border-border max-h-[300px] overflow-y-auto w-[280px]">
                                    {matchOptions.map((match) => (
                                        <DropdownMenuItem
                                            key={match.id}
                                            onClick={() => onMatchChange(match.id)}
                                            className={cn(
                                                "flex flex-col items-start gap-0.5 py-2",
                                                selectedMatchId === match.id && 'bg-accent'
                                            )}
                                        >
                                            <span className="font-medium">{match.label}</span>
                                            {match.date && (
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(match.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

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
