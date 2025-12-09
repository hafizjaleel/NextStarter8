'use client';

import { useState } from 'react';
import { Edit2, Save, X } from 'lucide-react';

export function CourseOverview() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Advanced React Development',
    instructor: 'John Smith',
    category: 'Development',
    level: 'Advanced',
    price: '$99.99',
    description: 'Master React hooks, state management, and performance optimization. This comprehensive course covers everything you need to become a professional React developer. Learn best practices, design patterns, and real-world applications. From beginner fundamentals to advanced techniques, you\'ll gain hands-on experience through practical projects and real-world scenarios.',
    thumbnail: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnail: file }));
    }
  };

  const handleSave = () => {
    // In a real app, this would send data to an API
    console.log('Saving course data:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: 'Advanced React Development',
      instructor: 'John Smith',
      category: 'Development',
      level: 'Advanced',
      price: '$99.99',
      description: 'Master React hooks, state management, and performance optimization. This comprehensive course covers everything you need to become a professional React developer. Learn best practices, design patterns, and real-world applications. From beginner fundamentals to advanced techniques, you\'ll gain hands-on experience through practical projects and real-world scenarios.',
      thumbnail: null,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Development: 'bg-blue-100 text-blue-700',
      Design: 'bg-purple-100 text-purple-700',
      Marketing: 'bg-pink-100 text-pink-700',
      Business: 'bg-orange-100 text-orange-700',
    };
    return colors[category] || 'bg-blue-100 text-blue-700';
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      Beginner: 'bg-green-100 text-green-700',
      Intermediate: 'bg-yellow-100 text-yellow-700',
      Advanced: 'bg-orange-100 text-orange-700',
    };
    return colors[level] || 'bg-orange-100 text-orange-700';
  };

  return (
    <div className="space-y-6">
      {/* Thumbnail & Header Card */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 relative">
          {!isEditing ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm text-slate-400">Course Thumbnail</span>
            </div>
          ) : (
            <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-slate-300 transition bg-slate-200">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              <div className="text-center">
                <p className="text-sm text-slate-600 font-medium">Click to upload thumbnail</p>
                {formData.thumbnail && <p className="text-xs text-slate-500 mt-1">{formData.thumbnail.name}</p>}
              </div>
            </label>
          )}
        </div>

        {/* Header Content */}
        <div className="p-6">
          {!isEditing ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{formData.title}</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getCategoryColor(formData.category)}`}>
                      {formData.category}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getLevelColor(formData.level)}`}>
                      {formData.level}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
                >
                  <Edit2 className="h-4 w-4" strokeWidth={2} />
                  Edit
                </button>
              </div>

              {/* Instructor Info */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm text-slate-500 mb-1">Instructor</p>
                <p className="text-sm font-medium text-slate-900">{formData.instructor}</p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-900 mb-1">
                  Course Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-slate-900 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option>Development</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Business</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-slate-900 mb-1">
                    Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="instructor" className="block text-sm font-medium text-slate-900 mb-1">
                  Instructor
                </label>
                <input
                  id="instructor"
                  name="instructor"
                  type="text"
                  value={formData.instructor}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-900 mb-1">
                  Price
                </label>
                <input
                  id="price"
                  name="price"
                  type="text"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  <Save className="h-4 w-4" strokeWidth={2} />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      {!isEditing && (
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Basic Info */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Course ID</p>
              <p className="text-sm font-medium text-slate-900 mt-1">COURSE-001</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Category</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{formData.category}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Level</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{formData.level}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Price</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{formData.price}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Created Date</p>
              <p className="text-sm font-medium text-slate-900 mt-1">Jan 15, 2024</p>
            </div>
          </div>
        </div>

        {/* Right Column - Course Stats */}
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Course Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <p className="text-sm text-slate-600">Total Modules</p>
              <p className="text-2xl font-bold text-emerald-600">3</p>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <p className="text-sm text-slate-600">Total Lessons</p>
              <p className="text-2xl font-bold text-emerald-600">12</p>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <p className="text-sm text-slate-600">Total Students</p>
              <p className="text-2xl font-bold text-emerald-600">234</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">Last Updated</p>
              <p className="text-sm font-medium text-slate-900">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Description */}
      {!isEditing && (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-3">Course Description</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {formData.description}
          </p>
        </div>
      )}

      {isEditing && (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Course Description</h3>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={5}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="Enter course description"
          />
        </div>
      )}

    </div>
  );
}
