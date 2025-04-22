export interface TimeInterval {
  id: string;
  startTime: string;
  endTime: string | null;
}

export interface TimeGoal {
  dailyGoal: number; // em minutos
  enabled: boolean;
}

export interface AppState {
  intervals: TimeInterval[];
  currentDay: string;
  goal: TimeGoal;
  darkMode: boolean;
} 