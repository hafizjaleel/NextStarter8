import Link from 'next/link';

interface Mentor {
  id: number | string;
  name: string;
  avatar?: string;
}

interface CourseCardProps {
  id: number | string;
  title: string;
  description?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail?: string;
  status: 'draft' | 'published' | 'on_hold';
  isFree: boolean;
  price?: number;
  mentors?: Mentor[];
  lessonCount?: number;
}

const levelConfig = {
  beginner: { label: 'Beginner', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  intermediate: { label: 'Intermediate', bg: 'bg-blue-100', text: 'text-blue-700' },
  advanced: { label: 'Advanced', bg: 'bg-orange-100', text: 'text-orange-700' },
};

const statusConfig = {
  draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700' },
  published: { label: 'Published', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  on_hold: { label: 'On Hold', bg: 'bg-amber-100', text: 'text-amber-700' },
};

export function CourseCard({
  id,
  title,
  description,
  level,
  thumbnail,
  status,
  isFree,
  price,
  mentors = [],
  lessonCount,
}: CourseCardProps) {
  const displayMentors = mentors.slice(0, 3);
  const extraMentorsCount = Math.max(0, mentors.length - 3);
  
  return (
    <Link href={`/admin/courses/${id}`}>
      <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Thumbnail */}
        <div className="aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 relative">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="text-center">
                <svg
                  className="h-12 w-12 text-slate-300 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Lesson Count Badge */}
          {lessonCount !== undefined && (
            <div className="absolute left-3 top-3 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-medium text-white">
              {lessonCount} lesson{lessonCount !== 1 ? 's' : ''}
            </div>
          )}

          {/* Status Badge */}
          <div className={`absolute right-3 top-3 rounded-md px-2 py-1 text-xs font-medium ${statusConfig[status].bg} ${statusConfig[status].text}`}>
            {statusConfig[status].label}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 p-5">
          {/* Meta Row - Level and Price */}
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${levelConfig[level].bg} ${levelConfig[level].text}`}>
              {levelConfig[level].label}
            </span>
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {isFree ? 'Free' : `$${price?.toFixed(2)}`}
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-base font-bold text-slate-900 transition group-hover:text-emerald-600">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="line-clamp-2 text-sm text-slate-600">{description}</p>
          )}

          {/* Mentors */}
          {mentors.length > 0 && (
            <div className="flex items-center gap-1">
              {displayMentors.map((mentor, idx) => (
                <div
                  key={mentor.id}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 relative"
                  title={mentor.name}
                  style={{
                    marginLeft: idx > 0 ? '-0.5rem' : '0',
                    zIndex: displayMentors.length - idx,
                  }}
                >
                  {mentor.avatar ? (
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{mentor.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              ))}
              {extraMentorsCount > 0 && (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                  +{extraMentorsCount}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          {mentors.length > 0 && (
            <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
              <p>By: {mentors.map((m) => m.name).join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
