interface TechTagProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'primary' | 'accent' | 'neutral';
  size?: 'sm' | 'md';
}

export default function TechTag({ label, selected, onClick, variant = 'primary', size = 'md' }: TechTagProps) {
  const baseClasses = 'inline-flex items-center rounded-full font-medium transition-all duration-200 cursor-pointer select-none';

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  const variantClasses = {
    primary: selected
      ? 'bg-primary-600 text-white border border-primary-500'
      : 'bg-primary-900/30 text-primary-300 border border-primary-700/30 hover:bg-primary-900/50',
    accent: selected
      ? 'bg-accent-600 text-white border border-accent-500'
      : 'bg-accent-900/30 text-accent-300 border border-accent-700/30 hover:bg-accent-900/50',
    neutral: selected
      ? 'bg-dark-600 text-white border border-dark-500'
      : 'bg-dark-800 text-dark-300 border border-dark-600 hover:bg-dark-700',
  };

  return (
    <span className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]}`} onClick={onClick}>
      {label}
    </span>
  );
}
