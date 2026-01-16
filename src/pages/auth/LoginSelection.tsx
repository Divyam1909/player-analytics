import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Users, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/components/ThemeProvider';

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

const loginOptions = [
    {
        title: 'Admin',
        description: 'Manage data, teams, and system settings',
        icon: Shield,
        href: '/login/admin',
        color: 'from-red-500/20 to-red-600/20',
        borderColor: 'border-red-500/30 hover:border-red-500',
        iconColor: 'text-red-500',
    },
    {
        title: 'Coach',
        description: 'View team analytics and player performance',
        icon: Users,
        href: '/login/coach',
        color: 'from-blue-500/20 to-blue-600/20',
        borderColor: 'border-blue-500/30 hover:border-blue-500',
        iconColor: 'text-blue-500',
    },
    {
        title: 'Player',
        description: 'View your personal stats and performance',
        icon: User,
        href: '/login/player',
        color: 'from-emerald-500/20 to-emerald-600/20',
        borderColor: 'border-emerald-500/30 hover:border-emerald-500',
        iconColor: 'text-emerald-500',
    },
];

const LoginSelection = () => {
    const { resolvedTheme, setTheme } = useTheme();

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Video Background */}
            <div className="hidden lg:flex lg:w-1/2 bg-blue-500 items-center justify-center relative overflow-hidden">
                <video
                    autoPlay
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/Logo_Intro_Video_Creation.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Right Panel - Role Selection */}
            <div className="w-full lg:w-1/2 bg-background flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-2">
                        <img
                            src="/image.png"
                            alt="Thinking Engines"
                            className="w-8 h-8 rounded-lg object-cover"
                        />
                        <span className="font-semibold text-foreground">Thinking Engines</span>
                    </div>

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

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    {/* Title */}
                    <motion.div
                        className="text-center mb-10"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">Select your role to continue</p>
                    </motion.div>

                    {/* Login Options */}
                    <motion.div
                        className="grid grid-cols-1 gap-4 w-full max-w-md"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {loginOptions.map((option) => (
                            <motion.div key={option.title} variants={itemVariants}>
                                <Link to={option.href}>
                                    <Card
                                        className={`bg-card border-2 ${option.borderColor} transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer group`}
                                    >
                                        <div className="flex items-center gap-4 p-4">
                                            <div
                                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                                            >
                                                <option.icon className={`w-7 h-7 ${option.iconColor}`} />
                                            </div>
                                            <div className="flex-1">
                                                <CardTitle className="text-lg mb-1">{option.title}</CardTitle>
                                                <CardDescription className="text-sm">
                                                    {option.description}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Footer */}
                    <motion.p
                        className="mt-10 text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Thinking Engines Analytics Platform
                    </motion.p>
                </div>
            </div>
        </div>
    );
};

export default LoginSelection;
