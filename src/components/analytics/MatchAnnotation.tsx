import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText,
    Plus,
    Clock,
    Flag,
    AlertTriangle,
    Star,
    Target,
    Users,
    ShieldAlert,
    Zap,
    Edit2,
    Trash2,
    Save,
    X,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Annotation {
    id: string;
    minute: number;
    type: 'tactical' | 'highlight' | 'concern' | 'player' | 'defensive' | 'opportunity';
    title: string;
    description: string;
    players?: string[];
    createdAt: Date;
}

interface MatchAnnotationProps {
    matchId?: string;
}

// Preset annotation types
const annotationTypes = [
    { value: 'tactical', label: 'Tactical Note', icon: Flag, color: 'text-primary', bgColor: 'bg-primary/20' },
    { value: 'highlight', label: 'Key Highlight', icon: Star, color: 'text-warning', bgColor: 'bg-warning/20' },
    { value: 'concern', label: 'Area of Concern', icon: AlertTriangle, color: 'text-destructive', bgColor: 'bg-destructive/20' },
    { value: 'player', label: 'Player Note', icon: Users, color: 'text-emerald-500', bgColor: 'bg-emerald-500/20' },
    { value: 'defensive', label: 'Defensive Issue', icon: ShieldAlert, color: 'text-orange-500', bgColor: 'bg-orange-500/20' },
    { value: 'opportunity', label: 'Opportunity', icon: Zap, color: 'text-cyan-400', bgColor: 'bg-cyan-400/20' },
] as const;

// Sample annotations data
const sampleAnnotations: Annotation[] = [
    {
        id: '1',
        minute: 12,
        type: 'tactical',
        title: 'High press effective',
        description: 'Team successfully recovered ball in opponent half 3 times in last 5 minutes. Continue pressing when ahead.',
        players: ['Seishiro Nagi', 'Rin Itoshi'],
        createdAt: new Date('2026-01-10T19:12:00'),
    },
    {
        id: '2',
        minute: 25,
        type: 'concern',
        title: 'Weak right flank coverage',
        description: 'Right back leaving too much space behind. Opponent exploiting this with diagonal balls.',
        players: ['RB'],
        createdAt: new Date('2026-01-10T19:25:00'),
    },
    {
        id: '3',
        minute: 38,
        type: 'highlight',
        title: 'Goal-scoring opportunity',
        description: 'Quick transition from midfield to attack created clear scoring chance. Replicate this pattern.',
        createdAt: new Date('2026-01-10T19:38:00'),
    },
    {
        id: '4',
        minute: 67,
        type: 'player',
        title: 'Substitution impact',
        description: 'Fresh legs in midfield changed the tempo. Consider earlier sub in future matches.',
        players: ['Rensuke Kunigami'],
        createdAt: new Date('2026-01-10T20:07:00'),
    },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
};

