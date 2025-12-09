'use client';

import { useState } from 'react';
import { Video, FileText, Plus, Edit2, Trash2, Lock, X } from 'lucide-react';

const initialLessons = [
  {
    id: 1,
    title: 'Introduction to React',
    type: 'video',
    duration: '15m',
    module: 'Getting Started with React',
    published: true,
  },
  {
    id: 2,
    title: 'Setting Up Your Environment',
    type: 'video',
    duration: '20m',
    module: 'Getting Started with React',
    published: true,
  },
  {
    id: 3,
    title: 'React Basics Quiz',
    type: 'document',
    duration: '10m',
    module: 'Getting Started with React',
    published: false,
  },
  {
    id: 4,
    title: 'useState Hook Tutorial',
    type: 'video',
    duration: '25m',
    module: 'React Hooks Deep Dive',
    published: true,
  },
];

const modules = [
  'Getting Started with React',
  'React Hooks Deep Dive',
  'State Management',
];

export function CourseLessons() {
  const [lessons, setLessons] = useState(initialLessons);
  const [showForm, setShowForm] = useState(false);
  const [selectedLessonIds, setSelectedLessonIds] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    type: 'video',
    duration: '',
    module: modules[0],
    muxVideo: '',
    pdfFile: null as File | null,
    downloadableFile: null as File | null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();

    const hasValidContent =
      (formData.type === 'video' && formData.muxVideo) ||
      (formData.type === 'pdf' && formData.pdfFile) ||
      (formData.type === 'downloadable' && formData.downloadableFile);

    if (formData.title && formData.duration && formData.module && hasValidContent) {
      const newLesson = {
        id: Math.max(...lessons.map((l) => l.id), 0) + 1,
        title: formData.title,
        type: formData.type as 'video' | 'pdf' | 'downloadable',
        duration: formData.duration,
        module: formData.module,
        published: false,
      };
      setLessons([...lessons, newLesson]);
      setFormData({
        title: '',
        type: 'video',
        duration: '',
        module: modules[0],
        muxVideo: '',
        pdfFile: null,
        downloadableFile: null,
      });
      setShowForm(false);
    }
  };

  const handleDeleteLesson = (id: number) => {
    setLessons(lessons.filter((l) => l.id !== id));
  };

  const handleToggleStatus = (id: number) => {
    setLessons(
      lessons.map((lesson) =>
        lesson.id === id ? { ...lesson, published: !lesson.published } : lesson,
      ),
    );
  };

  const handleSelectLesson = (id: number) => {
    setSelectedLessonIds((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id],
    );
  };

  const handleSelectAllInModule = (moduleName: string) => {
    const moduleIds = lessons
      .filter((l) => l.module === moduleName)
      .map((l) => l.id);
    const allSelected = moduleIds.every((id) => selectedLessonIds.includes(id));

    if (allSelected) {
      setSelectedLessonIds((prev) =>
        prev.filter((id) => !moduleIds.includes(id)),
      );
    } else {
      setSelectedLessonIds((prev) => [...prev, ...moduleIds.filter((id) => !prev.includes(id))]);
    }
  };

  const handleBulkStatusChange = (status: boolean) => {
    setLessons(
      lessons.map((lesson) =>
        selectedLessonIds.includes(lesson.id)
          ? { ...lesson, published: status }
          : lesson,
      ),
    );
    setSelectedLessonIds([]);
  };

  const groupedLessons = modules.reduce(
    (acc, module) => {
      acc[module] = lessons.filter((l) => l.module === module);
      return acc;
    },
    {} as Record<string, typeof lessons>,
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Lesson
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Add New Lesson</h3>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
          <form onSubmit={handleAddLesson} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-900 mb-1">
                Lesson Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Introduction to React"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label htmlFor="module" className="block text-sm font-medium text-slate-900 mb-1">
                Module
              </label>
              <select
                id="module"
                name="module"
                value={formData.module}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                required
              >
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-slate-900 mb-1">
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="downloadable">Downloadable Content</option>
                </select>
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-slate-900 mb-1">
                  Duration
                </label>
                <input
                  id="duration"
                  name="duration"
                  type="text"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 15m"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {formData.type === 'video' && (
              <div>
                <label htmlFor="muxVideo" className="block text-sm font-medium text-slate-900 mb-1">
                  Mux Video URL or Asset ID
                </label>
                <input
                  id="muxVideo"
                  name="muxVideo"
                  type="text"
                  value={formData.muxVideo}
                  onChange={handleInputChange}
                  placeholder="e.g., https://image.mux.com/... or asset ID"
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            )}

            {formData.type === 'pdf' && (
              <div>
                <label htmlFor="pdfFile" className="block text-sm font-medium text-slate-900 mb-1">
                  PDF File Upload
                </label>
                <div className="relative">
                  <input
                    id="pdfFile"
                    name="pdfFile"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer file:mr-4 file:bg-emerald-50 file:border-0 file:px-3 file:py-1.5 file:rounded-md file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                    required
                  />
                </div>
                {formData.pdfFile && (
                  <p className="mt-2 text-xs text-slate-600">Selected: {formData.pdfFile.name}</p>
                )}
              </div>
            )}

            {formData.type === 'downloadable' && (
              <div>
                <label htmlFor="downloadableFile" className="block text-sm font-medium text-slate-900 mb-1">
                  Downloadable File Upload
                </label>
                <div className="relative">
                  <input
                    id="downloadableFile"
                    name="downloadableFile"
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer file:mr-4 file:bg-emerald-50 file:border-0 file:px-3 file:py-1.5 file:rounded-md file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                    required
                  />
                </div>
                {formData.downloadableFile && (
                  <p className="mt-2 text-xs text-slate-600">Selected: {formData.downloadableFile.name}</p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
              >
                Add Lesson
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

      <div className="space-y-6">
        {Object.entries(groupedLessons).map(([moduleName, moduleLessons]) => (
          <div key={moduleName}>
            <h3 className="mb-3 text-base font-bold text-slate-900">{moduleName}</h3>
            {moduleLessons.length > 0 ? (
              <div className="space-y-3">
                {moduleLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {lesson.type === 'video' ? (
                          <Video className="h-5 w-5 text-blue-600 flex-shrink-0" strokeWidth={2} />
                        ) : lesson.type === 'pdf' ? (
                          <FileText className="h-5 w-5 text-orange-600 flex-shrink-0" strokeWidth={2} />
                        ) : (
                          <FileText className="h-5 w-5 text-purple-600 flex-shrink-0" strokeWidth={2} />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{lesson.title}</h4>
                            {!lesson.published && (
                              <Lock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            lesson.published
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {lesson.published ? 'Published' : 'Draft'}
                        </span>
                        <button className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                          <Edit2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No lessons in this module yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
