import { useState, useEffect } from 'react';
import { useTimeGoal } from '../hooks/useTimeGoal';
import { formatDateTime } from '../utils/dateTime';
import { useTranslation } from 'react-i18next';

interface TimeGoalProps {
  totalMinutesTracked: number; // tempo em milissegundos
}

export function TimeGoal({ totalMinutesTracked }: TimeGoalProps) {
  const { t } = useTranslation();
  const { goal, setNewGoal, editGoal, clearGoal } = useTimeGoal();
  const [inputHours, setInputHours] = useState('');
  const [inputMinutes, setInputMinutes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Atualiza o lastUpdate a cada minuto para forçar o recálculo da previsão
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 60000); // 60000ms = 1 minuto

    return () => clearInterval(interval);
  }, []);

  // Converte milissegundos para minutos para o cálculo de progresso
  const trackedMinutes = Math.floor(totalMinutesTracked / (1000 * 60));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseInt(inputHours) || 0;
    const minutes = parseInt(inputMinutes) || 0;
    
    if ((hours > 0 || minutes > 0) && hours >= 0 && minutes >= 0 && minutes < 60) {
      if (isEditing) {
        editGoal(hours, minutes);
        setIsEditing(false);
      } else {
        setNewGoal(hours, minutes);
      }
      setInputHours('');
      setInputMinutes('');
    }
  };

  const handleStartEdit = () => {
    if (goal) {
      setInputHours(goal.hours.toString());
      setInputMinutes(goal.minutes.toString());
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setInputHours('');
    setInputMinutes('');
    setIsEditing(false);
  };

  const calculateProgress = () => {
    if (!goal) return 0;
    const progress = (trackedMinutes / goal.totalMinutes) * 100;
    return Math.min(progress, 100);
  };

  const getRemainingTime = () => {
    if (!goal) return null;
    
    // Converte a meta para milissegundos
    const goalInMs = goal.totalMinutes * 60 * 1000;
    const remainingMs = goalInMs - totalMinutesTracked;
    
    if (remainingMs <= 0) return t('timeTracker.goalReached');
    
    // Calcula horas, minutos e segundos
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    
    const hoursText = hours > 0 ? `${hours}h` : '';
    const minutesText = minutes > 0 ? `${minutes}min` : '';
    const secondsText = `${seconds}s`;
    
    // Adiciona espaços entre os componentes de tempo quando necessário
    const timeComponents = [
      hours > 0 ? hoursText : null,
      minutes > 0 ? minutesText : null,
      secondsText
    ].filter(Boolean);
    
    return `${timeComponents.join(' ')} ${t('timeTracker.remaining').toLowerCase()}`;
  };

  const getEstimatedCompletionTime = () => {
    if (!goal) return null;
    
    // Converte a meta para milissegundos
    const goalInMs = goal.totalMinutes * 60 * 1000;
    const remainingMs = goalInMs - totalMinutesTracked;
    
    if (remainingMs <= 0) return null;
    
    // Calcula o horário estimado de conclusão usando lastUpdate
    const estimatedCompletionTime = lastUpdate + remainingMs;
    
    return formatDateTime(estimatedCompletionTime);
  };

  const formatGoalTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="goalHours" className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('timeTracker.hours')}
          </label>
          <input
            type="number"
            id="goalHours"
            value={inputHours}
            onChange={(e) => setInputHours(e.target.value)}
            className="w-full p-3 text-lg border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            placeholder="00"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="goalMinutes" className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('timeTracker.minutes')}
          </label>
          <input
            type="number"
            id="goalMinutes"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(e.target.value)}
            className="w-full p-3 text-lg border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max="59"
            placeholder="00"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-3 px-4 text-lg font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isEditing ? t('timeTracker.save') : t('timeTracker.setGoal')}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-4 py-3 text-lg font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {t('timeTracker.cancel')}
          </button>
        )}
      </div>
    </form>
  );

  if (!goal || isEditing) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
          {isEditing ? t('timeTracker.editGoal') : t('timeTracker.dailyGoal')}
        </h2>
        {renderForm()}
      </div>
    );
  }

  const progress = calculateProgress();
  const remainingTime = getRemainingTime();
  const estimatedCompletionTime = getEstimatedCompletionTime();

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{t('timeTracker.dailyGoal')}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartEdit}
              className="text-sm text-gray-500 hover:text-blue-500 transition-colors duration-200"
            >
              {t('timeTracker.edit')}
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={clearGoal}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors duration-200"
            >
              {t('timeTracker.remove')}
            </button>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {formatGoalTime(goal.hours, goal.minutes)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('timeTracker.hours')}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {remainingTime}
            </p>
            {estimatedCompletionTime && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('timeTracker.estimatedCompletion')} {estimatedCompletionTime}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {t('timeTracker.progress')}
            </span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className={`h-full transition-all duration-500 ${
                progress >= 100 
                  ? 'bg-green-500' 
                  : progress >= 75 
                    ? 'bg-blue-500' 
                    : progress >= 50 
                      ? 'bg-blue-400' 
                      : 'bg-blue-300'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 