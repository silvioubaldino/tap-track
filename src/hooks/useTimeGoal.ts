import { useState, useEffect } from 'react';

interface TimeGoal {
  hours: number;
  minutes: number;
  totalMinutes: number;
  isActive: boolean;
  createdAt: string;
  completedAt?: string;
}

const STORAGE_KEY = 'timeGoal';

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export function useTimeGoal() {
  const [goal, setGoal] = useState<TimeGoal | null>(() => {
    const savedGoal = localStorage.getItem(STORAGE_KEY);
    if (!savedGoal) return null;

    const parsedGoal = JSON.parse(savedGoal);
    const createdAt = new Date(parsedGoal.createdAt);
    const now = new Date();

    // Se a meta não for do mesmo dia, retorna null
    if (!isSameDay(createdAt, now)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsedGoal;
  });

  useEffect(() => {
    if (goal) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goal));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [goal]);

  const setNewGoal = (hours: number, minutes: number) => {
    const totalMinutes = (hours * 60) + minutes;
    setGoal({
      hours,
      minutes,
      totalMinutes,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
  };

  const editGoal = (hours: number, minutes: number) => {
    if (goal) {
      const totalMinutes = (hours * 60) + minutes;
      setGoal({
        ...goal,
        hours,
        minutes,
        totalMinutes,
      });
    }
  };

  const completeGoal = () => {
    if (goal) {
      setGoal({
        ...goal,
        isActive: false,
        completedAt: new Date().toISOString(),
      });
    }
  };

  const clearGoal = () => {
    setGoal(null);
  };

  return {
    goal,
    setNewGoal,
    editGoal,
    completeGoal,
    clearGoal,
  };
}