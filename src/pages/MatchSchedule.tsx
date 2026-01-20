import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthHeader from '@/components/layout/AuthHeader';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Trophy,
    Clock,
    CalendarDays,
    Home,
    Plane
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample schedule data - IDs match Supabase match IDs for navigation
const scheduleData = [
    { id: '22222222-0000-0000-0000-000000000002', date: '2024-03-22', opponent: 'England U-20', venue: 'Home', tournament: 'International Friendly', result: 'W 7-1', type: 'past' },
    { id: '22222222-0000-0000-0000-000000000001', date: '2024-03-15', opponent: 'Team World Five', venue: 'Home', tournament: 'Blue Lock Project Match', result: 'W 9-2', type: 'past' },
    { id: 'match-4', date: '2026-01-25', opponent: 'Mumbai City FC', venue: 'Away', tournament: 'ISL League', type: 'upcoming' },
    { id: 'match-5', date: '2026-02-01', opponent: 'Bengaluru FC', venue: 'Away', tournament: 'ISL League', type: 'upcoming' },
    { id: 'match-6', date: '2026-02-08', opponent: 'Kolkata United', venue: 'Away', tournament: 'Cup Quarterfinal', type: 'upcoming' },
    { id: 'match-7', date: '2026-02-15', opponent: 'Goa FC', venue: 'Home', tournament: 'ISL League', type: 'upcoming' },
    { id: 'match-8', date: '2026-02-22', opponent: 'Chennai City', venue: 'Home', tournament: 'ISL League', type: 'upcoming' },
    { id: 'match-9', date: '2026-03-01', opponent: 'Hyderabad FC', venue: 'Away', tournament: 'ISL League', type: 'upcoming' },
    { id: 'match-10', date: '2026-03-08', opponent: 'Pune City', venue: 'Home', tournament: 'Cup Semi', type: 'upcoming' },
];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
};

