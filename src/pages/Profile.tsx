import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AuthHeader from '@/components/layout/AuthHeader';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Mail,
    Building2,
    Shield,
    Bell,
    Moon,
    Sun,
    LogOut,
    Save,
    Check,
    Settings,
    Lock,
    Palette
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const Profile = () => {
    const { user, logout } = useAuth();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const navigate = useNavigate();

    // Form state
    const [name, setName] = useState(user?.name || '');
    const [team, setTeam] = useState(user?.team || '');
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Settings state
    const [notifications, setNotifications] = useState(true);
    const [emailAlerts, setEmailAlerts] = useState(true);

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Profile" />
            <Sidebar />

            <main className="pt-24 pb-12 px-6 ml-64">
                <div className="container mx-auto max-w-4xl">
                    {/* Page Header */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Coach <span className="text-primary">Profile</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your profile information and preferences
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {/* Profile Card - Left Column */}
                        <motion.div variants={itemVariants} className="lg:col-span-1">
                            <Card className="bg-card border-border">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col items-center text-center">
                                        {/* Avatar */}
                                        <div className="relative mb-4">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-4 ring-primary/20">
                                                <User className="w-12 h-12 text-primary" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                                <Shield className="w-4 h-4 text-primary-foreground" />
                                            </div>
                                        </div>

                                        {/* Name & Role */}
                                        <h3 className="text-xl font-semibold text-foreground mb-1">
                                            {user?.name || 'Coach'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            {user?.team || 'Team Manager'}
                                        </p>
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                            <Shield className="w-3 h-3" />
                                            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Coach'}
                                        </span>

                                        <Separator className="my-6" />

                                        {/* Contact Info */}
                                        <div className="w-full space-y-3 text-left">
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                                                <Mail className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground truncate">
                                                    {user?.email || 'email@example.com'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground">
                                                    {user?.team || 'Team Name'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Settings Cards - Right Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Edit Profile */}
                            <motion.div variants={itemVariants}>
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <User className="w-5 h-5 text-primary" />
                                            Edit Profile
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Display Name</Label>
                                                <Input
                                                    id="name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Enter your name"
                                                    className="bg-secondary border-border"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="team">Team Name</Label>
                                                <Input
                                                    id="team"
                                                    value={team}
                                                    onChange={(e) => setTeam(e.target.value)}
                                                    placeholder="Enter team name"
                                                    className="bg-secondary border-border"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                value={user?.email || ''}
                                                disabled
                                                className="bg-secondary/50 border-border text-muted-foreground"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Email cannot be changed. Contact admin for assistance.
                                            </p>
                                        </div>
                                        <div className="flex justify-end pt-2">
                                            <Button
                                                onClick={handleSave}
                                                disabled={isSaving}
                                                className="gap-2"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : saveSuccess ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Saved
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-4 h-4" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Preferences */}
                            <motion.div variants={itemVariants}>
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-primary" />
                                            Preferences
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Theme Selection */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-secondary">
                                                    <Palette className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">Theme</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Choose your preferred appearance
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {['light', 'dark', 'system'].map((t) => (
                                                    <Button
                                                        key={t}
                                                        variant={theme === t ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setTheme(t as 'light' | 'dark' | 'system')}
                                                        className="capitalize"
                                                    >
                                                        {t === 'light' && <Sun className="w-3 h-3 mr-1" />}
                                                        {t === 'dark' && <Moon className="w-3 h-3 mr-1" />}
                                                        {t}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Notifications */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-secondary">
                                                    <Bell className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">Push Notifications</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Receive match and update alerts
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={notifications}
                                                onCheckedChange={setNotifications}
                                            />
                                        </div>

                                        <Separator />

                                        {/* Email Alerts */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-secondary">
                                                    <Mail className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">Email Alerts</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Get weekly summaries and reports
                                                    </p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={emailAlerts}
                                                onCheckedChange={setEmailAlerts}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* Account Actions */}
                            <motion.div variants={itemVariants}>
                                <Card className="bg-card border-border">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Lock className="w-5 h-5 text-primary" />
                                            Account
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                                            <div>
                                                <p className="font-medium text-foreground">Sign Out</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Log out of your account on this device
                                                </p>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                onClick={handleLogout}
                                                className="gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
