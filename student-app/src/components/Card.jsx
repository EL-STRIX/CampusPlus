import PropTypes from 'prop-types';

export default function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  const variantStyles = {
    default:
      'bg-surface-container-lowest border border-outline-variant/30 shadow-card rounded-xl p-6',
    flat:
      'bg-surface-container-low border border-outline-variant/20 rounded-xl p-6',
    elevated:
      'bg-surface-container-lowest shadow-float rounded-xl p-8 border border-outline-variant/20',
    interactive:
      'bg-surface-container-lowest border border-outline-variant/30 shadow-card rounded-xl p-6 hover:shadow-float hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
  };

  return (
    <div
      className={`${variantStyles[variant] || variantStyles.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'flat', 'elevated', 'interactive']),
  className: PropTypes.string,
};
