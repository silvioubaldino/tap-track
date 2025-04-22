import { useState, useCallback, useEffect } from 'react';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { formatTime } from '../utils/timeUtils';
import { IntervalsList } from './IntervalsList';
import { TimeGoal } from './TimeGoal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface Interval {
  id: string;
  start: number;
  end?: number;
}

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
    addInterval
  } = useTimeTracker();

  const [currentTime, setCurrentTime] = useState(calculateTotalTime());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Atualiza o tempo total quando os intervalos são modificados ou quando está em andamento
  useEffect(() => {
    const updateTimer = () => {
      setCurrentTime(calculateTotalTime());
    };

    // Atualiza imediatamente
    updateTimer();

    // Se estiver em andamento, atualiza a cada segundo
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

  const handleExportData = useCallback(() => {
    // Cria o cabeçalho do CSV
    const headers = ['Data', 'Início', 'Fim', 'Duração'];
    
    // Formata os dados de cada intervalo
    const rows = intervals.map(interval => {
      const inicio = new Date(interval.start).toLocaleTimeString('pt-BR');
      const fim = interval.end ? new Date(interval.end).toLocaleTimeString('pt-BR') : 'Em andamento';
      const duracao = interval.end 
        ? formatTime(interval.end - interval.start)
        : formatTime(Date.now() - interval.start);
      
      return [
        new Date(interval.start).toLocaleDateString('pt-BR'),
        inicio,
        fim,
        duracao
      ];
    });

    // Adiciona uma linha com o total
    const linhaTotal = ['Total do dia', '', '', formatTime(currentTime)];
    
    // Combina tudo em um CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      linhaTotal.join(',')
    ].join('\n');

    // Cria e dispara o download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `controle-tempo-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [intervals, currentTime]);

  // Adiciona os atalhos de teclado
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

        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={handleExportData}
            className="text-sm px-3 py-1.5 rounded font-normal text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1"
          >
            Exportar dados
          </button>
          <button
            onClick={handleReset}
            disabled={isTransitioning}
            className="text-sm px-3 py-1.5 rounded font-normal text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-50"
          >
            Resetar dados
          </button>
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