import PropTypes from 'prop-types';

export default function Badge({ status, count = null, className = '' }) {
  const normalized = (status || '').toLowerCase().replace('-', '_');

  const configs = {
    open: {
      label: 'Open',
      styles: 'bg-slate-100 text-slate-700 border-slate-300',
      dotColor: 'bg-slate-500',
    },
    in_progress: {
      label: 'In Progress',
      styles: 'bg-amber-50 text-amber-800 border-amber-300',
      dotColor: 'bg-amber-500',
    },
    resolved: {
      label: 'Resolved',
      styles: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dotColor: 'bg-emerald-500',
    },
    rejected: {
      label: 'Rejected',
      styles: 'bg-red-50 text-red-800 border-red-300',
      dotColor: 'bg-red-500',
    },
    needs_review: {
      label: 'Needs Review',
      styles: 'bg-purple-50 text-purple-800 border-purple-300',
      dotColor: 'bg-purple-500',
    },
    possible_duplicate: {
      label: 'Possible Duplicate',
      styles: 'bg-purple-50 text-purple-800 border-purple-300',
      dotColor: 'bg-purple-500',
    },
  };

  const config = configs[normalized] || {
    label: status || 'Unknown',
    styles: 'bg-gray-100 text-gray-700 border-gray-300',
    dotColor: 'bg-gray-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-headline font-semibold border ${config.styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
      <span>{config.label}</span>
      {count !== null && count !== undefined && (
        <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-black/10 text-[10px] font-bold font-mono">
          {count}
        </span>
      )}
    </span>
  );
}

Badge.propTypes = {
  status: PropTypes.string.isRequired,
  count: PropTypes.number,
  className: PropTypes.string,
};
