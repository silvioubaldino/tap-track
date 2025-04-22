import { useState, useCallback, useEffect, useRef } from 'react';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { formatTime } from '../utils/timeUtils';
import { IntervalsList } from './IntervalsList';
import { TimeGoal } from './TimeGoal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

export function TimeTracker() {
  const {
    intervals,
    isTracking,
    startTracking,
    stopTracking,
    calculateTotalTime,
    resetAll,
    deleteInterval,
    editInterval,
    addInterval,
    allIntervals
  } = useTimeTracker();

  const [currentTime, setCurrentTime] = useState(calculateTotalTime());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const updateTimer = () => {
      setCurrentTime(calculateTotalTime());
    };

    updateTimer();

    let intervalId: number | undefined;
    if (isTracking) {
      intervalId = window.setInterval(updateTimer, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, intervals, calculateTotalTime]);

  const handleStartTracking = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      startTracking();
      setIsTransitioning(false);
    }, 150);
  }, [startTracking]);

  const handleStopTracking = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      stopTracking();
      setIsTransitioning(false);
    }, 150);
  }, [stopTracking]);

  const handleReset = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      resetAll();
      setIsTransitioning(false);
    }, 150);
  }, [resetAll]);

  const handleExportData = useCallback((exportAll: boolean = false) => {
    const headers = ['Data', 'Início', 'Fim', 'Duração'];
    const rows: string[][] = [];
    
    if (exportAll) {
      Object.entries(allIntervals).forEach(([dateKey, dayIntervals]) => {
        if (dayIntervals.length === 0) return;

        const totalDayTime = dayIntervals.reduce((total, interval) => {
          const end = interval.end || Date.now();
          return total + (end - interval.start);
        }, 0);

        dayIntervals.forEach(interval => {
          rows.push([
            new Date(interval.start).toLocaleDateString('pt-BR'),
            new Date(interval.start).toLocaleTimeString('pt-BR'),
            interval.end ? new Date(interval.end).toLocaleTimeString('pt-BR') : 'Em andamento',
            formatTime(interval.end ? interval.end - interval.start : Date.now() - interval.start)
          ]);
        });

        rows.push([
          new Date(dateKey).toLocaleDateString('pt-BR'),
          'Total do dia',
          '',
          formatTime(totalDayTime)
        ]);

        rows.push(['', '', '', '']);
      });
    } else {
      intervals.forEach(interval => {
        rows.push([
          new Date(interval.start).toLocaleDateString('pt-BR'),
          new Date(interval.start).toLocaleTimeString('pt-BR'),
          interval.end ? new Date(interval.end).toLocaleTimeString('pt-BR') : 'Em andamento',
          formatTime(interval.end ? interval.end - interval.start : Date.now() - interval.start)
        ]);
      });

      rows.push([
        new Date().toLocaleDateString('pt-BR'),
        'Total do dia',
        '',
        formatTime(currentTime)
      ]);
    }

    if (rows[rows.length - 1].every(cell => cell === '')) {
      rows.pop();
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const fileName = exportAll 
      ? `controle-tempo-historico-${today}.csv`
      : `controle-tempo-${today}.csv`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [intervals, currentTime, allIntervals]);

  useKeyboardShortcuts({
    onStartStop: isTracking ? handleStopTracking : handleStartTracking,
    onReset: handleReset,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 px-4 sm:px-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 transition-all duration-300 ease-in-out">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className={`text-3xl sm:text-4xl font-bold mb-2 text-gray-800 dark:text-white transition-all duration-300 ${isTransitioning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
            {formatTime(currentTime)}
          </h2>
          <div className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
            Pressione <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Espaço</kbd> para {isTracking ? 'parar' : 'iniciar'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
          <button
            onClick={isTracking ? handleStopTracking : handleStartTracking}
            disabled={isTransitioning}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
              isTracking
                ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
                : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
            }`}
          >
            {isTracking ? 'Parar' : 'Iniciar'}
          </button>
        </div>

        <div className="flex justify-end mb-6">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-full sm:w-auto px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Ações
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 transition-all duration-200 z-10 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <div className="py-1">
                <button
                  onClick={() => {
                    handleExportData(true);
                    setIsMenuOpen(false);
                  }}
                  className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Exportar histórico
                </button>
                <button
                  onClick={() => {
                    handleExportData(false);
                    setIsMenuOpen(false);
                  }}
                  className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                  </svg>
                  Exportar dia atual
                </button>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    handleReset();
                    setIsMenuOpen(false);
                  }}
                  disabled={isTransitioning}
                  className="group flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-red-400 group-hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Resetar dados
                </button>
              </div>
            </div>
          </div>
        </div>

        <TimeGoal totalMinutesTracked={currentTime} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Intervalos de Hoje
        </h3>
        <IntervalsList
          intervals={intervals}
          onDelete={deleteInterval}
          onEdit={editInterval}
          onAdd={addInterval}
          isTracking={isTracking}
        />
      </div>
    </div>
  );
} 