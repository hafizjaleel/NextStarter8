'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CourseCard } from './components/course-card';
import { SearchInput } from '@/components/search-input';
import { FilterPanel } from '@/components/filter-panel';
import { Pagination, PaginationPrevious, PaginationNext } from '@/components/pagination';
import { Loader } from 'lucide-react';

interface Mentor {
  id: number | string;
  name: string;
  avatar?: string;
}

interface Course {
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

interface PaginationMeta {
  page: number;
  total: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ApiResponse {
  data: Course[];
  pagination: PaginationMeta;
}

const ITEMS_PER_PAGE = 8;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    total: 0,
    limit: ITEMS_PER_PAGE,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('');
  const [status, setStatus] = useState('');
  const [isFree, setIsFree] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', ITEMS_PER_PAGE.toString());

      if (search) params.set('search', search);
      if (level) params.set('level', level);
      if (status) params.set('status', status);
      if (isFree === 'free') params.set('isFree', 'true');
      if (isFree === 'paid') params.set('isFree', 'false');

      const response = await fetch(`/api/v1/course/admin/list?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data: ApiResponse = await response.json();
      setCourses(data.data);
      setPagination(data.pagination);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses when filters or page changes
  useEffect(() => {
    fetchCourses(1);
  }, [search, level, status, isFree]);

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      fetchCourses(pagination.page + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      fetchCourses(pagination.page - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-600">Manage all courses and content</p>
        </div>
        <Link
          href="/admin/courses/create"
          className="inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          + Create Course
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex-1">
          <SearchInput
            placeholder="Search courses..."
            value={search}
            onChange={setSearch}
          />
        </div>

        <FilterPanel
          level={level}
          status={status}
          isFree={isFree}
          onLevelChange={setLevel}
          onStatusChange={setStatus}
          onIsFreeChange={setIsFree}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-emerald-600" strokeWidth={2} />
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && courses.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description}
              level={course.level}
              thumbnail={course.thumbnail}
              status={course.status}
              isFree={course.isFree}
              price={course.price}
              mentors={course.mentors}
              lessonCount={course.lessonCount}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && courses.length === 0 && !error && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12 text-center">
          <p className="text-sm text-slate-600">No courses found. Try adjusting your filters or search.</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && courses.length > 0 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-6">
          <p className="text-sm text-slate-600">
            Showing page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)} ({pagination.total} total courses)
          </p>
          <Pagination>
            <PaginationPrevious
              onClick={handlePrevPage}
              disabled={!pagination.hasPrevPage}
            />
            <PaginationNext
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
}
