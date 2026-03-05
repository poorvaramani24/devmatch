interface CompatibilityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function CompatibilityBadge({ score, size = 'md' }: CompatibilityBadgeProps) {
  const getColor = () => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 60) return 'from-primary-400 to-primary-600';
    if (score >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-dark-400 to-dark-500';
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-20 h-20 text-lg',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${getColor()} flex items-center justify-center font-bold text-white shadow-lg`}
      title={`${score}% Stack Match`}
    >
      {Math.round(score)}%
    </div>
  );
}
