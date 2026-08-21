import PropTypes from 'prop-types';

export function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id || name} className="text-xs font-headline font-semibold text-on-surface flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-sans bg-surface-container-lowest transition-all duration-150 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error
            ? 'border-error text-error focus:border-error focus:ring-error/20'
            : 'border-outline-variant/60 focus:border-primary text-on-surface'
        } disabled:bg-surface-container disabled:text-outline disabled:cursor-not-allowed`}
        {...props}
      />
      {error ? (
        <span className="text-xs text-error font-medium flex items-center gap-1 mt-0.5">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-on-surface-variant mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
}

export function Select({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id || name} className="text-xs font-headline font-semibold text-on-surface">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id || name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-sans bg-surface-container-lowest appearance-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            error
              ? 'border-error text-error focus:border-error focus:ring-error/20'
              : 'border-outline-variant/60 focus:border-primary text-on-surface'
          } disabled:bg-surface-container disabled:text-outline disabled:cursor-not-allowed`}
          {...props}
        >
          {placeholder && (
            <option value="">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-on-surface-variant">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error ? (
        <span className="text-xs text-error font-medium flex items-center gap-1 mt-0.5">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-on-surface-variant mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
}

export function Textarea({
  label,
  id,
  name,
  value,
  onChange,
  placeholder = '',
  rows = 3,
  maxLength = 500,
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex justify-between items-center">
        {label && (
          <label htmlFor={id || name} className="text-xs font-headline font-semibold text-on-surface">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        {maxLength && (
          <span className="text-[11px] text-on-surface-variant">
            {typeof value === 'string' ? value.length : 0}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-sans bg-surface-container-lowest transition-all duration-150 placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y ${
          error
            ? 'border-error text-error focus:border-error focus:ring-error/20'
            : 'border-outline-variant/60 focus:border-primary text-on-surface'
        } disabled:bg-surface-container disabled:text-outline disabled:cursor-not-allowed`}
        {...props}
      />
      {error ? (
        <span className="text-xs text-error font-medium flex items-center gap-1 mt-0.5">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-xs text-on-surface-variant mt-0.5">{helperText}</span>
      ) : null}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

Select.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
};

Textarea.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
};
