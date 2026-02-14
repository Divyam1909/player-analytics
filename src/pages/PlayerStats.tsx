import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AuthHeader from "@/components/layout/AuthHeader";
import Sidebar from "@/components/layout/Sidebar";
import MatchTimeline from "@/components/charts/MatchTimeline";
import FootballField from "@/components/field/FootballField";
import PlayerPassingTree from "@/components/analytics/PlayerPassingTree";
import ShotMap from "@/components/analytics/ShotMap";
import ChancesCreatedMap from "@/components/analytics/ChancesCreatedMap";
import { Player, PlayerMatch } from "@/types/player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Target, Footprints, ArrowRightLeft, Crosshair, CalendarDays, Search, BarChart3, Map as MapIcon, Users, Zap, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayers } from "@/hooks/usePlayers";
import { useSidebarContext } from "@/contexts/SidebarContext";
import { StatHint } from "@/components/ui/stat-hint";

// Valid tab values
const VALID_TABS = ["match", "passing", "shots", "chances"];

// Section navigation configuration for each tab
const TAB_SECTIONS: Record<string, { id: string; label: string; icon: any }[]> = {
  match: [
    { id: 'match-selector', label: 'Match Selector', icon: CalendarDays },
    { id: 'match-stats', label: 'Match Stats', icon: BarChart3 },
    { id: 'match-heatmap', label: 'Heatmap', icon: MapIcon },
  ],
  passing: [
    { id: 'passing-selector', label: 'Match Selector', icon: CalendarDays },
    { id: 'passing-map', label: 'Passing Connections', icon: ArrowRightLeft },
    { id: 'passing-synergy', label: 'Player Synergy', icon: Users },
  ],
  shots: [
    { id: 'shots-selector', label: 'Match Selector', icon: CalendarDays },
    { id: 'shot-map', label: 'Shot Map', icon: Crosshair },
  ],
  chances: [
    { id: 'chances-selector', label: 'Match Selector', icon: CalendarDays },
    { id: 'chances-map', label: 'Chances Map', icon: Flame },
  ],
};

// Synergy data interface
interface PlayerSynergy {
  playerName: string;
  totalPasses: number;
  successfulPasses: number;
  failedPasses: number;
  accuracy: number;
  keyPasses: number;
  assists: number;
  progressivePasses: number;
  outplays: number;
  synergyScore: number; // Calculated synergy rating
}

// Synergy Analysis Component
interface SynergyAnalysisProps {
  events: import("@/types/player").MatchEvent[];
  playerName: string;
}

