import { useState } from 'react';
import { formatTime, formatDateTime } from '../utils/timeUtils';

interface Interval {
  id: string;
  start: number;
  end?: number;
}

interface IntervalsListProps {
  intervals: Interval[];
  onDelete: (id: string) => void;
  onEdit: (id: string, start: number, end?: number) => void;
  isTracking: boolean;
}

export function IntervalsList({ intervals, onDelete, onEdit, isTracking }: IntervalsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ start: '', end: '' });

  const handleEdit = (interval: Interval) => {
    setEditingId(interval.id);
    setEditForm({
      start: new Date(interval.start).toISOString().slice(11, 16),
      end: interval.end ? new Date(interval.end).toISOString().slice(11, 16) : ''
    });
  };

  const handleSave = (id: string) => {
    const [startHours, startMinutes] = editForm.start.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);
    
    let endDate: Date | undefined;
    if (editForm.end) {
      const [endHours, endMinutes] = editForm.end.split(':').map(Number);
      endDate = new Date();
      endDate.setHours(endHours, endMinutes, 0, 0);
    }

    onEdit(id, startDate.getTime(), endDate?.getTime());
    setEditingId(null);
  };

  if (intervals.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        Nenhum intervalo registrado hoje.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {intervals.map((interval, index) => {
        const duration = (interval.end || Date.now()) - interval.start;
        const isEditing = editingId === interval.id;
        const isLast = index === intervals.length - 1;
        const isCurrentlyTracking = isLast && isTracking;

        return (
          <div
            key={interval.id}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm"
          >
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="time"
                    value={editForm.start}
                    onChange={(e) => setEditForm(prev => ({ ...prev, start: e.target.value }))}
                    className="flex-1 px-2 py-1 rounded border dark:bg-gray-600 dark:border-gray-500"
                  />
                  <input
                    type="time"
                    value={editForm.end}
                    onChange={(e) => setEditForm(prev => ({ ...prev, end: e.target.value }))}
                    className="flex-1 px-2 py-1 rounded border dark:bg-gray-600 dark:border-gray-500"
                    disabled={isCurrentlyTracking}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1 text-sm rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSave(interval.id)}
                    className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {formatDateTime(interval.start)} - {interval.end ? formatDateTime(interval.end) : 'Em andamento'}
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {formatTime(duration)}
                  </div>
                </div>
                {!isCurrentlyTracking && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(interval)}
                      className="p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(interval.id)}
                      className="p-1 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 