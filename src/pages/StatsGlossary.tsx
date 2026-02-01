import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  statsDefinitions,
  StatDefinition,
  StatCategory,
  getAllCategories,
  categoryDisplayNames,
  searchStats,
  getStatsByCategory,
} from "@/data/statsDefinitions";
import { getStatDiagram } from "@/assets/stat-diagrams";
import { cn } from "@/lib/utils";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Category colors for badges
const categoryColors: Record<StatCategory, string> = {
  general: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  passing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  attacking: "bg-red-500/20 text-red-400 border-red-500/30",
  defending: "bg-green-500/20 text-green-400 border-green-500/30",
  physical: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  goalkeeper: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  team: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  advanced: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

// Stat Card Component
function StatCard({ stat, isHighlighted }: { stat: StatDefinition; isHighlighted: boolean }) {
  const DiagramComponent = stat.icon ? getStatDiagram(stat.icon) : null;

  return (
    <motion.div variants={itemVariants} id={stat.id}>
      <Card
        className={cn(
          "h-full transition-all duration-300",
          isHighlighted && "ring-2 ring-primary shadow-lg shadow-primary/20"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold">{stat.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", categoryColors[stat.category])}>
                  {categoryDisplayNames[stat.category]}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {stat.shortName}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">What it measures</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{stat.description}</p>
          </div>

          {/* Diagram (if available) */}
          {DiagramComponent && (
            <div className="flex justify-center py-2 bg-secondary/30 rounded-lg">
              <DiagramComponent width={180} height={110} />
            </div>
          )}

          {/* Calculation */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">How it's calculated</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{stat.calculation}</p>
          </div>

          {/* Interpretation */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">What it means for coaches</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{stat.interpretation}</p>
          </div>

          {/* Good Range */}
          {stat.goodRange && (
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Target range:</span>
              <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                {stat.goodRange}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main Component
export default function StatsGlossary() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<StatCategory | "all">("all");
  const [highlightedStat, setHighlightedStat] = useState<string | null>(null);

  // Handle hash navigation
  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (hash && statsDefinitions[hash]) {
      setHighlightedStat(hash);
      // Scroll to the element after a short delay to ensure rendering
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      // Clear highlight after 3 seconds
      setTimeout(() => setHighlightedStat(null), 3000);
    }
  }, [location.hash]);

  // Filter stats based on search and category
  const filteredStats = useMemo(() => {
    let stats: StatDefinition[];

    if (searchQuery.trim()) {
      stats = searchStats(searchQuery);
    } else if (activeCategory === "all") {
      stats = Object.values(statsDefinitions);
    } else {
      stats = getStatsByCategory(activeCategory);
    }

    return stats;
  }, [searchQuery, activeCategory]);

  // Group stats by category for the "all" view
  const statsByCategory = useMemo(() => {
    const grouped: Record<StatCategory, StatDefinition[]> = {
      general: [],
      passing: [],
      attacking: [],
      defending: [],
      physical: [],
      goalkeeper: [],
      team: [],
      advanced: [],
    };

    filteredStats.forEach((stat) => {
      grouped[stat.category].push(stat);
    });

    return grouped;
  }, [filteredStats]);

  const categories = getAllCategories();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/overview">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Stats Glossary</h1>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search statistics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs
          value={activeCategory}
          onValueChange={(v) => setActiveCategory(v as StatCategory | "all")}
          className="space-y-6"
        >
          {/* Category Tabs */}
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-auto p-1 bg-secondary/50">
              <TabsTrigger
                value="all"
                className="px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                All Stats
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
                >
                  {categoryDisplayNames[category]}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {/* Stats Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredStats.length} statistic{filteredStats.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>

          {/* All Stats View */}
          <TabsContent value="all" className="mt-0">
            {searchQuery ? (
              // Search results - flat grid
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredStats.map((stat) => (
                  <StatCard
                    key={stat.id}
                    stat={stat}
                    isHighlighted={highlightedStat === stat.id}
                  />
                ))}
              </motion.div>
            ) : (
              // Grouped by category
              <div className="space-y-8">
                {categories.map((category) => {
                  const categoryStats = statsByCategory[category];
                  if (categoryStats.length === 0) return null;

                  return (
                    <div key={category}>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant="outline"
                          className={cn("text-sm px-3 py-1", categoryColors[category])}
                        >
                          {categoryDisplayNames[category]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ({categoryStats.length} stats)
                        </span>
                      </div>
                      <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        {categoryStats.map((stat) => (
                          <StatCard
                            key={stat.id}
                            stat={stat}
                            isHighlighted={highlightedStat === stat.id}
                          />
                        ))}
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Category-specific Views */}
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredStats.map((stat) => (
                  <StatCard
                    key={stat.id}
                    stat={stat}
                    isHighlighted={highlightedStat === stat.id}
                  />
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Empty State */}
        {filteredStats.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No stats found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or selecting a different category.
            </p>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const count = getStatsByCategory(category).length;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={cn(
                    "p-4 rounded-lg border border-border hover:border-primary/50 transition-colors text-left",
                    activeCategory === category && "border-primary bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{categoryDisplayNames[category]}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground">{count} stats</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