const MatchSchedule = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // January 2026
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Generate calendar days
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const getMatchForDate = (day: number | null) => {
        if (!day) return null;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return scheduleData.find(m => m.date === dateStr);
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getResultColor = (result?: string) => {
        if (!result) return '';
        if (result.startsWith('W')) return 'bg-emerald-500';
        if (result.startsWith('L')) return 'bg-destructive';
        return 'bg-warning';
    };

    const filteredMatches = scheduleData.filter(m => {
        const matchDate = new Date(m.date);
        return matchDate.getMonth() === month && matchDate.getFullYear() === year;
    });

    return (
        <div className="min-h-screen bg-background">
            <AuthHeader title="Match Schedule" />
            <Sidebar />

            <main className="pt-24 pb-12 px-6 ml-64">
                <div className="container mx-auto">
                    {/* Header */}
                    <motion.div
                        className="mb-8 flex items-center justify-between"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                Match <span className="text-primary">Schedule</span>
                            </h1>
                            <p className="text-muted-foreground">
                                Full season schedule and fixture calendar
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('calendar')}
                            >
                                <Calendar className="w-4 h-4 mr-1" />
                                Calendar
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                            >
                                <CalendarDays className="w-4 h-4 mr-1" />
                                List
                            </Button>
                        </div>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        className="grid grid-cols-4 gap-4 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {[
                            { label: 'Total Matches', value: scheduleData.length, color: 'text-primary' },
                            { label: 'Played', value: scheduleData.filter(m => m.type === 'past').length, color: 'text-muted-foreground' },
                            { label: 'Upcoming', value: scheduleData.filter(m => m.type === 'upcoming').length, color: 'text-warning' },
                            { label: 'Home Games', value: scheduleData.filter(m => m.venue === 'Home').length, color: 'text-emerald-500' },
                        ].map((stat) => (
                            <Card key={stat.label} className="bg-card border-border">
                                <CardContent className="p-4 text-center">
                                    <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </motion.div>

                    {viewMode === 'calendar' ? (
                        /* Calendar View */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="bg-card border-border">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <Button variant="ghost" size="icon" onClick={prevMonth}>
                                            <ChevronLeft className="w-5 h-5" />
                                        </Button>
                                        <CardTitle className="text-xl">
                                            {MONTHS[month]} {year}
                                        </CardTitle>
                                        <Button variant="ghost" size="icon" onClick={nextMonth}>
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {/* Day Headers */}
                                    <div className="grid grid-cols-7 gap-2 mb-2">
                                        {DAYS.map(day => (
                                            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
                                    <motion.div
                                        className="grid grid-cols-7 gap-2"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="show"
                                        key={`${month}-${year}`}
                                    >
                                        {calendarDays.map((day, index) => {
                                            const match = getMatchForDate(day);
                                            const isToday = day && new Date().getDate() === day &&
                                                new Date().getMonth() === month &&
                                                new Date().getFullYear() === year;

                                            return (
                                                <motion.div
                                                    key={index}
                                                    variants={itemVariants}
                                                    onClick={() => {
                                                        if (match && match.type === 'past') {
                                                            navigate(`/match/${match.id}`);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "min-h-[90px] rounded-lg p-2 border transition-all",
                                                        day ? "bg-secondary/20 border-border hover:border-primary/50 cursor-pointer" : "bg-transparent border-transparent",
                                                        isToday && "ring-2 ring-primary",
                                                        match && "bg-primary/10 border-primary/30",
                                                        match && match.type === 'past' && "hover:bg-primary/20"
                                                    )}
                                                >
                                                    {day && (
                                                        <>
                                                            <span className={cn(
                                                                "text-sm font-medium",
                                                                isToday ? "text-primary" : "text-foreground"
                                                            )}>
                                                                {day}
                                                            </span>
                                                            {match && (
                                                                <div className="mt-1">
                                                                    <div className={cn(
                                                                        "text-[9px] px-1.5 py-0.5 rounded text-white font-medium truncate",
                                                                        match.type === 'past' ? getResultColor(match.result) : "bg-primary"
                                                                    )}>
                                                                        {match.type === 'past' ? match.result : 'vs'}
                                                                    </div>
                                                                    <p className="text-[10px] text-foreground font-medium truncate mt-0.5">
                                                                        {match.opponent}
                                                                    </p>
                                                                    <p className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                                                        {match.venue === 'Home' ? <Home className="w-2.5 h-2.5" /> : <Plane className="w-2.5 h-2.5" />}
                                                                        {match.venue}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : (
                        /* List View */
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="space-y-3"
                        >
                            {scheduleData.map((match, index) => (
                                <motion.div
                                    key={match.date}
                                    variants={itemVariants}
                                    onClick={() => {
                                        if (match.type === 'past') {
                                            navigate(`/match/${match.id}`);
                                        }
                                    }}
                                    className={match.type === 'past' ? 'cursor-pointer' : ''}
                                >
                                    <Card className={cn(
                                        "bg-card border-border overflow-hidden",
                                        match.type === 'past' && "opacity-75 hover:opacity-100 hover:border-primary/50 transition-all"
                                    )}>
                                        <CardContent className="p-0">
                                            <div className="flex items-center">
                                                {/* Date Strip */}
                                                <div className={cn(
                                                    "w-20 py-4 text-center flex-shrink-0",
                                                    match.type === 'past' ? "bg-secondary" : "bg-primary/20"
                                                )}>
                                                    <p className="text-xs text-muted-foreground uppercase">
                                                        {new Date(match.date).toLocaleDateString('en-US', { month: 'short' })}
                                                    </p>
                                                    <p className={cn(
                                                        "text-2xl font-bold",
                                                        match.type === 'past' ? "text-muted-foreground" : "text-primary"
                                                    )}>
                                                        {new Date(match.date).getDate()}
                                                    </p>
                                                </div>

                                                {/* Match Info */}
                                                <div className="flex-1 p-4">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-semibold text-foreground">vs {match.opponent}</h3>
                                                        {match.result && (
                                                            <span className={cn(
                                                                "text-xs px-2 py-0.5 rounded text-white font-medium",
                                                                getResultColor(match.result)
                                                            )}>
                                                                {match.result}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            {match.venue === 'Home' ? <Home className="w-3.5 h-3.5" /> : <Plane className="w-3.5 h-3.5" />}
                                                            {match.venue}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Trophy className="w-3.5 h-3.5" />
                                                            {match.tournament}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div className="px-4">
                                                    <span className={cn(
                                                        "text-xs px-3 py-1 rounded-full font-medium",
                                                        match.type === 'past'
                                                            ? "bg-secondary text-muted-foreground"
                                                            : "bg-primary/20 text-primary"
                                                    )}>
                                                        {match.type === 'past' ? 'Completed' : 'Upcoming'}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Legend */}
                    <motion.div
                        className="mt-6 flex items-center justify-center gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-emerald-500" />
                            <span className="text-xs text-muted-foreground">Win</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-warning" />
                            <span className="text-xs text-muted-foreground">Draw</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-destructive" />
                            <span className="text-xs text-muted-foreground">Loss</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-primary" />
                            <span className="text-xs text-muted-foreground">Upcoming</span>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default MatchSchedule;
