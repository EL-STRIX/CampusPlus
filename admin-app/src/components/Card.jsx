import PropTypes from 'prop-types';

export default function Card({
  children,
  title = null,
  subtitle = null,
  action = null,
  className = '',
  bodyClassName = '',
  headerClassName = '',
  ...props
}) {
  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-card overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || action) && (
        <div
          className={`px-6 py-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-lowest/50 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="font-headline font-bold text-base md:text-lg text-on-surface">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
};
