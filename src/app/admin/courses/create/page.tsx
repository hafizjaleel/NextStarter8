'use client';

import { useState, useRef } from 'react';
import { Upload, X, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const MENTORS = [
  { id: 1, name: 'John Smith' },
  { id: 2, name: 'Sarah Johnson' },
  { id: 3, name: 'Mike Chen' },
  { id: 4, name: 'Emily Rodriguez' },
  { id: 5, name: 'David Williams' },
];

export default function CreateCoursePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: '',
    isFree: true,
    price: '',
    language: 'en',
    status: 'draft',
    mentorIds: [] as number[],
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailFileId, setThumbnailFileId] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showMentorDropdown, setShowMentorDropdown] = useState(false);
  const [mentorSearchQuery, setMentorSearchQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mentorDropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleToggleFree = () => {
    setFormData((prev) => ({
      ...prev,
      isFree: !prev.isFree,
      price: !prev.isFree ? '' : prev.price,
    }));
    if (validationErrors.price) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.price;
        return newErrors;
      });
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setUploadError(null);
      uploadThumbnail(file);
    }
  };

  const uploadThumbnail = async (file: File) => {
    setIsUploadingThumbnail(true);
    setUploadError(null);

    try {
      const formDataForUpload = new FormData();
      formDataForUpload.append('file', file);

      const response = await fetch('/api/v1/app/upload', {
        method: 'POST',
        body: formDataForUpload,
      });

      if (!response.ok) {
        throw new Error('Failed to upload thumbnail');
      }

      const data = await response.json();
      setThumbnailFileId(data.fileId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      setThumbnail(null);
      setThumbnailFileId(null);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailFileId(null);
    setUploadError(null);
  };

  const toggleMentor = (mentorId: number) => {
    setFormData((prev) => ({
      ...prev,
      mentorIds: prev.mentorIds.includes(mentorId)
        ? prev.mentorIds.filter((id) => id !== mentorId)
        : [...prev.mentorIds, mentorId],
    }));
    if (validationErrors.mentorIds) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.mentorIds;
        return newErrors;
      });
    }
  };

  const filteredMentors = MENTORS.filter((mentor) =>
    mentor.name.toLowerCase().includes(mentorSearchQuery.toLowerCase())
  );

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Course title is required';
    }

    if (!formData.level) {
      errors.level = 'Level is required';
    }

    if (formData.mentorIds.length === 0) {
      errors.mentorIds = 'At least one mentor is required';
    }

    if (!formData.isFree && !formData.price) {
      errors.price = 'Price is required for paid courses';
    }

    if (!formData.isFree && formData.price && parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        title: formData.title,
        description: formData.description,
        isFree: formData.isFree,
        price: formData.isFree ? undefined : parseFloat(formData.price),
        level: formData.level,
        language: formData.language,
        status: formData.status,
        thumbnailFileId: thumbnailFileId || undefined,
        mentorIds: formData.mentorIds,
      };

      const response = await fetch('/api/v1/course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      const data = await response.json();
      console.log('Course created:', data);
      // Redirect to courses page or course detail
      window.location.href = '/admin/courses';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
      setValidationErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMentorNames = MENTORS.filter((m) => formData.mentorIds.includes(m.id))
    .map((m) => m.name)
    .join(', ');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create Course</h1>
        <p className="mt-1 text-sm text-slate-600">Add a new course to your learning platform</p>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {validationErrors.submit && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-900">{validationErrors.submit}</p>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
              Course Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Advanced React Development"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 ${
                validationErrors.title
                  ? 'border-red-300 bg-red-50 focus:ring-red-500'
                  : 'border-slate-200 bg-white focus:ring-emerald-500'
              }`}
            />
            {validationErrors.title && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.title}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what students will learn in this course"
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Level and Language Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Level Field */}
            <div>
              <label htmlFor="level" className="block text-sm font-semibold text-slate-900 mb-2">
                Level *
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 cursor-pointer ${
                  validationErrors.level
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-slate-200 bg-white focus:ring-emerald-500'
                }`}
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {validationErrors.level && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.level}</p>
              )}
            </div>

            {/* Language Field */}
            <div>
              <label htmlFor="language" className="block text-sm font-semibold text-slate-900 mb-2">
                Language
              </label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
              </select>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Free Course</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {formData.isFree ? 'This course is free' : 'This is a paid course'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleFree}
                className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                  formData.isFree ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
                aria-label="Toggle free course"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    formData.isFree ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {!formData.isFree && (
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-slate-900 mb-2">
                  Price ($) *
                </label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 99.99"
                  min="0"
                  step="0.01"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 ${
                    validationErrors.price
                      ? 'border-red-300 bg-red-50 focus:ring-red-500'
                      : 'border-slate-200 bg-white focus:ring-emerald-500'
                  }`}
                />
                {validationErrors.price && (
                  <p className="mt-1 text-xs text-red-600">{validationErrors.price}</p>
                )}
              </div>
            )}
          </div>

          {/* Status Field */}
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-slate-900 mb-2">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          {/* Mentors Multi-Select */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Instructors *
            </label>
            <div className="relative" ref={mentorDropdownRef}>
              <button
                type="button"
                onClick={() => setShowMentorDropdown(!showMentorDropdown)}
                className={`w-full rounded-lg border px-4 py-2.5 text-sm text-left text-slate-900 transition focus:outline-none focus:ring-2 flex items-center justify-between ${
                  validationErrors.mentorIds
                    ? 'border-red-300 bg-red-50 focus:ring-red-500'
                    : 'border-slate-200 bg-white focus:ring-emerald-500 hover:border-slate-300'
                }`}
              >
                <span className={selectedMentorNames ? 'text-slate-900' : 'text-slate-500'}>
                  {selectedMentorNames || 'Select instructors'}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition ${
                    showMentorDropdown ? 'rotate-180' : ''
                  }`}
                  strokeWidth={2}
                />
              </button>

              {showMentorDropdown && (
                <div className="absolute top-full z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                  <div className="border-b border-slate-100 p-3">
                    <input
                      type="text"
                      placeholder="Search instructors..."
                      value={mentorSearchQuery}
                      onChange={(e) => setMentorSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredMentors.length > 0 ? (
                      filteredMentors.map((mentor) => (
                        <button
                          key={mentor.id}
                          type="button"
                          onClick={() => toggleMentor(mentor.id)}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-900 hover:bg-slate-50 transition flex items-center justify-between"
                        >
                          <span>{mentor.name}</span>
                          {formData.mentorIds.includes(mentor.id) && (
                            <Check className="h-4 w-4 text-emerald-600" strokeWidth={2} />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-center text-sm text-slate-500">
                        No instructors found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {validationErrors.mentorIds && (
              <p className="mt-1 text-xs text-red-600">{validationErrors.mentorIds}</p>
            )}
            {formData.mentorIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {MENTORS.filter((m) => formData.mentorIds.includes(m.id)).map((mentor) => (
                  <div
                    key={mentor.id}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                  >
                    {mentor.name}
                    <button
                      type="button"
                      onClick={() => toggleMentor(mentor.id)}
                      className="text-emerald-600 hover:text-emerald-800"
                      aria-label={`Remove ${mentor.name}`}
                    >
                      <X className="h-3 w-3" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Course Thumbnail
            </label>
            {thumbnail && thumbnailFileId ? (
              <div className="relative rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                      {thumbnail.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(thumbnail)}
                          alt="Thumbnail preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-slate-500">Preview</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{thumbnail.name}</p>
                      <p className="text-xs text-slate-500">
                        {(thumbnail.size / 1024 / 1024).toFixed(2)} MB • Uploaded
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveThumbnail}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Remove thumbnail"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className={`rounded-lg border-2 border-dashed p-8 transition ${
                  isUploadingThumbnail
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50'
                }`}>
                  <div className="flex flex-col items-center justify-center">
                    <Upload
                      className={`h-8 w-8 mb-2 ${
                        isUploadingThumbnail
                          ? 'text-slate-400'
                          : 'text-slate-400'
                      }`}
                      strokeWidth={2}
                    />
                    <p className="text-sm font-medium text-slate-900">
                      {isUploadingThumbnail ? 'Uploading...' : 'Click to upload thumbnail'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG or WebP (max. 10MB)</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  disabled={isUploadingThumbnail}
                  aria-label="Upload course thumbnail"
                />
              </label>
            )}
            {uploadError && (
              <p className="mt-2 text-xs text-red-600">{uploadError}</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 border-t border-slate-100 pt-6">
            <Link
              href="/admin/courses"
              className="rounded-lg border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
