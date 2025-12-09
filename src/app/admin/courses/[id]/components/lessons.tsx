'use client';

import { useState, useEffect } from 'react';
import { Video, FileText, Plus, Edit2, Trash2, Lock, HelpCircle, GripVertical, Music, FileCode, Zap } from 'lucide-react';
import { SidePanel } from '@/components/side-panel';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { QuizForm, type QuizData, type Question } from './quiz-form';

interface Module {
  id: number | string;
  title: string;
  moduleOrder: number;
}

interface Lesson {
  id: number | string;
  title: string;
  lessonType: 'video' | 'pdf' | 'audio' | 'file' | 'text' | 'quiz';
  moduleId: number | string;
  lessonOrder: number;
  files?: Array<{ id: string; name: string; url: string }>;
  muxUrl?: string;
  published: boolean;
  quizData?: QuizData;
}

interface CourseLessonsProps {
  courseId: string;
}

export function CourseLessons({ courseId }: CourseLessonsProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | string | null }>({
    isOpen: false,
    id: null,
  });
  const [selectedLessonIds, setSelectedLessonIds] = useState<(number | string)[]>([]);
  const [draggedId, setDraggedId] = useState<number | string | null>(null);
  const [dragOverId, setDragOverId] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    lessonType: 'video' as 'video' | 'pdf' | 'audio' | 'file' | 'text' | 'quiz',
    moduleId: '' as string | number,
    lessonOrder: '',
    muxUrl: '',
    uploadedFiles: [] as Array<{ id: string; name: string }>,
    quizData: {
      questions: [],
      passingScore: 70,
      timeLimit: 0,
      maxAttempts: 0,
    } as QuizData,
  });

  // Fetch modules and lessons on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [modulesRes, lessonsRes] = await Promise.all([
          fetch(`/api/v1/course/${courseId}/modules`),
          fetch(`/api/v1/course/${courseId}/lessons`),
        ]);

        if (!modulesRes.ok || !lessonsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const modulesData = await modulesRes.json();
        const lessonsData = await lessonsRes.json();

        setModules(modulesData.modules || []);
        setLessons(lessonsData.lessons || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    try {
      setUploading(true);
      const formDataToSend = new FormData();
      Array.from(files).forEach((file) => {
        formDataToSend.append('files', file);
      });

      const response = await fetch('/api/v1/app/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const data = await response.json();
      const uploadedFiles = data.files || [];

      setFormData((prev) => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles],
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveUploadedFile = (fileId: string) => {
    setFormData((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((f) => f.id !== fileId),
    }));
  };

  const handleEditLesson = (id: string | number) => {
    const lessonToEdit = lessons.find((l) => l.id === id);
    if (lessonToEdit) {
      setFormData({
        title: lessonToEdit.title,
        lessonType: lessonToEdit.lessonType,
        moduleId: lessonToEdit.moduleId,
        lessonOrder: lessonToEdit.lessonOrder.toString(),
        muxUrl: lessonToEdit.muxUrl || '',
        uploadedFiles: lessonToEdit.files || [],
        quizData: lessonToEdit.quizData || {
          questions: [],
          passingScore: 70,
          timeLimit: 0,
          maxAttempts: 0,
        },
      });
      setEditingId(id);
      setIsPanelOpen(true);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();

    const lessonOrder = parseInt(formData.lessonOrder, 10);

    const hasValidContent =
      (formData.lessonType === 'video' && formData.muxUrl) ||
      (formData.lessonType === 'pdf' && formData.uploadedFiles.length > 0) ||
      (formData.lessonType === 'audio' && formData.uploadedFiles.length > 0) ||
      (formData.lessonType === 'file' && formData.uploadedFiles.length > 0) ||
      (formData.lessonType === 'text' && formData.title) ||
      (formData.lessonType === 'quiz' && formData.quizData.questions.length > 0);

    if (
      formData.title &&
      formData.moduleId &&
      !isNaN(lessonOrder) &&
      lessonOrder > 0 &&
      hasValidContent
    ) {
      try {
        const payload: any = {
          title: formData.title,
          moduleId: formData.moduleId,
          lessonType: formData.lessonType,
          lessonOrder,
          fileIds: formData.uploadedFiles.map((f) => f.id),
        };

        if (formData.lessonType === 'video') {
          payload.muxUrl = formData.muxUrl;
        }

        if (formData.lessonType === 'quiz') {
          payload.quizData = formData.quizData;
        }

        if (editingId !== null) {
          // Update existing lesson
          const response = await fetch(`/api/v1/course/module/lesson/update/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error('Failed to update lesson');
          }

          setLessons(
            lessons.map((l) =>
              l.id === editingId
                ? {
                    ...l,
                    title: formData.title,
                    lessonType: formData.lessonType,
                    moduleId: formData.moduleId,
                    lessonOrder,
                    files: formData.uploadedFiles,
                    muxUrl: formData.lessonType === 'video' ? formData.muxUrl : undefined,
                    ...(formData.lessonType === 'quiz' && { quizData: formData.quizData }),
                  }
                : l,
            ),
          );
          setEditingId(null);
        } else {
          // Create new lesson
          const response = await fetch('/api/v1/course/lesson/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...payload,
              courseId,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create lesson');
          }

          const data = await response.json();
          const newLesson = data.lesson || {
            id: Math.max(
              ...lessons.map((l) => (typeof l.id === 'number' ? l.id : 0)),
              0,
            ) + 1,
            title: formData.title,
            lessonType: formData.lessonType,
            moduleId: formData.moduleId,
            lessonOrder,
            files: formData.uploadedFiles,
            muxUrl: formData.lessonType === 'video' ? formData.muxUrl : undefined,
            published: false,
            ...(formData.lessonType === 'quiz' && { quizData: formData.quizData }),
          };

          // Reorder existing lessons if needed
          const updatedLessons = lessons
            .filter((l) => l.moduleId === formData.moduleId)
            .map((l) =>
              l.lessonOrder >= lessonOrder
                ? { ...l, lessonOrder: l.lessonOrder + 1 }
                : l,
            )
            .concat(
              lessons.filter((l) => l.moduleId !== formData.moduleId),
            );

          setLessons([...updatedLessons, newLesson]);
        }

        setFormData({
          title: '',
          lessonType: 'video',
          moduleId: modules.length > 0 ? modules[0].id : '',
          lessonOrder: '',
          muxUrl: '',
          uploadedFiles: [],
          quizData: {
            questions: [],
            passingScore: 70,
            timeLimit: 0,
            maxAttempts: 0,
          },
        });
        setIsPanelOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  const handleDeleteLesson = (id: string | number) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id !== null) {
      try {
        const response = await fetch(`/api/v1/course/module/lesson/delete/${deleteConfirm.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete lesson');
        }

        setLessons(lessons.filter((l) => l.id !== deleteConfirm.id));
        setDeleteConfirm({ isOpen: false, id: null });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  const handleToggleStatus = async (id: string | number) => {
    const lesson = lessons.find((l) => l.id === id);
    if (!lesson) return;

    try {
      const response = await fetch(`/api/v1/course/module/lesson/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !lesson.published }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lesson');
      }

      setLessons(
        lessons.map((l) =>
          l.id === id ? { ...l, published: !l.published } : l,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSelectLesson = (id: string | number) => {
    setSelectedLessonIds((prev) =>
      prev.includes(id) ? prev.filter((lid) => lid !== id) : [...prev, id],
    );
  };

  const handleSelectAllInModule = (moduleId: string | number) => {
    const moduleLessonIds = lessons
      .filter((l) => l.moduleId === moduleId)
      .map((l) => l.id);
    const allSelected = moduleLessonIds.every((id) => selectedLessonIds.includes(id));

    if (allSelected) {
      setSelectedLessonIds((prev) =>
        prev.filter((id) => !moduleLessonIds.includes(id)),
      );
    } else {
      setSelectedLessonIds((prev) => [
        ...prev,
        ...moduleLessonIds.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleBulkStatusChange = async (status: boolean) => {
    try {
      await Promise.all(
        selectedLessonIds.map((id) =>
          fetch(`/api/v1/course/module/lesson/update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ published: status }),
          }),
        ),
      );

      setLessons(
        lessons.map((lesson) =>
          selectedLessonIds.includes(lesson.id)
            ? { ...lesson, published: status }
            : lesson,
        ),
      );
      setSelectedLessonIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const groupedLessons = modules.reduce(
    (acc, module) => {
      acc[module.id] = lessons
        .filter((l) => l.moduleId === module.id)
        .sort((a, b) => a.lessonOrder - b.lessonOrder);
      return acc;
    },
    {} as Record<string | number, Lesson[]>,
  );

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setEditingId(null);
    const defaultModuleId = modules.length > 0 ? modules[0].id : '';
    setFormData({
      title: '',
      lessonType: 'video',
      moduleId: defaultModuleId,
      lessonOrder: '',
      muxUrl: '',
      uploadedFiles: [],
      quizData: {
        questions: [],
        passingScore: 70,
        timeLimit: 0,
        maxAttempts: 0,
      },
    });
  };

  const handleDragStart = (id: string | number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleDragOver = (id: string | number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverId(null);
  };

  const handleDrop = async (targetId: string | number, e: React.DragEvent) => {
    e.preventDefault();

    if (draggedId === null || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const draggedLesson = lessons.find((l) => l.id === draggedId);
    const targetLesson = lessons.find((l) => l.id === targetId);

    if (!draggedLesson || !targetLesson) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    // Only allow reordering within the same module
    if (draggedLesson.moduleId !== targetLesson.moduleId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const moduleLessons = lessons.filter((l) => l.moduleId === draggedLesson.moduleId);
    const draggedIndex = moduleLessons.findIndex((l) => l.id === draggedId);
    const targetIndex = moduleLessons.findIndex((l) => l.id === targetId);

    const newModuleLessons = [...moduleLessons];
    const [movedLesson] = newModuleLessons.splice(draggedIndex, 1);
    newModuleLessons.splice(targetIndex, 0, movedLesson);

    // Update lessonOrder for affected lessons
    const updatedModuleLessons = newModuleLessons.map((lesson, index) => ({
      ...lesson,
      lessonOrder: index + 1,
    }));

    // Replace in main lessons array
    const newLessons = lessons.map((l) => {
      const updated = updatedModuleLessons.find((ul) => ul.id === l.id);
      return updated || l;
    });

    setLessons(newLessons);
    setDraggedId(null);
    setDragOverId(null);

    // Send reorder updates to API
    try {
      for (const lesson of updatedModuleLessons) {
        await fetch(`/api/v1/course/module/lesson/update/${lesson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonOrder: lesson.lessonOrder }),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lesson order');
    }
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-slate-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingId(null);
            const defaultModuleId = modules.length > 0 ? modules[0].id : '';
            const nextOrder = lessons.filter((l) => l.moduleId === defaultModuleId).length + 1;
            setFormData({
              title: '',
              lessonType: 'video',
              moduleId: defaultModuleId,
              lessonOrder: nextOrder.toString(),
              muxUrl: '',
              uploadedFiles: [],
              quizData: {
                questions: [],
                passingScore: 70,
                timeLimit: 0,
                maxAttempts: 0,
              },
            });
            setIsPanelOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Lesson
        </button>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={editingId !== null ? 'Edit Lesson' : 'Add New Lesson'}
      >
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
            <label htmlFor="moduleId" className="block text-sm font-medium text-slate-900 mb-1">
              Module
            </label>
            <select
              id="moduleId"
              name="moduleId"
              value={formData.moduleId}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              required
            >
              <option value="">Select a module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lessonType" className="block text-sm font-medium text-slate-900 mb-1">
                Lesson Type
              </label>
              <select
                id="lessonType"
                name="lessonType"
                value={formData.lessonType}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="video">Video</option>
                <option value="pdf">PDF</option>
                <option value="audio">Audio</option>
                <option value="file">File</option>
                <option value="text">Text</option>
                <option value="quiz">Quiz</option>
              </select>
            </div>
            <div>
              <label htmlFor="lessonOrder" className="block text-sm font-medium text-slate-900 mb-1">
                Lesson Order
              </label>
              <input
                id="lessonOrder"
                name="lessonOrder"
                type="number"
                min="1"
                value={formData.lessonOrder}
                onChange={handleInputChange}
                placeholder="e.g., 1"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {formData.lessonType === 'video' && (
            <div>
              <label htmlFor="muxUrl" className="block text-sm font-medium text-slate-900 mb-1">
                Mux Video URL or Asset ID
              </label>
              <input
                id="muxUrl"
                name="muxUrl"
                type="text"
                value={formData.muxUrl}
                onChange={handleInputChange}
                placeholder="e.g., https://image.mux.com/... or asset ID"
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          )}

          {(formData.lessonType === 'pdf' || formData.lessonType === 'audio' || formData.lessonType === 'file') && (
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-slate-900 mb-1">
                Upload {formData.lessonType === 'pdf' ? 'PDF' : formData.lessonType === 'audio' ? 'Audio' : 'File'}
              </label>
              <div className="relative">
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer file:mr-4 file:bg-emerald-50 file:border-0 file:px-3 file:py-1.5 file:rounded-md file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100 disabled:opacity-50"
                />
              </div>
              {uploading && <p className="mt-2 text-xs text-slate-600">Uploading files...</p>}
              {formData.uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-slate-600">Uploaded files:</p>
                  {formData.uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
                      <span className="text-xs text-slate-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedFile(file.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {formData.lessonType === 'quiz' && (
            <QuizForm
              quizData={formData.quizData}
              onQuizDataChange={(quizData) =>
                setFormData((prev) => ({ ...prev, quizData }))
              }
            />
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {editingId !== null ? 'Update Lesson' : 'Add Lesson'}
            </button>
            <button
              type="button"
              onClick={handleClosePanel}
              disabled={uploading}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </SidePanel>

      {selectedLessonIds.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-emerald-900">
            {selectedLessonIds.length} lesson{selectedLessonIds.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkStatusChange(true)}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
            >
              Publish All
            </button>
            <button
              onClick={() => handleBulkStatusChange(false)}
              className="rounded-lg border border-emerald-600 bg-white px-3 py-1.5 text-xs font-medium text-emerald-600 transition hover:bg-emerald-50"
            >
              Unpublish All
            </button>
            <button
              onClick={() => setSelectedLessonIds([])}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {modules.length === 0 ? (
          <p className="text-sm text-slate-500">No modules yet. Create modules first to add lessons.</p>
        ) : (
          Object.entries(groupedLessons).map(([moduleId, moduleLessons]) => {
            const module = modules.find((m) => m.id === moduleId);
            const moduleIds = moduleLessons.map((l) => l.id);
            const allModuleSelected = moduleIds.length > 0 && moduleIds.every((id) => selectedLessonIds.includes(id));

            return (
              <div key={moduleId}>
                <div className="mb-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={allModuleSelected}
                    onChange={() => handleSelectAllInModule(moduleId)}
                    className="h-4 w-4 rounded border-slate-300 bg-slate-50 text-emerald-600 transition cursor-pointer"
                  />
                  <h3 className="text-base font-bold text-slate-900">{module?.title || 'Unknown Module'}</h3>
                </div>
                {moduleLessons.length > 0 ? (
                  <div className="space-y-3">
                    {moduleLessons.map((lesson) => {
                      const isDragging = draggedId === lesson.id;
                      const isDropTarget = dragOverId === lesson.id;

                      const getTypeIcon = (type: string) => {
                        switch (type) {
                          case 'video':
                            return <Video className="h-5 w-5 text-blue-600 flex-shrink-0" strokeWidth={2} />;
                          case 'pdf':
                            return <FileText className="h-5 w-5 text-orange-600 flex-shrink-0" strokeWidth={2} />;
                          case 'audio':
                            return <Music className="h-5 w-5 text-rose-600 flex-shrink-0" strokeWidth={2} />;
                          case 'file':
                            return <FileCode className="h-5 w-5 text-purple-600 flex-shrink-0" strokeWidth={2} />;
                          case 'text':
                            return <FileText className="h-5 w-5 text-slate-600 flex-shrink-0" strokeWidth={2} />;
                          case 'quiz':
                            return <HelpCircle className="h-5 w-5 text-purple-600 flex-shrink-0" strokeWidth={2} />;
                          default:
                            return <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" strokeWidth={2} />;
                        }
                      };

                      return (
                        <div
                          key={lesson.id}
                          draggable
                          onDragStart={(e) => handleDragStart(lesson.id, e)}
                          onDragOver={(e) => handleDragOver(lesson.id, e)}
                          onDragLeave={(e) => handleDragLeave(e)}
                          onDrop={(e) => handleDrop(lesson.id, e)}
                          onDragEnd={handleDragEnd}
                          className={`rounded-xl border bg-white p-4 shadow-sm transition ${
                            isDragging
                              ? 'opacity-50 border-slate-200'
                              : isDropTarget
                                ? 'border-emerald-300 bg-emerald-50 shadow-md'
                                : 'border-slate-100 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <GripVertical className="h-5 w-5 text-slate-400 flex-shrink-0 cursor-grab active:cursor-grabbing" strokeWidth={2} />
                              <input
                                type="checkbox"
                                checked={selectedLessonIds.includes(lesson.id)}
                                onChange={() => handleSelectLesson(lesson.id)}
                                className="h-4 w-4 rounded border-slate-300 bg-slate-50 text-emerald-600 transition cursor-pointer"
                              />
                              {getTypeIcon(lesson.lessonType)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-sm font-bold text-slate-900">{lesson.title}</h4>
                                  <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                    #{lesson.lessonOrder}
                                  </span>
                                  <span className="inline-block rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 capitalize">
                                    {lesson.lessonType}
                                  </span>
                                  {!lesson.published && (
                                    <Lock className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                                  )}
                                </div>
                                {lesson.files && lesson.files.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {lesson.files.map((file) => (
                                      <span key={file.id} className="inline-block rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">
                                        📎 {file.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {lesson.lessonType === 'quiz' && lesson.quizData && (
                                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                                    <span>{lesson.quizData.questions.length} questions</span>
                                    <span>•</span>
                                    <span>{lesson.quizData.passingScore}% to pass</span>
                                    {lesson.quizData.timeLimit > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>{lesson.quizData.timeLimit}m limit</span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={() => handleToggleStatus(lesson.id)}
                                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                                  lesson.published
                                    ? 'bg-emerald-600'
                                    : 'bg-slate-200'
                                }`}
                                aria-label={`Toggle status for ${lesson.title}`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                    lesson.published ? 'translate-x-5' : 'translate-x-0.5'
                                  }`}
                                />
                              </button>
                              <span className="text-xs text-slate-500">{lesson.published ? 'Published' : 'Draft'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditLesson(lesson.id)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                              >
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
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No lessons in this module yet</p>
                )}
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Lesson?"
        message="This action cannot be undone. The lesson and all its content will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  );
}
