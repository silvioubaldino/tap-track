import { useState } from 'react';
import { formatDateTime, formatTime } from '../utils/dateTime';
import { useTranslation } from 'react-i18next';

interface Interval {
  id: string;
  start: number;
  end?: number;
}

interface IntervalsListProps {
  intervals: Interval[];
  onDelete: (id: string) => void;
  onEdit: (id: string, start: number, end?: number) => void;
  onAdd: (start: number, end?: number) => void;
  isTracking: boolean;
}

export function IntervalsList({ intervals, onDelete, onEdit, onAdd, isTracking }: IntervalsListProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({ start: '', end: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (interval: Interval) => {
    setEditingId(interval.id);
    setError(null);
    const startDate = new Date(interval.start);
    const endDate = interval.end ? new Date(interval.end) : null;
    setEditForm({
      start: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
      end: endDate ? `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}` : ''
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      onDelete(id);
      setDeletingId(null);
    }, 300);
  };

  const validateTimes = (startTime: string, endTime?: string): boolean => {
    if (!endTime) return true;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    return endTotal > startTotal;
  };

  const createDateWithTime = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  const handleSave = (id: string) => {
    if (!validateTimes(editForm.start, editForm.end)) {
      setError(t('timeTracker.startBeforeEnd'));
      return;
    }

    const startTime = createDateWithTime(editForm.start);
    const endTime = editForm.end ? createDateWithTime(editForm.end) : undefined;

    if (isTracking && id === intervals[intervals.length - 1].id) {
      if (startTime > Date.now()) {
        setError(t('timeTracker.startNotInFuture'));
        return;
      }
    }

    onEdit(id, startTime, endTime);
    setEditingId(null);
    setError(null);
  };

  const handleAdd = () => {
    if (!validateTimes(editForm.start, editForm.end)) {
      setError(t('timeTracker.startBeforeEnd'));
      return;
    }

    const startTime = createDateWithTime(editForm.start);
    const endTime = editForm.end ? createDateWithTime(editForm.end) : undefined;

    // Não permitir adicionar intervalos com início no futuro
    if (startTime > Date.now()) {
      setError(t('timeTracker.startNotInFuture'));
      return;
    }

    onAdd(startTime, endTime);
    setIsAdding(false);
    setEditForm({ start: '', end: '' });
    setError(null);
  };

  const handleStartAdd = () => {
    const now = new Date();
    setEditForm({
      start: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      end: ''
    });
    setIsAdding(true);
    setError(null);
  };

  const renderTimeForm = (isNewInterval: boolean = false) => {
    const isEditingCurrentInterval = isTracking && editingId === intervals[intervals.length - 1]?.id;
    
    return (
      <div className="space-y-2 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              {t('timeTracker.startTime')}
            </label>
            <input
              type="time"
              value={editForm.start}
              onChange={(e) => {
                setEditForm(prev => ({ ...prev, start: e.target.value }));
                setError(null);
              }}
              className="w-full px-3 py-2 rounded border dark:bg-gray-600 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              {t('timeTracker.endTime')}
            </label>
            <input
              type="time"
              value={editForm.end}
              onChange={(e) => {
                setEditForm(prev => ({ ...prev, end: e.target.value }));
                setError(null);
              }}
              className="w-full px-3 py-2 rounded border dark:bg-gray-600 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isEditingCurrentInterval && !isNewInterval}
            />
            {isEditingCurrentInterval && !isNewInterval && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('timeTracker.inProgress')}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 dark:text-red-400 mt-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              isNewInterval ? setIsAdding(false) : setEditingId(null);
              setError(null);
            }}
            className="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            {t('timeTracker.cancel')}
          </button>
          <button
            onClick={() => isNewInterval ? handleAdd() : handleSave(editingId!)}
            className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            {isNewInterval ? t('timeTracker.addInterval') : t('timeTracker.save')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {intervals.length === 0 && !isAdding ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8 animate-fade-in">
          {t('timeTracker.noIntervals')}
        </div>
      ) : (
        intervals.map((interval, index) => {
          const duration = (interval.end || Date.now()) - interval.start;
          const isEditing = editingId === interval.id;
          const isDeleting = deletingId === interval.id;
          const isLast = index === intervals.length - 1;
          const isCurrentlyTracking = isLast && isTracking;

          return (
            <div
              key={interval.id}
              className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm transition-all duration-300 transform ${
                isDeleting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
              } hover:shadow-md`}
            >
              {isEditing ? (
                renderTimeForm()
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDateTime(interval.start)} - {interval.end ? formatDateTime(interval.end) : t('timeTracker.inProgress')}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatTime(duration)}
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleEdit(interval)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                      title={t('timeTracker.edit')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    {!isCurrentlyTracking && (
                      <button
                        onClick={() => handleDelete(interval.id)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                        title={t('timeTracker.delete')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Botão/Formulário para adicionar novo intervalo */}
      {isAdding ? (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
          {renderTimeForm(true)}
        </div>
      ) : (
        <button
          onClick={handleStartAdd}
          className="w-full py-3 rounded-lg font-medium bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors flex items-center justify-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          {t('timeTracker.addInterval')}
        </button>
      )}
    </div>
  );
} 