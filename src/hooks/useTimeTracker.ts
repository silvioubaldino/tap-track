import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { isSameDay } from '../utils/dateTime';

interface TimeInterval {
  id: string;
  start: number;
  end?: number;
}

interface TimeTrackerState {
  intervals: TimeInterval[];
  isTracking: boolean;
}

const STORAGE_KEY = 'time-intervals';

export function useTimeTracker() {
  const [intervals, setIntervals] = useState<TimeInterval[]>(() => {
    const savedIntervals = localStorage.getItem(STORAGE_KEY);
    if (!savedIntervals) return [];

    const parsedIntervals = JSON.parse(savedIntervals);
    const today = new Date();
    
    // Filtra apenas os intervalos do dia atual
    return parsedIntervals.filter((interval: TimeInterval) => 
      isSameDay(new Date(interval.start), today)
    );
  });

  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Persiste os intervalos no localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(intervals));
  }, [intervals]);

  // Verifica se há um intervalo em andamento ao inicializar
  useEffect(() => {
    const lastInterval = intervals[intervals.length - 1];
    if (lastInterval && !lastInterval.end) {
      setIsTracking(true);
    }
  }, []);

  // Atualiza o lastUpdate a cada segundo quando houver um intervalo em andamento
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [isTracking]);

  const startTracking = useCallback(() => {
    const newInterval: TimeInterval = {
      id: uuidv4(),
      start: Date.now(),
    };
    setIntervals(prev => [...prev, newInterval]);
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    setIntervals(prev => prev.map((interval, index) => {
      if (index === prev.length - 1) {
        return { ...interval, end: Date.now() };
      }
      return interval;
    }));
    setIsTracking(false);
  }, []);

  const calculateTotalTime = useCallback(() => {
    return intervals.reduce((total, interval, index) => {
      // Se for o último intervalo e estiver em andamento, usa lastUpdate como end
      const isCurrentInterval = index === intervals.length - 1 && isTracking;
      const end = isCurrentInterval ? lastUpdate : interval.end;
      
      if (!end) return total;
      return total + (end - interval.start);
    }, 0);
  }, [intervals, isTracking, lastUpdate]);

  const resetAll = useCallback(() => {
    setIntervals([]);
    setIsTracking(false);
  }, []);

  const deleteInterval = useCallback((id: string) => {
    setIntervals(prev => {
      const newIntervals = prev.filter(interval => interval.id !== id);
      // Se deletou o intervalo em andamento, atualiza o estado de tracking
      if (id === prev[prev.length - 1]?.id && isTracking) {
        setIsTracking(false);
      }
      return newIntervals;
    });
  }, [isTracking]);

  const editInterval = useCallback((id: string, start: number, end?: number) => {
    setIntervals(prev => {
      const isEditingCurrent = id === prev[prev.length - 1]?.id && isTracking;
      
      return prev.map(interval => {
        if (interval.id === id) {
          // Se estiver editando o intervalo atual em andamento, mantém o end undefined
          if (isEditingCurrent) {
            return { ...interval, start };
          }
          return { ...interval, start, end };
        }
        return interval;
      });
    });
    // Força uma atualização do tempo total quando editar o intervalo em andamento
    if (isTracking) {
      setLastUpdate(Date.now());
    }
  }, [isTracking]);

  const addInterval = useCallback((start: number, end?: number) => {
    const newInterval: TimeInterval = {
      id: uuidv4(),
      start,
      end
    };
    setIntervals(prev => [...prev, newInterval]);
  }, []);

  const getCurrentInterval = useCallback(() => {
    if (!isTracking || intervals.length === 0) return null;
    return intervals[intervals.length - 1];
  }, [isTracking, intervals]);

  return {
    intervals,
    isTracking,
    startTracking,
    stopTracking,
    calculateTotalTime,
    resetAll,
    deleteInterval,
    editInterval,
    addInterval,
    getCurrentInterval,
  };
} 