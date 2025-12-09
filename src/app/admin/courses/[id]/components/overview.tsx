'use client';

import { useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';

interface Mentor {
  id: number | string;
  name: string;
  avatar?: string;
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  category?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  status: 'draft' | 'published' | 'on_hold';
  thumbnail?: string;
  isFree: boolean;
  price?: number;
  mentors?: Mentor[];
  modulesCount?: number;
  lessonsCount?: number;
}

interface CourseOverviewProps {
  courseId: string;
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

const languageNames: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  zh: 'Chinese',
  ja: 'Japanese',
  pt: 'Portuguese',
  ru: 'Russian',
};

export function CourseOverview({ courseId }: CourseOverviewProps) {
  const [course, setCourse] = useState<CourseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/v1/course/admin/${courseId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch course');
        }

        const data = await response.json();
        setCourse(data.data || data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 animate-spin text-emerald-600" strokeWidth={2} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
        <div>
          <h3 className="text-sm font-semibold text-red-900">Failed to load course</h3>
          <p className="text-sm text-red-700 mt-1">{error || 'Course not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Thumbnail & Header Card */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden relative">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <svg
                className="h-16 w-16 text-slate-300"
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
          )}
        </div>

        {/* Header Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">{course.title}</h2>

            {/* Badges Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Badge */}
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusConfig[course.status].bg} ${statusConfig[course.status].text}`}
              >
                {statusConfig[course.status].label}
              </span>

              {/* Level Badge */}
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${levelConfig[course.level].bg} ${levelConfig[course.level].text}`}
              >
                {levelConfig[course.level].label}
              </span>

              {/* Category Badge */}
              {course.category && (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {course.category}
                </span>
              )}

              {/* Language Badge */}
              {course.language && (
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {languageNames[course.language] || course.language}
                </span>
              )}

              {/* Price Badge */}
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                {course.isFree ? 'Free' : `$${course.price?.toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Mentors */}
          {course.mentors && course.mentors.length > 0 && (
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                Instructors ({course.mentors.length})
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {course.mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5"
                  >
                    <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700 flex-shrink-0">
                      {mentor.avatar ? (
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        mentor.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-900">{mentor.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Basic Information */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            {course.category && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Category</p>
                <p className="text-sm font-medium text-slate-900 mt-1">{course.category}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Level</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {levelConfig[course.level].label}
              </p>
            </div>
            {course.language && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Language</p>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {languageNames[course.language] || course.language}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Price</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {course.isFree ? 'Free' : `$${course.price?.toFixed(2)}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
              <p className="text-sm font-medium text-slate-900 mt-1">
                {statusConfig[course.status].label}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Course Statistics */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Course Content</h3>
          <div className="space-y-4">
            {course.modulesCount !== undefined && (
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <p className="text-sm text-slate-600">Total Modules</p>
                <p className="text-2xl font-bold text-emerald-600">{course.modulesCount}</p>
              </div>
            )}
            {course.lessonsCount !== undefined && (
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <p className="text-sm text-slate-600">Total Lessons</p>
                <p className="text-2xl font-bold text-emerald-600">{course.lessonsCount}</p>
              </div>
            )}
            {!course.modulesCount && !course.lessonsCount && (
              <p className="text-sm text-slate-500">No content data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {course.description && (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Course Description</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {course.description}
          </p>
        </div>
      )}
    </div>
  );
}
