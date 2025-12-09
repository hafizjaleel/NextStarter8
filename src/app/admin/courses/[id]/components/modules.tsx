'use client';

import { useState } from 'react';
import { ChevronRight, Plus, Edit2, Trash2, X } from 'lucide-react';

const initialModules = [
  {
    id: 1,
    title: 'Getting Started with React',
  },
  {
    id: 2,
    title: 'React Hooks Deep Dive',
  },
  {
    id: 3,
    title: 'State Management',
  },
];

const initialLessons = [
  { id: 1, title: 'Introduction to React', duration: '15m', module: 'Getting Started with React' },
  { id: 2, title: 'Setting Up Your Environment', duration: '20m', module: 'Getting Started with React' },
  { id: 3, title: 'React Basics Quiz', duration: '10m', module: 'Getting Started with React' },
  { id: 4, title: 'useState Hook Tutorial', duration: '25m', module: 'React Hooks Deep Dive' },
  { id: 5, title: 'useEffect Deep Dive', duration: '30m', module: 'React Hooks Deep Dive' },
  { id: 6, title: 'useContext Hook', duration: '20m', module: 'React Hooks Deep Dive' },
  { id: 7, title: 'useReducer Advanced', duration: '25m', module: 'React Hooks Deep Dive' },
  { id: 8, title: 'Custom Hooks', duration: '28m', module: 'React Hooks Deep Dive' },
];

const parseDuration = (duration: string): number => {
  const timeRegex = /(\d+)([hm])/g;
  let minutes = 0;
  let match;

  while ((match = timeRegex.exec(duration)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];
    if (unit === 'h') {
      minutes += value * 60;
    } else if (unit === 'm') {
      minutes += value;
    }
  }

  return minutes;
};

const formatDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
};

export function CourseModules() {
  const [modules, setModules] = useState(initialModules);
  const [lessons] = useState(initialLessons);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title) {
      const newModule = {
        id: Math.max(...modules.map((m) => m.id), 0) + 1,
        title: formData.title,
      };
      setModules([...modules, newModule]);
      setFormData({ title: '' });
      setShowForm(false);
    }
  };

  const getModuleStats = (moduleName: string) => {
    const moduleLessons = lessons.filter((l) => l.module === moduleName);
    const lessonCount = moduleLessons.length;
    const totalMinutes = moduleLessons.reduce((sum, lesson) => {
      return sum + parseDuration(lesson.duration);
    }, 0);
    const duration = formatDuration(totalMinutes);

    return { lessonCount, duration };
  };

  const handleDeleteModule = (id: number) => {
    setModules(modules.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Module
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Add New Module</h3>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <form onSubmit={handleAddModule} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-900 mb-1">
                Module Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Getting Started with React"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Add Module
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {modules.map((module) => {
          const { lessonCount, duration } = getModuleStats(module.title);
          return (
            <div
              key={module.id}
              className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-bold text-slate-900">{module.title}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <span>{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</span>
                    <span>{duration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                    <Edit2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                  </button>
                  <ChevronRight className="h-5 w-5 text-slate-400" strokeWidth={2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