const SynergyAnalysis = ({ events, playerName }: SynergyAnalysisProps) => {
  const synergyData = useMemo(() => {
    // Filter only pass events
    const passes = events.filter(e => e.type === 'pass');

    // Group passes by target player
    const targetMap = new Map<string, {
      total: number;
      successful: number;
      keyPasses: number;
      assists: number;
      progressive: number;
      outplays: number;
    }>();

    passes.forEach(pass => {
      const target = pass.passTargetName || 'Unknown';
      if (target === 'Unknown') return; // Skip passes without target info

      const existing = targetMap.get(target) || {
        total: 0,
        successful: 0,
        keyPasses: 0,
        assists: 0,
        progressive: 0,
        outplays: 0
      };

      existing.total++;
      if (pass.success) existing.successful++;

      // Key pass = successful pass in final third (or explicit flag if available, but keeping logic consistent)
      if (pass.success && pass.targetX > 75) existing.keyPasses++;

      // New metrics
      if (pass.isAssist) existing.assists++;
      if (pass.isProgressive) existing.progressive++;
      if (pass.outplays) existing.outplays += pass.outplays;

      targetMap.set(target, existing);
    });

    // Convert to synergy array with calculated scores
    const synergyArray: PlayerSynergy[] = [];
    const totalPassesOverall = passes.length;

    // Find max values for normalization
    let maxProgressive = 1;
    let maxOutplays = 1;
    targetMap.forEach(data => {
      if (data.progressive > maxProgressive) maxProgressive = data.progressive;
      if (data.outplays > maxOutplays) maxOutplays = data.outplays;
    });

    targetMap.forEach((data, name) => {
      const accuracy = data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0;

      // NEW SYNERGY FORMULA:
      // Volume (30%): Percentage of total passes to this partner
      // Progressive (25%): Ratio of progressive passes to total passes (or normalized volume)
      // Led to Goal (25%): Heavily weighted assists
      // Outplays (20%): Normalized outplays count

      const volumeScore = Math.min((data.total / Math.max(totalPassesOverall * 0.2, 1)) * 100, 100);

      // Progressive score based on ratio, but boosted by volume
      const progressiveRatio = data.total > 0 ? (data.progressive / data.total) : 0;
      const progressiveScore = Math.min(progressiveRatio * 200, 100); // 50% progressive = 100 score

      // Led to goal (Assists) - simple bonus
      const assistScore = Math.min(data.assists * 25, 100); // 4 assists = 100 score

      // Outplays - normalized against max in set
      const outplayScore = (data.outplays / maxOutplays) * 100;

      const synergyScore = Math.round(
        volumeScore * 0.30 +
        progressiveScore * 0.25 +
        assistScore * 0.25 +
        outplayScore * 0.20
      );

      synergyArray.push({
        playerName: name,
        totalPasses: data.total,
        successfulPasses: data.successful,
        failedPasses: data.total - data.successful,
        accuracy,
        keyPasses: data.keyPasses,
        assists: data.assists,
        progressivePasses: data.progressive,
        outplays: data.outplays,
        synergyScore
      });
    });

    // Sort by synergy score (highest first)
    return synergyArray.sort((a, b) => b.synergyScore - a.synergyScore);
  }, [events]);

  const getSynergyColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-muted-foreground";
  };

  const getSynergyBg = (score: number) => {
    if (score >= 80) return "bg-success/20 text-success";
    if (score >= 60) return "bg-primary/20 text-primary";
    if (score >= 40) return "bg-warning/20 text-warning";
    return "bg-secondary text-muted-foreground";
  };

  const getSynergyLabel = (score: number) => {
    if (score >= 80) return "Elite";
    if (score >= 60) return "Strong";
    if (score >= 40) return "Moderate";
    return "Low";
  };

  if (synergyData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>No passing synergy data available</p>
        <p className="text-sm mt-1">Pass target information is required for synergy analysis</p>
      </div>
    );
  }

  // Get top 3 synergy partners
  const topPartners = synergyData.slice(0, 3);
  const totalPasses = synergyData.reduce((sum, p) => sum + p.totalPasses, 0);

  return (
    <div className="space-y-6">
      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-primary">{synergyData.length}</p>
          <p className="text-xs uppercase text-muted-foreground">Partners</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2">
            <span className={cn("text-2xl font-bold", getSynergyColor(topPartners[0]?.synergyScore || 0))}>
              {topPartners[0]?.synergyScore || 0}
            </span>
          </div>
          <p className="text-xs uppercase text-muted-foreground">Best Synergy</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-success">
            {Math.round(synergyData.reduce((sum, p) => sum + p.accuracy, 0) / synergyData.length)}%
          </p>
          <p className="text-xs uppercase text-muted-foreground">Avg Accuracy</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-warning">
            {synergyData.reduce((sum, p) => sum + p.keyPasses, 0)}
          </p>
          <p className="text-xs uppercase text-muted-foreground">Total Key Passes</p>
        </div>
      </div>

      {/* Top Synergy Partners - Visual Cards */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Top Synergy Partners
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPartners.map((partner, index) => (
            <motion.div
              key={partner.playerName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl border border-border bg-card hover:bg-secondary/20 transition-all cursor-default relative overflow-hidden group"
            >
              {/* Rank Badge */}
              <div className="absolute top-0 right-0 p-2 opacity-10 font-black text-6xl select-none group-hover:opacity-20 transition-opacity">
                {index + 1}
              </div>

              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2",
                  getSynergyBg(partner.synergyScore)
                )}>
                  {partner.playerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-foreground truncate max-w-[120px]" title={partner.playerName}>
                    {partner.playerName}
                  </p>
                  <p className={cn("text-xs font-medium", getSynergyColor(partner.synergyScore))}>
                    {getSynergyLabel(partner.synergyScore)} Synergy
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className={cn("text-2xl font-bold", getSynergyColor(partner.synergyScore))}>
                    {partner.synergyScore}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2 text-center relative z-10">
                <div>
                  <p className="text-sm font-bold text-foreground">{partner.totalPasses}</p>
                  <p className="text-[9px] uppercase text-muted-foreground">Volume</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-400">{partner.progressivePasses}</p>
                  <p className="text-[9px] uppercase text-muted-foreground">Prog.</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-400">{partner.assists}</p>
                  <p className="text-[9px] uppercase text-muted-foreground">Goal</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-400">{partner.outplays}</p>
                  <p className="text-[9px] uppercase text-muted-foreground">Outplay</p>
                </div>
              </div>

              {/* Synergy Bar */}
              <div className="mt-3 relative z-10">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${partner.synergyScore}%` }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                    className={cn(
                      "h-full rounded-full",
                      partner.synergyScore >= 80 ? "bg-success" :
                        partner.synergyScore >= 60 ? "bg-primary" :
                          partner.synergyScore >= 40 ? "bg-warning" : "bg-muted-foreground"
                    )}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Synergy Table */}
      {synergyData.length > 3 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            All Passing Partners ({synergyData.length})
          </h4>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Player</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Vol</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Prog</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Goal</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Outplays</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Acc</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Synergy</th>
                </tr>
              </thead>
              <tbody>
                {synergyData.slice(3).map((partner, index) => (
                  <tr
                    key={partner.playerName}
                    className={cn(
                      "border-b border-border/50 transition-colors hover:bg-secondary/30",
                      index % 2 === 0 ? "bg-transparent" : "bg-secondary/20"
                    )}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                          {partner.playerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="font-medium">{partner.playerName}</span>
                      </div>
                    </td>
                    <td className="text-center p-3 font-medium">{partner.totalPasses}</td>
                    <td className="text-center p-3 text-blue-400 font-medium">{partner.progressivePasses}</td>
                    <td className="text-center p-3 text-purple-400 font-medium">{partner.assists}</td>
                    <td className="text-center p-3 text-orange-400 font-medium">{partner.outplays}</td>
                    <td className="text-center p-3">
                      <span className={cn(
                        "font-medium",
                        partner.accuracy >= 80 ? "text-success" :
                          partner.accuracy >= 60 ? "text-primary" : "text-warning"
                      )}>
                        {partner.accuracy}%
                      </span>
                    </td>
                    <td className="text-center p-3">
                      <span className={cn(
                        "inline-flex items-center justify-center w-10 h-6 rounded-full text-xs font-bold",
                        getSynergyBg(partner.synergyScore),
                        getSynergyColor(partner.synergyScore)
                      )}>
                        {partner.synergyScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Synergy Score Explanation */}
      <div className="bg-secondary/30 rounded-lg p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-2">How Synergy Score is Calculated:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-medium">Volume (30%)</span>
            </div>
            <span className="text-[10px] pl-4">Passing frequency to partner</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="font-medium">Progressive (25%)</span>
            </div>
            <span className="text-[10px] pl-4">Forward movement passes</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-medium">Led to Goal (25%)</span>
            </div>
            <span className="text-[10px] pl-4">Assists and shot assists</span>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-400" />
              <span className="font-medium">Outplays (20%)</span>
            </div>
            <span className="text-[10px] pl-4">Defenders bypassed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Navigation Component
interface SectionNavProps {
  sections: { id: string; label: string; icon: any }[];
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
  embedded?: boolean;
}

const SectionNav = ({ sections, activeSection, onSectionClick, embedded }: SectionNavProps) => {
  if (sections.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: '-50%' }}
      animate={{ opacity: 1, x: 0, y: '-50%' }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="fixed right-3 top-[55%] z-50"
    >
      <div className={cn(
        "flex flex-row items-stretch rounded-xl bg-card/95 backdrop-blur-md border border-border shadow-xl",
        embedded ? "p-1.5 gap-0" : "p-2 gap-0"
      )}>
        {/* Active indicator bar */}
        <div className="relative flex flex-col justify-start mr-1.5">
          <motion.div
            className={cn(
              "rounded-full bg-primary",
              embedded ? "w-1 h-5" : "w-1.5 h-7"
            )}
            animate={{
              y: sections.findIndex(s => s.id === activeSection) * (embedded ? 28 : 36) + (embedded ? 4 : 4)
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        {/* Buttons container */}
        <div className={cn(
          "flex flex-col",
          embedded ? "gap-1" : "gap-1.5"
        )}>
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <motion.button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  "group relative flex items-center justify-center rounded-lg transition-all duration-200",
                  embedded ? "w-6 h-6" : "w-8 h-8",
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.05 }}
              >
                <Icon className={cn(embedded ? "w-3 h-3" : "w-3.5 h-3.5")} />

                {/* Tooltip on hover */}
                <div className={cn(
                  "absolute right-full mr-3 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap",
                  "bg-popover text-popover-foreground border border-border shadow-lg",
                  "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                  "transition-all duration-200 pointer-events-none"
                )}>
                  {section.label}
                  <div className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 rotate-45 bg-popover border-r border-t border-border" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

interface PlayerStatsProps {
  embedded?: boolean;
  defaultMatchId?: string;
}

const PlayerStats = ({ embedded = false, defaultMatchId }: PlayerStatsProps) => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed } = useSidebarContext();

  // Get initial tab from URL hash or default to "match"
  const getInitialTab = () => {
    const hash = location.hash.replace("#", "");
    return VALID_TABS.includes(hash) ? hash : "match";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [matchSearch, setMatchSearch] = useState<string>("");

  // Sync tab with URL hash on navigation (e.g., when clicking back)
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (VALID_TABS.includes(hash) && hash !== activeTab) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Section navigation state
  const [activeSection, setActiveSection] = useState<string>('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Get current tab's sections
  const currentSections = TAB_SECTIONS[activeTab] || [];

  // Handle section click - smooth scroll to section
  const handleSectionClick = useCallback((sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const headerOffset = 150;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setActiveSection(sectionId);
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollOffset = 200;

      for (const section of currentSections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= scrollOffset && rect.bottom > scrollOffset) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentSections]);

  // Reset active section when tab changes
  useEffect(() => {
    const sections = TAB_SECTIONS[activeTab] || [];
    if (sections.length > 0) {
      setActiveSection(sections[0].id);
    }
  }, [activeTab]);

  // Use the hook to fetch players from Supabase
  const { data: players = [], isLoading } = usePlayers();
  const player = players.find((p) => p.id === id);

  // Default to first player if no id or player not found
  const currentPlayer = player || players[0];

  // Calculate aggregated stats - MUST be before any early returns (Rules of Hooks)
  const aggregatedStats = useMemo(() => {
    if (!currentPlayer) return null;

    const matches = currentPlayer.matchStats;
    if (matches.length === 0) return null;

    const total = {
      goals: matches.reduce((a, m) => a + m.stats.goals, 0),
      assists: matches.reduce((a, m) => a + m.stats.assists, 0),
      passes: Math.round(matches.reduce((a, m) => a + m.stats.passes, 0) / matches.length),
      passAccuracy: Math.round(matches.reduce((a, m) => a + m.stats.passAccuracy, 0) / matches.length),
      shots: Math.round(matches.reduce((a, m) => a + m.stats.shots, 0) / matches.length),
      shotsOnTarget: Math.round(matches.reduce((a, m) => a + m.stats.shotsOnTarget, 0) / matches.length),
      interceptions: Math.round(matches.reduce((a, m) => a + m.stats.interceptions, 0) / matches.length),
      tackles: Math.round(matches.reduce((a, m) => a + m.stats.tackles, 0) / matches.length),
      dribbles: Math.round(matches.reduce((a, m) => a + m.stats.dribbles, 0) / matches.length),
      dribblesSuccessful: Math.round(matches.reduce((a, m) => a + m.stats.dribblesSuccessful, 0) / matches.length),
      distanceCovered: (matches.reduce((a, m) => a + m.stats.distanceCovered, 0) / matches.length).toFixed(1),
      sprints: Math.round(matches.reduce((a, m) => a + m.stats.sprints, 0) / matches.length),
    };
    return total;
  }, [currentPlayer]);

  // All events for combined views (passing/shots/chances)
  const allEvents = useMemo(() => {
    if (!currentPlayer) return [];
    return currentPlayer.matchStats.flatMap((m) => m.events);
  }, [currentPlayer]);


  // Set default selected match - using useEffect for side effects
  // NOTE: This hook MUST be before any early returns to comply with Rules of Hooks
  useEffect(() => {
    if (defaultMatchId) {
      setSelectedMatchId(defaultMatchId);
    } else if (currentPlayer && currentPlayer.matchStats.length > 0 && !selectedMatchId) {
      setSelectedMatchId(currentPlayer.matchStats[0].matchId);
    }
  }, [currentPlayer, selectedMatchId, defaultMatchId]);

  // Scroll to top when navigating to a new player
  useEffect(() => {
    if (!embedded) {
      window.scrollTo(0, 0);
    }
  }, [id, embedded]);

  // Loading state - after all hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading player data...</div>
      </div>
    );
  }

  // Player not found check - after all hooks
  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Player not found</p>
      </div>
    );
  }

  const selectedMatch = currentPlayer.matchStats.find(
    (m) => m.matchId === selectedMatchId
  );

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-success";
    if (rating >= 80) return "text-primary";
    if (rating >= 70) return "text-warning";
    return "text-destructive";
  };


  // Helper to display stat value - shows "--" for null
  const displayStat = (value: number | null | string): string => {
    if (value === null) return "--";
    return String(value);
  };


  return (
    <div className={embedded ? "bg-background" : "min-h-screen bg-background"}>
      {!embedded && <AuthHeader title="Player Stats" showBack />}
      {!embedded && <Sidebar />}

      {/* Section Navigation */}
      {currentSections.length > 0 && (
        <SectionNav
          sections={currentSections}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          embedded={embedded}
        />
      )}

      <main className={cn(
        embedded ? "pb-12 px-6" : "pt-24 pb-12 px-6 transition-all duration-300",
        !embedded && (isCollapsed ? "ml-16" : "ml-64")
      )}>
        <div className="container mx-auto">

          {/* Player Header */}
          <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Player Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                  <User className="w-12 h-12 lg:w-16 lg:h-16 text-muted-foreground" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary flex items-center justify-center text-lg lg:text-xl font-bold text-primary-foreground shadow-lg glow-primary">
                  {currentPlayer.jerseyNumber}
                </div>
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                    {currentPlayer.name}
                  </h1>
                  <span className="px-3 py-1 rounded-lg bg-secondary text-sm font-medium text-secondary-foreground">
                    {currentPlayer.position}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">{currentPlayer.team}</p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">
                      {aggregatedStats?.goals} Goals
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Footprints className="w-4 h-4 text-warning" />
                    <span className="text-sm text-muted-foreground">
                      {aggregatedStats?.assists} Assists
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {currentPlayer.matchStats.length} Matches
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              navigate(`#${value}`, { replace: true });
              // Reset scroll position to top when switching tabs
              window.scrollTo(0, 0);
            }}
            className="space-y-6"
          >
            <TabsList className="bg-secondary border border-border flex flex-wrap h-auto gap-1 p-1 sticky top-16 z-30">
              <TabsTrigger value="match" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Match-Wise Stats
              </TabsTrigger>
              <TabsTrigger value="passing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
                <ArrowRightLeft className="w-3 h-3" />
                Passing Analysis
              </TabsTrigger>
              <TabsTrigger value="shots" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
                <Crosshair className="w-3 h-3" />
                Shot Analysis
              </TabsTrigger>
              <TabsTrigger value="chances" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-1">
                <Flame className="w-3 h-3" />
                Chances Created
              </TabsTrigger>
            </TabsList>

            {/* Match-Wise Stats Tab */}
            <TabsContent value="match" className="space-y-6">
              {/* Match Selector - Compact List Style */}
              <Card
                id="match-selector"
                ref={(el) => { sectionRefs.current['match-selector'] = el; }}
                className="bg-card border-border scroll-mt-24"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Select Match</CardTitle>
                  {/* Search Bar */}
                  <div className="relative mt-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by opponent..."
                      value={matchSearch}
                      onChange={(e) => setMatchSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {currentPlayer.matchStats
                      .filter((match) =>
                        match.opponent.toLowerCase().includes(matchSearch.toLowerCase())
                      )
                      .map((match) => (
                        <motion.div
                          key={match.matchId}
                          onClick={() => setSelectedMatchId(match.matchId)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-all duration-200",
                            selectedMatchId === match.matchId
                              ? "bg-primary/15 border-l-2 border-primary"
                              : "hover:bg-secondary/80"
                          )}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center gap-3">
                            {selectedMatchId === match.matchId && (
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                            <span className={cn(
                              "font-medium text-sm",
                              selectedMatchId === match.matchId ? "text-primary" : "text-foreground"
                            )}>
                              vs {match.opponent}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(match.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </motion.div>
                      ))}
                    {currentPlayer.matchStats.filter((match) =>
                      match.opponent.toLowerCase().includes(matchSearch.toLowerCase())
                    ).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No matches found
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Match Timeline */}
              {selectedMatch && (
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <MatchTimeline events={selectedMatch.events} />
                  </CardContent>
                </Card>
              )}

              {selectedMatch && (
                <div
                  id="match-stats"
                  ref={(el) => { sectionRefs.current['match-stats'] = el; }}
                  className="space-y-6 scroll-mt-24"
                >
                  {/* Passing Stats Section */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        Passing Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {[
                          { label: "Total Passes", value: selectedMatch.stats.passes, color: "text-primary", statId: "total_passes" },
                          { label: "Pass %", value: `${selectedMatch.stats.passAccuracy}%`, color: "text-success", statId: "pass_accuracy" },
                          { label: "Key Passes", value: selectedMatch.stats.keyPasses, color: "text-warning", statId: "key_passes" },
                          { label: "Final Third", value: selectedMatch.stats.passesInFinalThird, color: "text-primary", statId: "passes_final_third" },
                          { label: "In Box", value: selectedMatch.stats.passesInBox, color: "text-destructive", statId: "passes_in_box" },
                          { label: "Crosses", value: selectedMatch.stats.crosses, color: "text-chart-4", statId: "crosses" },
                          { label: "Assists", value: selectedMatch.stats.assists, color: "text-warning", statId: "assists" },
                          { label: "Prog. Pass", value: selectedMatch.stats.progressivePassing, color: "text-success", statId: "progressive_passes" },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50">
                            <span className={cn("text-xl font-bold block", stat.color)}>
                              {displayStat(stat.value)}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1 block">
                              <StatHint statId={stat.statId} iconSize="sm">
                                <span>{stat.label}</span>
                              </StatHint>
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Defensive Stats Section */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-success"></span>
                        Defensive Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "Blocks", value: selectedMatch.stats.blocks, color: "text-success", statId: "blocks" },
                          { label: "Interceptions", value: selectedMatch.stats.interceptions, color: "text-primary", statId: "interceptions" },
                          { label: "Clearances", value: selectedMatch.stats.clearances, color: "text-warning", statId: "clearances" },
                          { label: "Recoveries", value: selectedMatch.stats.recoveries, color: "text-success", statId: "recoveries" },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center p-4 rounded-lg bg-secondary/50">
                            <span className={cn("text-2xl font-bold block", stat.color)}>
                              {displayStat(stat.value)}
                            </span>
                            <span className="text-xs uppercase tracking-wide text-muted-foreground mt-1 block">
                              <StatHint statId={stat.statId} iconSize="sm">
                                <span>{stat.label}</span>
                              </StatHint>
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attacking Stats Section */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-destructive"></span>
                        Attacking Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                        {[
                          { label: "Prog. Runs", value: selectedMatch.stats.progressiveRuns, color: "text-primary", statId: "progressive_runs" },
                          { label: "Dribbles", value: selectedMatch.stats.dribbles, color: "text-warning", statId: "dribbles" },
                          { label: "Success", value: selectedMatch.stats.dribblesSuccessful, color: "text-success", statId: "dribbles_successful" },
                          { label: "Aerial Won", value: selectedMatch.stats.aerialDuelsWon, color: "text-primary", statId: "aerial_duels_won" },
                          { label: "Shots", value: selectedMatch.stats.shots, color: "text-destructive", statId: "shots" },
                          { label: "On Target", value: selectedMatch.stats.shotsOnTarget, color: "text-warning", statId: "shots_on_target" },
                          { label: "Conv. Rate", value: `${selectedMatch.stats.shots > 0 ? Math.round((selectedMatch.stats.goals / selectedMatch.stats.shots) * 100) : 0}%`, color: "text-success", statId: "shot_conversion" },
                          { label: "Touches", value: selectedMatch.stats.ballTouches, color: "text-muted-foreground", statId: "ball_touches" },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center p-3 rounded-lg bg-secondary/50">
                            <span className={cn("text-xl font-bold block", stat.color)}>
                              {displayStat(stat.value)}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1 block">
                              <StatHint statId={stat.statId} iconSize="sm">
                                <span>{stat.label}</span>
                              </StatHint>
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Match Heatmap */}
                  <Card
                    id="match-heatmap"
                    ref={(el) => { sectionRefs.current['match-heatmap'] = el; }}
                    className="bg-card border-border scroll-mt-24"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Heatmap vs {selectedMatch.opponent}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FootballField events={selectedMatch.events} showHeatmap />
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* Passing Analysis Tab */}
            <TabsContent value="passing" className="space-y-6">
              {/* Match Selector */}
              <Card
                id="passing-selector"
                ref={(el) => { sectionRefs.current['passing-selector'] = el; }}
                className="bg-card border-border scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                    Passing Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {/* All Matches Option */}
                    <motion.div
                      onClick={() => setSelectedMatchId("all")}
                      className={cn(
                        "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        selectedMatchId === "all"
                          ? "bg-primary/10 border-primary shadow-md"
                          : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedMatchId === "all" && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                      )}
                      <p className="font-semibold text-foreground text-sm">All Matches</p>
                      <p className="text-xs text-muted-foreground">Combined</p>
                    </motion.div>

                    {currentPlayer.matchStats.map((match) => (
                      <motion.div
                        key={match.matchId}
                        onClick={() => setSelectedMatchId(match.matchId)}
                        className={cn(
                          "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                          selectedMatchId === match.matchId
                            ? "bg-primary/10 border-primary shadow-md"
                            : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {selectedMatchId === match.matchId && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                        <p className="font-semibold text-foreground text-sm">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Passing Connections — Tree Visualization */}
              <Card
                id="passing-map"
                ref={(el) => { sectionRefs.current['passing-map'] = el; }}
                className="bg-card border-border scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-primary" />
                    Passing Connections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlayerPassingTree
                    events={selectedMatchId === "all" ? allEvents : (selectedMatch?.events || [])}
                    playerName={currentPlayer.name}
                    matchId={selectedMatchId !== "all" ? selectedMatchId : undefined}
                  />
                </CardContent>
              </Card>

              {/* Player Synergy Analysis — below passing connections */}
              <Card
                id="passing-synergy"
                ref={(el) => { sectionRefs.current['passing-synergy'] = el; }}
                className="bg-card border-border scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Player Synergy Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SynergyAnalysis
                    events={selectedMatchId === "all" ? allEvents : (selectedMatch?.events || [])}
                    playerName={currentPlayer.name}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            {/* Shot Analysis Tab */}
            <TabsContent value="shots" className="space-y-6">
              {/* Match Selector */}
              <Card
                id="shots-selector"
                ref={(el) => { sectionRefs.current['shots-selector'] = el; }}
                className="bg-card border-border scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Crosshair className="w-5 h-5 text-destructive" />
                    Shot Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {/* All Matches Option */}
                    <motion.div
                      onClick={() => setSelectedMatchId("all")}
                      className={cn(
                        "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        selectedMatchId === "all"
                          ? "bg-primary/10 border-primary shadow-md"
                          : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedMatchId === "all" && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                      )}
                      <p className="font-semibold text-foreground text-sm">All Matches</p>
                      <p className="text-xs text-muted-foreground">Combined</p>
                    </motion.div>

                    {currentPlayer.matchStats.map((match) => (
                      <motion.div
                        key={match.matchId}
                        onClick={() => setSelectedMatchId(match.matchId)}
                        className={cn(
                          "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                          selectedMatchId === match.matchId
                            ? "bg-primary/10 border-primary shadow-md"
                            : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {selectedMatchId === match.matchId && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                        <p className="font-semibold text-foreground text-sm">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shot Map Visualization */}
              <Card
                id="shot-map"
                ref={(el) => { sectionRefs.current['shot-map'] = el; }}
                className="bg-card border-border scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-lg">Shot Map & Expected Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <ShotMap
                    events={selectedMatchId === "all" ? allEvents : (selectedMatch?.events || [])}
                    matchId={selectedMatchId !== "all" ? selectedMatchId : undefined}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chances Created Tab */}
            <TabsContent value="chances" className="space-y-6">
              {/* Match Selector */}
              <Card
                id="chances-selector"
                ref={(el) => { sectionRefs.current['chances-selector'] = el; }}
                className="bg-card border-border scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Flame className="w-5 h-5 text-warning" />
                    Chances Created Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {/* All Matches Option */}
                    <motion.div
                      onClick={() => setSelectedMatchId("all")}
                      className={cn(
                        "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                        selectedMatchId === "all"
                          ? "bg-primary/10 border-primary shadow-md"
                          : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedMatchId === "all" && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                      )}
                      <p className="font-semibold text-foreground text-sm">All Matches</p>
                      <p className="text-xs text-muted-foreground">Combined</p>
                    </motion.div>

                    {currentPlayer.matchStats.map((match) => (
                      <motion.div
                        key={match.matchId}
                        onClick={() => setSelectedMatchId(match.matchId)}
                        className={cn(
                          "relative p-3 rounded-lg border cursor-pointer transition-all duration-200",
                          selectedMatchId === match.matchId
                            ? "bg-primary/10 border-primary shadow-md"
                            : "bg-secondary/50 border-border hover:border-primary/50 hover:bg-secondary"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {selectedMatchId === match.matchId && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                        )}
                        <p className="font-semibold text-foreground text-sm">vs {match.opponent}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Chances Created Map */}
              <Card
                id="chances-map"
                ref={(el) => { sectionRefs.current['chances-map'] = el; }}
                className="bg-card border-border scroll-mt-24"
              >
                <CardHeader>
                  <CardTitle className="text-lg">Chances Created Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChancesCreatedMap
                    events={selectedMatchId === "all" ? allEvents : (selectedMatch?.events || [])}
                    playerName={currentPlayer.name}
                    matchId={selectedMatchId !== "all" ? selectedMatchId : undefined}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default PlayerStats;

