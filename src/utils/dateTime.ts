/**
 * Formatação e manipulação de data e hora
 */

/**
 * Retorna a data atual no formato ISO (YYYY-MM-DD)
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formata uma duração em milissegundos para o formato HH:MM:SS
 */
export const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
};

/**
 * Formata uma data em milissegundos para o formato HH:MM
 */
export const formatDateTime = (ms: number): string => {
  const date = new Date(ms);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Calcula a diferença em segundos entre duas datas
 */
export const getTimeDifference = (startTime: string, endTime: string): number => {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  
  return Math.floor((end - start) / 1000);
};

/**
 * Verifica se duas datas são do mesmo dia
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Converte uma data para string ISO com o timezone local
 */
export const toLocalISOString = (date: Date): string => {
  const tzOffset = date.getTimezoneOffset() * 60000; // offset em milissegundos
  const localDate = new Date(date.getTime() - tzOffset);
  return localDate.toISOString();
}; 