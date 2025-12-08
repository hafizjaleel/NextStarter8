'use client';

import { useState } from 'react';
import { CourseCard } from './components/course-card';
import { SearchInput } from '@/components/search-input';
import { FilterPanel } from '@/components/filter-panel';
import { Pagination, PaginationPrevious, PaginationNext } from '@/components/pagination';

const courses = [
  {
    id: 1,
    title: 'Advanced React Development',
    description: 'Master React hooks, state management, and performance optimization',
    category: 'Development',
    difficulty: 'Advanced' as const,
    students: 234,
    episodes: 12,
    badge: '12 lessons',
    updated: 'Updated 2 days ago',
  },
  {
    id: 2,
    title: 'UI/UX Design Fundamentals',
    description: 'Learn modern design principles and tools for creating stunning interfaces',
    category: 'Design',
    difficulty: 'Beginner' as const,
    students: 156,
    episodes: 8,
    badge: '8 lessons',
    updated: 'Updated 1 week ago',
  },
  {
    id: 3,
    title: 'Full Stack Web Development',
    description: 'Complete guide to building production-ready web applications',
    category: 'Development',
    difficulty: 'Advanced' as const,
    students: 412,
    episodes: 24,
    badge: '24 lessons',
    updated: 'Updated 3 days ago',
  },
  {
    id: 4,
    title: 'JavaScript Mastery',
    description: 'Deep dive into JavaScript fundamentals and advanced patterns',
    category: 'Programming',
    difficulty: 'Intermediate' as const,
    students: 189,
    episodes: 16,
    badge: '16 lessons',
    updated: 'Updated 5 days ago',
  },
];

const ITEMS_PER_PAGE = 8;

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCourses = courses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
      <div className="space-y-4">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search courses..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <FilterPanel
          category={category}
          level={level}
          status={status}
          onCategoryChange={setCategory}
          onLevelChange={setLevel}
          onStatusChange={setStatus}
        />
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            title={course.title}
            description={course.description}
            category={course.category}
            difficulty={course.difficulty}
            episodes={course.episodes}
            students={course.students}
            badge={course.badge}
            updated={course.updated}
          />
        ))}
      </div>
    </div>
  );
}
