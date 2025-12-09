import Link from 'next/link';

interface CourseCardProps {
  id: number | string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  episodes: number;
  students: number;
  badge?: string;
  updated?: string;
}

export function CourseCard({
  id,
  title,
  description,
  category,
  difficulty,
  episodes,
  students,
  badge,
  updated,
}: CourseCardProps) {
  return (
    <Link href={`/admin/courses/${id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-100 to-slate-200" />

      {/* Badge Overlay */}
      {badge && (
        <div className="absolute left-3 top-3 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-medium text-white">
          {badge}
        </div>
      )}

      {/* Content */}
      <div className="space-y-3 p-5">
        {/* Meta Row */}
        {(category || difficulty) && (
          <div className="flex items-center gap-2">
            {category && (
              <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {category}
              </span>
            )}
            {difficulty && (
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                  difficulty === 'Beginner'
                    ? 'bg-green-100 text-green-700'
                    : difficulty === 'Intermediate'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                }`}
              >
                {difficulty}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 text-base font-bold text-slate-900 transition group-hover:text-emerald-600">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="line-clamp-2 text-sm text-slate-600">{description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex gap-4">
            <span>{students} students</span>
          </div>
          {updated && <span>{updated}</span>}
        </div>
      </div>
    </div>
    </Link>
  );
}
