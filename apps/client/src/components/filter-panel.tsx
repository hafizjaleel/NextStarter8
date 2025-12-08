'use client';

interface FilterPanelProps {
  onCategoryChange?: (value: string) => void;
  onLevelChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  category?: string;
  level?: string;
  status?: string;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'programming', label: 'Programming' },
  { value: 'marketing', label: 'Marketing' },
];

const levels = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const statuses = [
  { value: '', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

export function FilterPanel({
  onCategoryChange,
  onLevelChange,
  onStatusChange,
  category = '',
  level = '',
  status = '',
}: FilterPanelProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Category Filter */}
      <select
        value={category}
        onChange={(e) => onCategoryChange?.(e.target.value)}
        className="rounded-lg border border-slate-100 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:bg-slate-50"
      >
        {categories.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Level Filter */}
      <select
        value={level}
        onChange={(e) => onLevelChange?.(e.target.value)}
        className="rounded-lg border border-slate-100 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:bg-slate-50"
      >
        {levels.map((lev) => (
          <option key={lev.value} value={lev.value}>
            {lev.label}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={status}
        onChange={(e) => onStatusChange?.(e.target.value)}
        className="rounded-lg border border-slate-100 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer hover:bg-slate-50"
      >
        {statuses.map((stat) => (
          <option key={stat.value} value={stat.value}>
            {stat.label}
          </option>
        ))}
      </select>
    </div>
  );
}
