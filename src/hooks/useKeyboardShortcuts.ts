import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onStartStop: () => void;
  onReset: () => void;
}

export function useKeyboardShortcuts({ onStartStop, onReset }: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Não ativar atalhos se estiver em um campo de input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Espaço para iniciar/parar
      if (event.code === 'Space') {
        event.preventDefault();
        onStartStop();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onStartStop, onReset]);
} 