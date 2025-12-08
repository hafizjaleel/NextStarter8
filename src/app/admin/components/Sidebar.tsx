'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Video,
  Award,
  Settings,
} from 'lucide-react';

const sections = [
  {
    label: 'Core',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        label: 'Courses',
        href: '/admin/courses',
        icon: BookOpen,
      },
      {
        label: 'Webinars',
        href: '/admin/webinars',
        icon: Video,
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        label: 'Users',
        href: '/admin/users',
        icon: Users,
      },
      {
        label: 'Certificates',
        href: '/admin/certificates',
        icon: Award,
      },
    ],
  },
  {
    label: 'Configuration',
    items: [
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: Settings,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-100 rounded-r-2xl bg-white p-4 flex flex-col">
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-bold text-slate-900">LMS Admin</h1>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {section.label}
            </h3>
            <div className="flex flex-col gap-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon strokeWidth={2} className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 pt-4 mt-4">
        <button className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-slate-500 hover:bg-slate-50 transition-all duration-200">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600" />
          <div className="text-left">
            <p className="text-xs font-medium text-slate-900">Admin</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </button>
      </div>
    </aside>
  );
}
