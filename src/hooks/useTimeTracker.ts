import { useState, useEffect } from 'react';

interface TimeInterval {
  start: number;
  end?: number;
}

interface TimeTrackerState {
  intervals: TimeInterval[];
  isTracking: boolean;
  goal?: number; // em minutos
}

const STORAGE_KEY = 'time-tracker-state';

export function useTimeTracker() {
  const [state, setState] = useState<TimeTrackerState>(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : {
      intervals: [],
      isTracking: false,
      goal: undefined
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const startTracking = () => {
    if (!state.isTracking) {
      setState(prev => ({
        ...prev,
        intervals: [...prev.intervals, { start: Date.now() }],
        isTracking: true
      }));
    }
  };

  const stopTracking = () => {
    if (state.isTracking) {
      setState(prev => ({
        ...prev,
        intervals: prev.intervals.map((interval, index) => {
          if (index === prev.intervals.length - 1) {
            return { ...interval, end: Date.now() };
          }
          return interval;
        }),
        isTracking: false
      }));
    }
  };

  const setGoal = (minutes: number | undefined) => {
    setState(prev => ({
      ...prev,
      goal: minutes
    }));
  };

  const calculateTotalTime = (): number => {
    return state.intervals.reduce((total, interval) => {
      const end = interval.end || (state.isTracking ? Date.now() : interval.start);
      return total + (end - interval.start);
    }, 0);
  };

  const getRemainingTime = (): number | undefined => {
    if (!state.goal) return undefined;
    const totalMinutes = calculateTotalTime() / (1000 * 60);
    return Math.max(0, state.goal - totalMinutes);
  };

  const resetAll = () => {
    setState({
      intervals: [],
      isTracking: false,
      goal: undefined
    });
  };

  return {
    isTracking: state.isTracking,
    goal: state.goal,
    startTracking,
    stopTracking,
    setGoal,
    calculateTotalTime,
    getRemainingTime,
    resetAll
  };
} 