import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const Card = ({ children, title, className = '' }: CardProps) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default Card; 