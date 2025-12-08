'use client';

import { Search, Filter } from 'lucide-react';

const courses = [
  {
    id: 1,
    title: 'Advanced React Development',
    instructor: 'John Smith',
    students: 234,
    episodes: 12,
    price: '$99',
  },
  {
    id: 2,
    title: 'UI/UX Design Fundamentals',
    instructor: 'Sarah Chen',
    students: 156,
    episodes: 8,
    price: '$79',
  },
  {
    id: 3,
    title: 'Full Stack Web Development',
    instructor: 'Mike Johnson',
    students: 412,
    episodes: 24,
    price: '$129',
  },
  {
    id: 4,
    title: 'JavaScript Mastery',
    instructor: 'Alex Davis',
    students: 189,
    episodes: 16,
    price: '$89',
  },
];

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-600">Manage all courses and content</p>
        </div>
        <button className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700">
          + Create Course
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full rounded-lg bg-white border border-slate-100 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Filter Button */}
        <button className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
          <Filter className="h-4 w-4" strokeWidth={2} />
          Filter
        </button>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden"
          >
            {/* Thumbnail Placeholder */}
            <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200" />

            {/* Course Content */}
            <div className="p-4">
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-2">
                {course.title}
              </h3>
              <p className="mt-2 text-xs text-slate-500">{course.instructor}</p>

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span>{course.episodes} lessons</span>
                <span>{course.students} students</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
