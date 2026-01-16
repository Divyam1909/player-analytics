import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthHeader from '@/components/layout/AuthHeader';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import {
    Users,
    Database,
    Settings,
    BarChart3,
    FileText,
    Shield,
} from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const adminFeatures = [
    {
        title: 'Manage Players',
        description: 'Add, edit, or remove player data from the database',
        icon: Users,
        href: '/overview',
        color: 'from-blue-500/20 to-blue-600/20',
        iconColor: 'text-blue-500',
    },
    {
        title: 'Match Data',
        description: 'Import and manage match statistics',
        icon: Database,
        href: '/',
        color: 'from-emerald-500/20 to-emerald-600/20',
        iconColor: 'text-emerald-500',
    },
    {
        title: 'Team Analytics',
        description: 'View comprehensive team performance analytics',
        icon: BarChart3,
        href: '/team',
        color: 'from-purple-500/20 to-purple-600/20',
        iconColor: 'text-purple-500',
    },
    {
        title: 'Reports',
        description: 'Generate and export performance reports',
        icon: FileText,
        href: '#',
        color: 'from-orange-500/20 to-orange-600/20',
        iconColor: 'text-orange-500',
        disabled: true,
    },
    {
        title: 'User Management',
        description: 'Manage coach and player accounts',
        icon: Shield,
        href: '#',
        color: 'from-red-500/20 to-red-600/20',
        iconColor: 'text-red-500',
        disabled: true,
    },
    {
        title: 'Settings',
        description: 'Configure system settings and preferences',
        icon: Settings,
        href: '#',
        color: 'from-gray-500/20 to-gray-600/20',
        iconColor: 'text-gray-500',
        disabled: true,
    },
];

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Admin Dashboard" />
            <Sidebar />

            <main className="pt-24 pb-12 px-6 ml-64">
                <div className="container mx-auto">
                    {/* Welcome Section */}
                    <motion.div
                        className="mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Admin <span className="text-red-500">Dashboard</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your player analytics platform
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {adminFeatures.map((feature) => (
                            <motion.div key={feature.title} variants={itemVariants}>
                                {feature.disabled ? (
                                    <Card className="bg-card border-border opacity-50 cursor-not-allowed">
                                        <CardHeader>
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                                            >
                                                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                            </div>
                                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription>{feature.description}</CardDescription>
                                            <p className="text-xs text-muted-foreground mt-2">Coming soon</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Link to={feature.href}>
                                        <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                                            <CardHeader>
                                                <div
                                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                                                >
                                                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                                </div>
                                                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                                                    {feature.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CardDescription>{feature.description}</CardDescription>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
