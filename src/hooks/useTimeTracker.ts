import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface TimeInterval {
  id: string;
  start: number;
  end?: number;
}

interface DayIntervals {
  [date: string]: TimeInterval[];
}

const STORAGE_KEY = 'time-intervals';

const getDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const key = `${year}-${month}-${day}`;
  console.log('Date Key for:', date);
  console.log('Formatted as:', key);
  return key;
};

const getTodayKey = (): string => {
  const key = getDateKey(new Date());
  console.log('Today Key (Local):', key);
  console.log('Current Date Object:', new Date());
  console.log('Current Date ISO:', new Date().toISOString());
  return key;
};

export function useTimeTracker() {
  const [allIntervals, setAllIntervals] = useState<DayIntervals>(() => {
    const savedIntervals = localStorage.getItem(STORAGE_KEY);
    if (!savedIntervals) return { [getTodayKey()]: [] };

    try {
      const parsedData = JSON.parse(savedIntervals);
      
      // Se for o formato antigo (array), converte para o novo formato
      if (Array.isArray(parsedData)) {
        const organizedData: DayIntervals = {};
        parsedData.forEach((interval: TimeInterval) => {
          const dateKey = getDateKey(new Date(interval.start));
          if (!organizedData[dateKey]) {
            organizedData[dateKey] = [];
          }
          organizedData[dateKey].push(interval);
        });
        return organizedData;
      }
      
      return parsedData;
    } catch (error) {
      console.error('Erro ao carregar intervalos:', error);
      return { [getTodayKey()]: [] };
    }
  });

  const [intervals, setIntervals] = useState<TimeInterval[]>(() => {
    return allIntervals[getTodayKey()] || [];
  });

  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Persiste todos os intervalos no localStorage
  useEffect(() => {
    const todayKey = getTodayKey();
    const newAllIntervals = {
      ...allIntervals,
      [todayKey]: intervals
    };
    setAllIntervals(newAllIntervals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllIntervals));
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
    const todayKey = getTodayKey();
    setIntervals([]);
    setIsTracking(false);
    setAllIntervals(prev => ({
      ...prev,
      [todayKey]: []
    }));
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

  const getIntervalsForDate = useCallback((date: Date): TimeInterval[] => {
    const dateKey = getDateKey(date);
    return allIntervals[dateKey] || [];
  }, [allIntervals]);

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
    getIntervalsForDate,
    allIntervals
  };
} 