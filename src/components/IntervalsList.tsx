import { useState } from 'react';
import { formatDateTime, formatTime } from '../utils/dateTime';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editForm, setEditForm] = useState({ start: '', end: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = (interval: Interval) => {
    setEditingId(interval.id);
    setError(null);
    setEditForm({
      start: new Date(interval.start).toISOString().slice(11, 16),
      end: interval.end ? new Date(interval.end).toISOString().slice(11, 16) : ''
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
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  const handleSave = (id: string) => {
    if (!validateTimes(editForm.start, editForm.end)) {
      setError('O horário de início deve ser anterior ao horário de fim');
      return;
    }

    const startTime = createDateWithTime(editForm.start);
    const endTime = editForm.end ? createDateWithTime(editForm.end) : undefined;

    // Se estiver editando o intervalo atual em andamento, não permitir que o início seja depois do momento atual
    if (isTracking && id === intervals[intervals.length - 1].id) {
      if (startTime > Date.now()) {
        setError('O horário de início não pode ser posterior ao momento atual');
        return;
      }
    }

    onEdit(id, startTime, endTime);
    setEditingId(null);
    setError(null);
  };

  const handleAdd = () => {
    if (!validateTimes(editForm.start, editForm.end)) {
      setError('O horário de início deve ser anterior ao horário de fim');
      return;
    }

    const startTime = createDateWithTime(editForm.start);
    const endTime = editForm.end ? createDateWithTime(editForm.end) : undefined;

    // Não permitir adicionar intervalos com início no futuro
    if (startTime > Date.now()) {
      setError('O horário de início não pode ser posterior ao momento atual');
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

  const renderTimeForm = (isNewInterval: boolean = false) => (
    <div className="space-y-2 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            Início
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
            Fim
          </label>
          <input
            type="time"
            value={editForm.end}
            onChange={(e) => {
              setEditForm(prev => ({ ...prev, end: e.target.value }));
              setError(null);
            }}
            className="w-full px-3 py-2 rounded border dark:bg-gray-600 dark:border-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isTracking && !isNewInterval}
          />
          {isTracking && !isNewInterval && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Em andamento
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
          Cancelar
        </button>
        <button
          onClick={() => isNewInterval ? handleAdd() : handleSave(editingId!)}
          className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {isNewInterval ? 'Adicionar' : 'Salvar'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {intervals.length === 0 && !isAdding ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8 animate-fade-in">
          Nenhum intervalo registrado hoje.
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
                      {formatDateTime(interval.start)} - {interval.end ? formatDateTime(interval.end) : 'Em andamento'}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatTime(duration)}
                    </div>
                  </div>
                  <div className="flex gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleEdit(interval)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    {!isCurrentlyTracking && (
                      <button
                        onClick={() => handleDelete(interval.id)}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="Excluir"
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
          className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Adicionar intervalo manualmente</span>
          </div>
        </button>
      )}
    </div>
  );
} 