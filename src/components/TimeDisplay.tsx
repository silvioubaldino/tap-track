import { formatTime } from '../utils/dateTime';

interface TimeDisplayProps {
  seconds: number;
  className?: string;
  label?: string;
}

const TimeDisplay = ({ seconds, className = '', label }: TimeDisplayProps) => {
  return (
    <div className={`text-center ${className}`}>
      {label && (
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      )}
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {formatTime(seconds)}
      </div>
    </div>
  );
};

export default TimeDisplay; 