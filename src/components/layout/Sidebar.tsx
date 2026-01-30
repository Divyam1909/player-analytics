import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    User,
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    History,
    CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebarContext } from '@/contexts/SidebarContext';

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
        icon: <Home className="w-[18px] h-[18px]" />,
        href: '/dashboard',
    },
    {
        label: 'Profile',
        icon: <User className="w-[18px] h-[18px]" />,
        href: '/profile',
    },
    {
        label: 'Matches',
        icon: <Calendar className="w-[18px] h-[18px]" />,
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
    const { isCollapsed, toggleSidebar } = useSidebarContext();

    const toggleExpand = (label: string) => {
        if (isCollapsed) return; // Don't expand when collapsed
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
        <motion.aside
            className={cn(
                "fixed left-0 top-0 bottom-0 bg-card border-r border-border z-40 overflow-y-auto overflow-x-hidden",
                className
            )}
            animate={{ width: isCollapsed ? 64 : 256 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <div className="p-3 h-full flex flex-col">
                {/* Collapse Toggle at top */}
                <div className={cn(
                    "flex mb-4",
                    isCollapsed ? "justify-center" : "justify-end"
                )}>
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-md transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-1.5"
                        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                        ) : (
                            <>
                                <span className="text-xs font-medium">Collapse</span>
                                <ChevronLeft className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-1 flex-1">
                    {menuItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                // Dropdown item
                                <div>
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                                            isCollapsed ? "justify-center" : "justify-between",
                                            isChildActive(item.children)
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                        )}
                                        title={isCollapsed ? item.label : undefined}
                                    >
                                        <div className={cn(
                                            "flex items-center gap-3",
                                            isCollapsed && "justify-center"
                                        )}>
                                            {item.icon}
                                            <AnimatePresence>
                                                {!isCollapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0, width: 0 }}
                                                        animate={{ opacity: 1, width: "auto" }}
                                                        exit={{ opacity: 0, width: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        {!isCollapsed && (
                                            <motion.div
                                                animate={{ rotate: expandedItems.includes(item.label) ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </motion.div>
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {expandedItems.includes(item.label) && !isCollapsed && (
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
                                        isCollapsed && "justify-center",
                                        isActive(item.href)
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )}
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    {item.icon}
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, width: 0 }}
                                                animate={{ opacity: 1, width: "auto" }}
                                                exit={{ opacity: 0, width: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="text-sm font-medium whitespace-nowrap overflow-hidden"
                                            >
                                                {item.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
