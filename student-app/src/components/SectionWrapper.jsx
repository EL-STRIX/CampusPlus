import PropTypes from 'prop-types';

export default function SectionWrapper({
  children,
  eyebrow = null,
  title = null,
  subtitle = null,
  centered = false,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <section className={`py-12 md:py-16 px-gutter w-full ${className}`} {...props}>
      <div className={`max-w-container-max mx-auto ${containerClassName}`}>
        {(eyebrow || title || subtitle) && (
          <div className={`mb-8 md:mb-12 ${centered ? 'text-center max-w-2xl mx-auto' : 'max-w-3xl'}`}>
            {eyebrow && (
              <span className="text-xs font-headline font-bold uppercase tracking-wider text-primary-container bg-primary/10 px-3 py-1 rounded-full inline-block mb-3">
                {eyebrow}
              </span>
            )}
            {title && (
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-headline font-bold text-on-surface mb-3 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base md:text-lg font-sans text-on-surface-variant leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

SectionWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  eyebrow: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  centered: PropTypes.bool,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};
