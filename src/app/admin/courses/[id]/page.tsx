'use client';

import { Tabs } from '@/components/tabs';
import { CourseOverview } from './components/overview';
import { CourseModules } from './components/modules';
import { CourseLessons } from './components/lessons';
import { CourseAnalytics } from './components/analytics';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // In a real app, fetch course data based on id
  const course = {
    id,
    title: 'Advanced React Development',
    instructor: 'John Smith',
  };

  const tabs = [
    {
      label: 'Overview',
      value: 'overview',
      content: <CourseOverview courseId={id} />,
    },
    {
      label: 'Modules',
      value: 'modules',
      content: <CourseModules />,
    },
    {
      label: 'Lessons',
      value: 'lessons',
      content: <CourseLessons />,
    },
    {
      label: 'Analytics',
      value: 'analytics',
      content: <CourseAnalytics />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition mb-4"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Courses
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
        <p className="mt-1 text-sm text-slate-600">Taught by {course.instructor}</p>
      </div>

      {/* Tabs */}
      <Tabs items={tabs} defaultValue="overview" />
    </div>
  );
}
