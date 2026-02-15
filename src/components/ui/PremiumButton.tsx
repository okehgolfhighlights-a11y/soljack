import React from 'react';

interface PremiumButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  children
}) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #0077BE, #005A8C)',
      color: 'white',
    },
    secondary: {
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      color: '#1A3A52',
    }
  };

  const sizeStyles = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.25rem' }
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...styles[variant],
        ...sizeStyles[size],
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'transform 0.2s',
      }}
    >
      {children}
    </button>
  );
};