const MatchAnnotation = ({ matchId }: MatchAnnotationProps) => {
    const [annotations, setAnnotations] = useState<Annotation[]>(sampleAnnotations);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newAnnotation, setNewAnnotation] = useState({
        minute: 0,
        type: 'tactical' as Annotation['type'],
        title: '',
        description: '',
    });
    const [filterType, setFilterType] = useState<string | null>(null);

    // Sorted annotations by minute
    const sortedAnnotations = useMemo(() => {
        let filtered = [...annotations];
        if (filterType) {
            filtered = filtered.filter(a => a.type === filterType);
        }
        return filtered.sort((a, b) => a.minute - b.minute);
    }, [annotations, filterType]);

    const getTypeConfig = (type: string) => {
        return annotationTypes.find(t => t.value === type) || annotationTypes[0];
    };

    const handleAddAnnotation = () => {
        if (!newAnnotation.title.trim()) return;

        const annotation: Annotation = {
            id: Date.now().toString(),
            minute: newAnnotation.minute,
            type: newAnnotation.type,
            title: newAnnotation.title,
            description: newAnnotation.description,
            createdAt: new Date(),
        };

        setAnnotations([...annotations, annotation]);
        setNewAnnotation({ minute: 0, type: 'tactical', title: '', description: '' });
        setIsAddingNew(false);
    };

    const handleDeleteAnnotation = (id: string) => {
        setAnnotations(annotations.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-primary">{annotations.length}</p>
                            <p className="text-xs text-muted-foreground">Total Notes</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                            <Star className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-warning">
                                {annotations.filter(a => a.type === 'highlight').length}
                            </p>
                            <p className="text-xs text-muted-foreground">Highlights</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-destructive">
                                {annotations.filter(a => a.type === 'concern' || a.type === 'defensive').length}
                            </p>
                            <p className="text-xs text-muted-foreground">Concerns</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-500">
                                {annotations.filter(a => a.type === 'tactical').length}
                            </p>
                            <p className="text-xs text-muted-foreground">Tactical Notes</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Add New */}
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Match Annotations
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {/* Filter Buttons */}
                            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                                <Button
                                    size="sm"
                                    variant={filterType === null ? "default" : "ghost"}
                                    className="h-7 text-xs"
                                    onClick={() => setFilterType(null)}
                                >
                                    All
                                </Button>
                                {annotationTypes.map((type) => (
                                    <Button
                                        key={type.value}
                                        size="sm"
                                        variant={filterType === type.value ? "default" : "ghost"}
                                        className="h-7 text-xs"
                                        onClick={() => setFilterType(type.value)}
                                    >
                                        <type.icon className="w-3 h-3" />
                                    </Button>
                                ))}
                            </div>
                            <Button
                                size="sm"
                                onClick={() => setIsAddingNew(true)}
                                disabled={isAddingNew}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Note
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Add New Form */}
                    {isAddingNew && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-lg bg-secondary/30 border border-primary/30"
                        >
                            <h4 className="font-semibold text-foreground mb-4">New Annotation</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">Minute</label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={120}
                                        value={newAnnotation.minute}
                                        onChange={(e) => setNewAnnotation({ ...newAnnotation, minute: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">Type</label>
                                    <select
                                        value={newAnnotation.type}
                                        onChange={(e) => setNewAnnotation({ ...newAnnotation, type: e.target.value as Annotation['type'] })}
                                        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
                                    >
                                        {annotationTypes.map((type) => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs text-muted-foreground block mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newAnnotation.title}
                                    onChange={(e) => setNewAnnotation({ ...newAnnotation, title: e.target.value })}
                                    placeholder="Brief title for the annotation"
                                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="text-xs text-muted-foreground block mb-1">Description</label>
                                <textarea
                                    value={newAnnotation.description}
                                    onChange={(e) => setNewAnnotation({ ...newAnnotation, description: e.target.value })}
                                    placeholder="Detailed notes about this moment"
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsAddingNew(false)}>
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleAddAnnotation} disabled={!newAnnotation.title.trim()}>
                                    <Save className="w-4 h-4 mr-1" />
                                    Save Annotation
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Timeline View */}
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

                        {/* Annotations List */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="space-y-4"
                        >
                            {sortedAnnotations.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No annotations yet. Add your first note!</p>
                                </div>
                            ) : (
                                sortedAnnotations.map((annotation) => {
                                    const typeConfig = getTypeConfig(annotation.type);
                                    const TypeIcon = typeConfig.icon;

                                    return (
                                        <motion.div
                                            key={annotation.id}
                                            variants={itemVariants}
                                            className="relative flex gap-4 pl-3"
                                        >
                                            {/* Timeline Dot */}
                                            <div className={cn(
                                                "relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                                                typeConfig.bgColor
                                            )}>
                                                <TypeIcon className={cn("w-3.5 h-3.5", typeConfig.color)} />
                                            </div>

                                            {/* Annotation Card */}
                                            <div className="flex-1 bg-secondary/30 rounded-lg p-4 border border-border hover:border-primary/30 transition-colors">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={cn(
                                                                "text-xs px-2 py-0.5 rounded font-medium",
                                                                typeConfig.bgColor,
                                                                typeConfig.color
                                                            )}>
                                                                {annotation.minute}'
                                                            </span>
                                                            <span className={cn(
                                                                "text-xs px-2 py-0.5 rounded",
                                                                typeConfig.bgColor,
                                                                typeConfig.color
                                                            )}>
                                                                {typeConfig.label}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-semibold text-foreground mb-1">{annotation.title}</h4>
                                                        <p className="text-sm text-muted-foreground">{annotation.description}</p>
                                                        {annotation.players && annotation.players.length > 0 && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Users className="w-3 h-3 text-muted-foreground" />
                                                                <span className="text-xs text-muted-foreground">
                                                                    {annotation.players.join(', ')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleDeleteAnnotation(annotation.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="bg-card border-border">
                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-1">Annotation Tips</h4>
                            <p className="text-sm text-muted-foreground">
                                Use annotations to track key moments, tactical observations, and player performances.
                                These notes will help during post-match analysis and future game preparation.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MatchAnnotation;
