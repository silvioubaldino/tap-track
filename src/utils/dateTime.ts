/**
 * Formatação e manipulação de data e hora
 */

/**
 * Retorna a data atual no formato ISO (YYYY-MM-DD)
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Formata uma duração em segundos para o formato HH:MM:SS
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
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
export const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}; 