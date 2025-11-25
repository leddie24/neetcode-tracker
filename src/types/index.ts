// Problem data structure
export interface Problem {
  id: number;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  day: number;
  url: string;
}

// Progress tracking
export interface ProblemProgress {
  solved: boolean;
  solvedDate: string | null;
  reviews: boolean[];
  dates: {
    initial?: string;
    review1?: string;
    review2?: string;
    review3?: string;
    review4?: string;
    review5?: string;
  };
}

export type ProgressState = Record<number, ProblemProgress>;

// Pattern types
export interface PatternTemplate {
  python: string;
  javascript: string;
  java: string;
  go: string;
}

export interface Pattern {
  title: string;
  description: string;
  templates: PatternTemplate;
  problems: string[];
}

export interface Language {
  id: keyof PatternTemplate;
  name: string;
  color: string;
}

// Interview Roadmap types
export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
}

export interface RoadmapSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  items: RoadmapItem[];
}

export interface MindmapContent {
  text: string;
  type?: "question" | "answer" | "use" | "note" | "item";
}

export interface MindmapSection {
  id: string;
  title: string;
  color: string;
  content: MindmapContent[];
}

export interface DSAMindmap {
  title: string;
  description: string;
  sections: MindmapSection[];
}

// Component props types
export interface StatsCardProps {
  color: "blue" | "green" | "yellow" | "red" | "purple";
  value: string | number;
  label: string;
}

export interface FiltersProps {
  categories: string[];
  difficulties: string[];
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  filterDifficulty: string;
  setFilterDifficulty: (difficulty: string) => void;
  showOnlyDueToday: boolean;
  setShowOnlyDueToday: (show: boolean) => void;
}

export interface ProblemTableProps {
  problems: Problem[];
  progress: ProgressState;
  toggleComplete: (problemId: number, reviewIndex?: number | null) => void;
  calculateNextReviews: (solvedDate: string | null) => string[];
  filterCategory: string;
  filterDifficulty: string;
  showOnlyDueToday: boolean;
}

export interface ExportImportControlsProps {
  progress: ProgressState;
  setProgress: (progress: ProgressState) => void;
}
