import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    User,
    Calendar,
    ChevronDown,
    ChevronRight,
    Clock,
    History,
    CalendarDays,
    BarChart3,
    Users,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    className?: string;
}

interface MenuItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: { label: string; href: string; icon: React.ReactNode }[];
}

const menuItems: MenuItem[] = [
    {
        label: 'Home',
        icon: <Home className="w-5 h-5" />,
        href: '/dashboard',
    },
    {
        label: 'Profile',
        icon: <User className="w-5 h-5" />,
        href: '/profile',
    },
    {
        label: 'Matches',
        icon: <Calendar className="w-5 h-5" />,
        children: [
            { label: 'Upcoming Matches', href: '/matches/upcoming', icon: <Clock className="w-4 h-4" /> },
            { label: 'Past Matches', href: '/matches', icon: <History className="w-4 h-4" /> },
            { label: 'Match Schedule', href: '/matches/schedule', icon: <CalendarDays className="w-4 h-4" /> },
        ],
    },
];

const Sidebar = ({ className }: SidebarProps) => {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>(['Matches']);

    const toggleExpand = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        );
    };

    const isActive = (href?: string) => {
        if (!href) return false;
        return location.pathname === href || location.pathname.startsWith(href + '/');
    };

    const isChildActive = (children?: MenuItem['children']) => {
        if (!children) return false;
        return children.some(child => location.pathname === child.href || location.pathname.startsWith(child.href));
    };

    return (
        <aside className={cn(
            "fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border z-40 overflow-y-auto",
            className
        )}>
            <div className="p-4">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-6 px-2">
                    <img
                        src="/image.png"
                        alt="Thinking Engines"
                        className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                        <span className="font-semibold text-foreground text-sm">Thinking Engines</span>
                        <span className="block text-[10px] text-muted-foreground">Analytics Platform</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                // Dropdown item
                                <div>
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={cn(
                                            "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                                            isChildActive(item.children)
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {item.icon}
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: expandedItems.includes(item.label) ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </motion.div>
                                    </button>
                                    <AnimatePresence>
                                        {expandedItems.includes(item.label) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.href}
                                                            to={child.href}
                                                            className={cn(
                                                                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm",
                                                                isActive(child.href)
                                                                    ? "bg-primary/10 text-primary"
                                                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                                            )}
                                                        >
                                                            {child.icon}
                                                            <span>{child.label}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                // Regular link item
                                <Link
                                    to={item.href!}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                        isActive(item.href)
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                >
                                    {item.icon}
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
