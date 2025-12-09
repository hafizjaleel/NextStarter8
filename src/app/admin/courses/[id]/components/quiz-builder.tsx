'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { SidePanel } from '@/components/side-panel';
import { ConfirmDialog } from '@/components/confirm-dialog';

export interface QuizOption {
  id: string | number;
  option: string;
  correct: boolean;
  optionOrder: number;
}

export interface QuizQuestion {
  id: string | number;
  question: string;
  questionOrder: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string | number;
  title: string;
  instructions: string;
  quizOrder: number;
  questions: QuizQuestion[];
}

interface QuizBuilderProps {
  courseId: string;
  moduleId: string | number;
  quizzes: Quiz[];
  onAdd?: (quiz: Quiz) => void;
  onEdit?: (quiz: Quiz) => void;
  onDelete?: (quizId: string | number) => void;
}

export function QuizBuilder({ courseId, moduleId, quizzes = [] }: QuizBuilderProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | number | null>(null);
  const [expandedQuizId, setExpandedQuizId] = useState<string | number | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'quiz' | 'question' | 'option' | null;
    quizId: string | number | null;
    questionId: string | number | null;
    optionId: string | number | null;
  }>({
    isOpen: false,
    type: null,
    quizId: null,
    questionId: null,
    optionId: null,
  });
  const [quizFormData, setQuizFormData] = useState({
    title: '',
    instructions: '',
    quizOrder: '',
  });
  const [questionFormData, setQuestionFormData] = useState({
    question: '',
    questionOrder: '',
  });
  const [optionFormData, setOptionFormData] = useState({
    option: '',
    correct: false,
    optionOrder: '',
  });
  const [activeQuestionForm, setActiveQuestionForm] = useState<string | number | null>(null);
  const [activeOptionForm, setActiveOptionForm] = useState<string | number | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (activeQuestionForm !== null) {
      setQuestionFormData((prev) => ({ ...prev, [name]: val }));
    } else if (activeOptionForm !== null) {
      setOptionFormData((prev) => ({ ...prev, [name]: val }));
    } else {
      setQuizFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleAddQuiz = () => {
    setEditingQuizId(null);
    setQuizFormData({
      title: '',
      instructions: '',
      quizOrder: (quizzes.length + 1).toString(),
    });
    setIsPanelOpen(true);
  };

  const handleEditQuiz = (quizId: string | number) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (quiz) {
      setQuizFormData({
        title: quiz.title,
        instructions: quiz.instructions,
        quizOrder: quiz.quizOrder.toString(),
      });
      setEditingQuizId(quizId);
      setIsPanelOpen(true);
    }
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const quizOrder = parseInt(quizFormData.quizOrder, 10);
    if (quizFormData.title && !isNaN(quizOrder)) {
      // TODO: API call - POST/PUT to create or update quiz
      setIsPanelOpen(false);
      setQuizFormData({
        title: '',
        instructions: '',
        quizOrder: '',
      });
    }
  };

  const handleDeleteQuiz = (quizId: string | number) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'quiz',
      quizId,
      questionId: null,
      optionId: null,
    });
  };

  const handleConfirmDelete = () => {
    // TODO: API call based on deleteConfirm.type
    setDeleteConfirm({
      isOpen: false,
      type: null,
      quizId: null,
      questionId: null,
      optionId: null,
    });
  };

  const handleAddQuestion = (quizId: string | number) => {
    setActiveQuestionForm(quizId);
    setQuestionFormData({
      question: '',
      questionOrder: '',
    });
  };

  const handleSaveQuestion = (quizId: string | number, e: React.FormEvent) => {
    e.preventDefault();
    const questionOrder = parseInt(questionFormData.questionOrder, 10);
    if (questionFormData.question && !isNaN(questionOrder)) {
      // TODO: API call - POST/PUT to create or update question
      setActiveQuestionForm(null);
      setQuestionFormData({
        question: '',
        questionOrder: '',
      });
    }
  };

  const handleDeleteQuestion = (quizId: string | number, questionId: string | number) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'question',
      quizId,
      questionId,
      optionId: null,
    });
  };

  const handleAddOption = (questionId: string | number) => {
    setActiveOptionForm(questionId);
    setOptionFormData({
      option: '',
      correct: false,
      optionOrder: '',
    });
  };

  const handleSaveOption = (questionId: string | number, e: React.FormEvent) => {
    e.preventDefault();
    const optionOrder = parseInt(optionFormData.optionOrder, 10);
    if (optionFormData.option && !isNaN(optionOrder)) {
      // TODO: API call - POST/PUT to create or update option
      setActiveOptionForm(null);
      setOptionFormData({
        option: '',
        correct: false,
        optionOrder: '',
      });
    }
  };

  const handleDeleteOption = (
    questionId: string | number,
    optionId: string | number,
  ) => {
    setDeleteConfirm({
      isOpen: true,
      type: 'option',
      quizId: null,
      questionId,
      optionId,
    });
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setEditingQuizId(null);
    setQuizFormData({
      title: '',
      instructions: '',
      quizOrder: '',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Quizzes</h3>
        <button
          onClick={handleAddQuiz}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add Quiz
        </button>
      </div>

      <SidePanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        title={editingQuizId !== null ? 'Edit Quiz' : 'Add New Quiz'}
      >
        <form onSubmit={handleSaveQuiz} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-900 mb-1">
              Quiz Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={quizFormData.title}
              onChange={handleInputChange}
              placeholder="e.g., React Basics Assessment"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-slate-900 mb-1">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={quizFormData.instructions}
              onChange={handleInputChange}
              placeholder="e.g., Answer all questions carefully..."
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <div>
            <label htmlFor="quizOrder" className="block text-sm font-medium text-slate-900 mb-1">
              Quiz Order
            </label>
            <input
              id="quizOrder"
              name="quizOrder"
              type="number"
              min="1"
              value={quizFormData.quizOrder}
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
              {editingQuizId !== null ? 'Update Quiz' : 'Add Quiz'}
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

      <div className="space-y-4">
        {quizzes.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-600">No quizzes yet. Create one to get started.</p>
          </div>
        ) : (
          quizzes
            .sort((a, b) => a.quizOrder - b.quizOrder)
            .map((quiz) => (
              <div
                key={quiz.id}
                className="rounded-xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-base font-bold text-slate-900">{quiz.title}</h4>
                        <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          #{quiz.quizOrder}
                        </span>
                        <span className="inline-block rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {quiz.questions.length} questions
                        </span>
                      </div>
                      {quiz.instructions && (
                        <p className="text-sm text-slate-600 line-clamp-2">{quiz.instructions}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setExpandedQuizId(
                          expandedQuizId === quiz.id ? null : quiz.id,
                        )}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        {expandedQuizId === quiz.id ? (
                          <ChevronUp className="h-4 w-4" strokeWidth={2} />
                        ) : (
                          <ChevronDown className="h-4 w-4" strokeWidth={2} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEditQuiz(quiz.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      >
                        <Edit2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </div>

                  {expandedQuizId === quiz.id && (
                    <div className="space-y-4 border-t border-slate-100 pt-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleAddQuestion(quiz.id)}
                          className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <Plus className="h-4 w-4" strokeWidth={2} />
                          Add Question
                        </button>
                      </div>

                      {quiz.questions.length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No questions yet
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {quiz.questions
                            .sort((a, b) => a.questionOrder - b.questionOrder)
                            .map((question) => (
                              <div
                                key={question.id}
                                className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-semibold text-slate-900">
                                        Q{question.questionOrder}. {question.question}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        setExpandedQuestionId(
                                          expandedQuestionId === question.id
                                            ? null
                                            : question.id,
                                        )
                                      }
                                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-600"
                                    >
                                      {expandedQuestionId === question.id ? (
                                        <ChevronUp className="h-4 w-4" strokeWidth={2} />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" strokeWidth={2} />
                                      )}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteQuestion(quiz.id, question.id)
                                      }
                                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                                    </button>
                                  </div>
                                </div>

                                {expandedQuestionId === question.id && (
                                  <div className="space-y-3 border-t border-slate-200 pt-3">
                                    <div className="flex justify-end">
                                      <button
                                        onClick={() => handleAddOption(question.id)}
                                        className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 border border-slate-200"
                                      >
                                        <Plus className="h-3 w-3" strokeWidth={2} />
                                        Add Option
                                      </button>
                                    </div>

                                    {question.options.length === 0 ? (
                                      <p className="text-xs text-slate-500 text-center py-2">
                                        No options yet
                                      </p>
                                    ) : (
                                      <div className="space-y-2">
                                        {question.options
                                          .sort((a, b) => a.optionOrder - b.optionOrder)
                                          .map((option) => (
                                            <div
                                              key={option.id}
                                              className="flex items-center gap-2 rounded-lg bg-white p-2.5 border border-slate-100"
                                            >
                                              <input
                                                type="checkbox"
                                                checked={option.correct}
                                                disabled
                                                className="h-4 w-4 rounded border-slate-300 bg-slate-50 text-emerald-600"
                                              />
                                              <span className="text-sm text-slate-700 flex-1">
                                                {option.option}
                                              </span>
                                              <span className="text-xs text-slate-500">
                                                #{option.optionOrder}
                                              </span>
                                              {option.correct && (
                                                <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                  Correct
                                                </span>
                                              )}
                                              <button
                                                onClick={() =>
                                                  handleDeleteOption(
                                                    question.id,
                                                    option.id,
                                                  )
                                                }
                                                className="rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                              >
                                                <Trash2 className="h-3 w-3" strokeWidth={2} />
                                              </button>
                                            </div>
                                          ))}
                                      </div>
                                    )}

                                    {activeOptionForm === question.id && (
                                      <div className="rounded-lg bg-white border border-emerald-200 p-3 space-y-2">
                                        <input
                                          type="text"
                                          name="option"
                                          value={optionFormData.option}
                                          onChange={handleInputChange}
                                          placeholder="Option text"
                                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                        <div className="grid gap-2 grid-cols-2">
                                          <input
                                            type="number"
                                            name="optionOrder"
                                            value={optionFormData.optionOrder}
                                            onChange={handleInputChange}
                                            placeholder="Order"
                                            min="1"
                                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                          />
                                          <label className="flex items-center gap-2 text-sm text-slate-700">
                                            <input
                                              type="checkbox"
                                              name="correct"
                                              checked={optionFormData.correct}
                                              onChange={handleInputChange}
                                              className="h-4 w-4 rounded border-slate-300 bg-slate-50 text-emerald-600"
                                            />
                                            Correct
                                          </label>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={(e) => handleSaveOption(question.id, e)}
                                            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-700"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={() => setActiveOptionForm(null)}
                                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}

                      {activeQuestionForm === quiz.id && (
                        <div className="rounded-lg bg-white border border-emerald-200 p-4 space-y-3">
                          <input
                            type="text"
                            name="question"
                            value={questionFormData.question}
                            onChange={handleInputChange}
                            placeholder="Question text"
                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <input
                            type="number"
                            name="questionOrder"
                            value={questionFormData.questionOrder}
                            onChange={handleInputChange}
                            placeholder="Question order"
                            min="1"
                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleSaveQuestion(quiz.id, e)}
                              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                            >
                              Add Question
                            </button>
                            <button
                              onClick={() => setActiveQuestionForm(null)}
                              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${
          deleteConfirm.type === 'quiz'
            ? 'Quiz'
            : deleteConfirm.type === 'question'
              ? 'Question'
              : 'Option'
        }?`}
        message={`This action cannot be undone. The ${
          deleteConfirm.type === 'quiz'
            ? 'quiz and all its questions'
            : deleteConfirm.type === 'question'
              ? 'question and all its options'
              : 'option'
        } will be permanently deleted.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleConfirmDelete}
        onCancel={() =>
          setDeleteConfirm({
            isOpen: false,
            type: null,
            quizId: null,
            questionId: null,
            optionId: null,
          })
        }
      />
    </div>
  );
}
