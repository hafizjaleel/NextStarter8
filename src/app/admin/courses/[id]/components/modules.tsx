'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { SidePanel } from '@/components/side-panel';
import { ConfirmDialog } from '@/components/confirm-dialog';

interface Module {
  id: number | string;
  title: string;
  moduleOrder: number;
}

interface CourseModulesProps {
  courseId: string;
}

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

export function CourseModules({ courseId }: CourseModulesProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons] = useState(initialLessons);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: number | string | null }>({
    isOpen: false,
    id: null,
  });
  const [draggedId, setDraggedId] = useState<number | string | null>(null);
  const [dragOverId, setDragOverId] = useState<number | string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    moduleOrder: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch modules on mount
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/course/${courseId}/modules`);
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        const data = await response.json();
        setModules(data.modules || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditModule = (id: string | number) => {
    const moduleToEdit = modules.find((m) => m.id === id);
    if (moduleToEdit) {
      setFormData({ title: moduleToEdit.title, moduleOrder: moduleToEdit.moduleOrder.toString() });
      setEditingId(id);
      setIsPanelOpen(true);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const moduleOrder = parseInt(formData.moduleOrder, 10);
    if (formData.title && !isNaN(moduleOrder) && moduleOrder > 0) {
      try {
        if (editingId !== null) {
          // Update existing module
          const response = await fetch(`/api/v1/course/module/update/${editingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title,
              moduleOrder,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to update module');
          }

          setModules(modules.map((m) => (m.id === editingId ? { ...m, title: formData.title, moduleOrder } : m)));
          setEditingId(null);
        } else {
          // Create new module with reordering if needed
          const response = await fetch('/api/v1/course/module/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: formData.title,
              courseId,
              moduleOrder,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create module');
          }

          const data = await response.json();
          const newModule = data.module || {
            id: Math.max(...modules.map((m) => (typeof m.id === 'number' ? m.id : 0)), 0) + 1,
            title: formData.title,
            moduleOrder,
          };

          // Reorder existing modules if the new order conflicts
          const updatedModules = modules.map((m) =>
            m.moduleOrder >= moduleOrder
              ? { ...m, moduleOrder: m.moduleOrder + 1 }
              : m
          );

          setModules([...updatedModules, newModule]);
        }
        setFormData({ title: '', moduleOrder: '' });
        setIsPanelOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
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
    setDeleteConfirm({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirm.id !== null) {
      try {
        const response = await fetch(`/api/v1/course/module/delete/${deleteConfirm.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete module');
        }

        setModules(modules.filter((m) => m.id !== deleteConfirm.id));
        setDeleteConfirm({ isOpen: false, id: null });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setEditingId(null);
    setFormData({ title: '', moduleOrder: '' });
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

    const draggedIndex = modules.findIndex((m) => m.id === draggedId);
    const targetIndex = modules.findIndex((m) => m.id === targetId);

    const newModules = [...modules];
    const [draggedModule] = newModules.splice(draggedIndex, 1);
    newModules.splice(targetIndex, 0, draggedModule);

    // Update moduleOrder to reflect new positions
    const modulesWithUpdatedOrder = newModules.map((module, index) => ({
      ...module,
      moduleOrder: index + 1,
    }));

    setModules(modulesWithUpdatedOrder);
    setDraggedId(null);
    setDragOverId(null);

    // Send reorder updates to API
    try {
      for (const module of modulesWithUpdatedOrder) {
        await fetch(`/api/v1/course/module/update/${module.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleOrder: module.moduleOrder }),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module order');
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
          <p className="text-slate-600">Loading modules...</p>
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
            const nextOrder = modules.length > 0 ? Math.max(...modules.map((m) => m.moduleOrder)) + 1 : 1;
            setFormData({ title: '', moduleOrder: nextOrder.toString() });
            setIsPanelOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Module
        </button>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={editingId !== null ? 'Edit Module' : 'Add New Module'}
      >
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
          <div>
            <label htmlFor="moduleOrder" className="block text-sm font-medium text-slate-900 mb-1">
              Module Order
            </label>
            <input
              id="moduleOrder"
              name="moduleOrder"
              type="number"
              min="1"
              value={formData.moduleOrder}
              onChange={handleInputChange}
              placeholder="e.g., 1"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              {editingId !== null ? 'Update Module' : 'Add Module'}
            </button>
            <button
              type="button"
              onClick={handleClosePanel}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </SidePanel>

      <div className="space-y-3">
        {[...modules].sort((a, b) => a.moduleOrder - b.moduleOrder).map((module) => {
          const { lessonCount, duration } = getModuleStats(module.title);
          const isDragging = draggedId === module.id;
          const isDropTarget = dragOverId === module.id;

          return (
            <div
              key={module.id}
              draggable
              onDragStart={(e) => handleDragStart(module.id, e)}
              onDragOver={(e) => handleDragOver(module.id, e)}
              onDragLeave={(e) => handleDragLeave(e)}
              onDrop={(e) => handleDrop(module.id, e)}
              onDragEnd={handleDragEnd}
              className={`rounded-xl border bg-white p-6 shadow-sm transition ${
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
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-base font-bold text-slate-900">{module.title}</h4>
                      <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        #{module.moduleOrder}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span>{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</span>
                      <span>{duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditModule(module.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                  >
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

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Module?"
        message="This action cannot be undone. All lessons in this module will remain, but the module will be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, id: null })}
      />
    </div>
  );
}
