import { useState, useEffect } from 'react';
import { useTimeTracker } from '../hooks/useTimeTracker';
import { formatDuration, formatMinutes } from '../utils/timeUtils';

export function TimeTracker() {
  const {
    isTracking,
    goal,
    startTracking,
    stopTracking,
    setGoal,
    calculateTotalTime,
    getRemainingTime,
    resetAll
  } = useTimeTracker();

  const [currentTime, setCurrentTime] = useState(calculateTotalTime());
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    let intervalId: number;

    if (isTracking) {
      intervalId = window.setInterval(() => {
        setCurrentTime(calculateTotalTime());
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, calculateTotalTime]);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minutes = parseInt(goalInput);
    if (!isNaN(minutes) && minutes > 0) {
      setGoal(minutes);
      setGoalInput('');
    }
  };

  const remainingTime = getRemainingTime();

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
          {formatDuration(currentTime)}
        </h2>
        {goal && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Meta: {formatMinutes(goal)} 
            {remainingTime !== undefined && (
              <span> (Restante: {formatMinutes(remainingTime)})</span>
            )}
          </p>
        )}
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className={`px-6 py-2 rounded-lg font-medium ${
            isTracking
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isTracking ? 'Parar' : 'Iniciar'}
        </button>
        <button
          onClick={resetAll}
          className="px-6 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200"
        >
          Resetar
        </button>
      </div>

      <form onSubmit={handleGoalSubmit} className="flex gap-2">
        <input
          type="number"
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          placeholder="Meta em minutos"
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium"
        >
          Definir Meta
        </button>
      </form>
    </div>
  );
} 