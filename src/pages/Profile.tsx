import { motion } from 'framer-motion';
import AuthHeader from '@/components/layout/AuthHeader';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Profile" />
            <Sidebar />

            <main className="pt-24 pb-12 px-6 ml-64">
                <div className="container mx-auto">
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
                            Manage your profile and preferences
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="bg-card border-border">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                                    <User className="w-12 h-12 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">
                                    {user?.name || 'Coach'}
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {user?.team || 'Team Manager'}
                                </p>
                                <p className="text-muted-foreground text-center max-w-md">
                                    Profile management features coming soon. You'll be able to update your information, preferences, and notification settings.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
