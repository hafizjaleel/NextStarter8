'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface Answer {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  answers: Answer[];
  correctAnswers: number[];
  feedback?: string;
}

export interface QuizData {
  questions: Question[];
  passingScore: number;
  timeLimit: number;
  maxAttempts: number;
}

interface QuizFormProps {
  quizData: QuizData;
  onQuizDataChange: (data: QuizData) => void;
}

export function QuizForm({ quizData, onQuizDataChange }: QuizFormProps) {
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [desiredNumberOfQuestions, setDesiredNumberOfQuestions] = useState(quizData.questions.length);
  const [questionFormData, setQuestionFormData] = useState<Partial<Question>>({
    text: '',
    type: 'multiple-choice',
    answers: [
      { id: 1, text: '' },
      { id: 2, text: '' },
    ],
    correctAnswers: [],
    feedback: '',
  });

  const handleSettingChange = (field: keyof QuizData, value: number) => {
    onQuizDataChange({
      ...quizData,
      [field]: value,
    });
  };

  const handleNumberOfQuestionsChange = (newNumber: number) => {
    setDesiredNumberOfQuestions(newNumber);

    const currentCount = quizData.questions.length;

    if (newNumber > currentCount) {
      // Add empty questions
      const newQuestions = [...quizData.questions];
      for (let i = currentCount; i < newNumber; i++) {
        const newId = Math.max(...newQuestions.map((q) => q.id), 0) + 1;
        newQuestions.push({
          id: newId,
          text: '',
          type: 'multiple-choice' as QuestionType,
          answers: [
            { id: 1, text: '' },
            { id: 2, text: '' },
          ],
          correctAnswers: [],
          feedback: '',
        });
      }
      onQuizDataChange({
        ...quizData,
        questions: newQuestions,
      });
    } else if (newNumber < currentCount) {
      // Remove questions from the end
      const newQuestions = quizData.questions.slice(0, newNumber);
      onQuizDataChange({
        ...quizData,
        questions: newQuestions,
      });
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestionId(null);
    setQuestionFormData({
      text: '',
      type: 'multiple-choice',
      answers: [
        { id: 1, text: '' },
        { id: 2, text: '' },
      ],
      correctAnswers: [],
      feedback: '',
    });
    setExpandedQuestionId(null);
  };

  const handleSaveQuestion = () => {
    if (
      !questionFormData.text ||
      !questionFormData.answers ||
      questionFormData.answers.length === 0 ||
      !questionFormData.type ||
      questionFormData.correctAnswers?.length === 0
    ) {
      alert('Please fill in all required fields');
      return;
    }

    let updatedQuestions = quizData.questions;

    if (editingQuestionId !== null) {
      updatedQuestions = updatedQuestions.map((q) =>
        q.id === editingQuestionId ? ({ ...questionFormData, id: q.id } as Question) : q,
      );
    } else {
      const newQuestion: Question = {
        id: Math.max(...quizData.questions.map((q) => q.id), 0) + 1,
        text: questionFormData.text || '',
        type: (questionFormData.type as QuestionType) || 'multiple-choice',
        answers: questionFormData.answers || [],
        correctAnswers: questionFormData.correctAnswers || [],
        feedback: questionFormData.feedback || '',
      };
      updatedQuestions = [...updatedQuestions, newQuestion];
    }

    onQuizDataChange({
      ...quizData,
      questions: updatedQuestions,
    });

    setEditingQuestionId(null);
    setQuestionFormData({
      text: '',
      type: 'multiple-choice',
      answers: [
        { id: 1, text: '' },
        { id: 2, text: '' },
      ],
      correctAnswers: [],
      feedback: '',
    });
  };

  const handleDeleteQuestion = (id: number) => {
    onQuizDataChange({
      ...quizData,
      questions: quizData.questions.filter((q) => q.id !== id),
    });
  };

  const handleEditQuestion = (question: Question) => {
    setQuestionFormData(question);
    setEditingQuestionId(question.id);
    setExpandedQuestionId(question.id);
  };

  const handleQuestionFieldChange = (field: keyof Question, value: unknown) => {
    setQuestionFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAnswerChange = (answerIndex: number, text: string) => {
    const updatedAnswers = [...(questionFormData.answers || [])];
    updatedAnswers[answerIndex] = { ...updatedAnswers[answerIndex], text };
    setQuestionFormData((prev) => ({ ...prev, answers: updatedAnswers }));
  };

  const handleAddAnswer = () => {
    const newAnswerId = Math.max(...(questionFormData.answers || []).map((a) => a.id), 0) + 1;
    setQuestionFormData((prev) => ({
      ...prev,
      answers: [...(prev.answers || []), { id: newAnswerId, text: '' }],
    }));
  };

  const handleRemoveAnswer = (answerIndex: number) => {
    const updatedAnswers = (questionFormData.answers || []).filter((_, i) => i !== answerIndex);
    const updatedCorrectAnswers = (questionFormData.correctAnswers || []).filter(
      (id) => id !== (questionFormData.answers || [])[answerIndex]?.id,
    );
    setQuestionFormData((prev) => ({
      ...prev,
      answers: updatedAnswers,
      correctAnswers: updatedCorrectAnswers,
    }));
  };

  const toggleCorrectAnswer = (answerId: number) => {
    const updatedCorrectAnswers = (questionFormData.correctAnswers || []).includes(answerId)
      ? (questionFormData.correctAnswers || []).filter((id) => id !== answerId)
      : [...(questionFormData.correctAnswers || []), answerId];

    setQuestionFormData((prev) => ({
      ...prev,
      correctAnswers: updatedCorrectAnswers,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-slate-900">Quiz Settings</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-slate-900 mb-1">
              Number of Questions
            </label>
            <input
              id="numberOfQuestions"
              type="number"
              min="0"
              value={desiredNumberOfQuestions}
              onChange={(e) => handleNumberOfQuestionsChange(parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="passingScore" className="block text-sm font-medium text-slate-900 mb-1">
              Passing Score (%)
            </label>
            <input
              id="passingScore"
              type="number"
              min="0"
              max="100"
              value={quizData.passingScore}
              onChange={(e) => handleSettingChange('passingScore', parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label htmlFor="timeLimit" className="block text-sm font-medium text-slate-900 mb-1">
              Time Limit (minutes)
            </label>
            <input
              id="timeLimit"
              type="number"
              min="0"
              value={quizData.timeLimit}
              onChange={(e) => handleSettingChange('timeLimit', parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0 for unlimited"
            />
          </div>
          <div>
            <label htmlFor="maxAttempts" className="block text-sm font-medium text-slate-900 mb-1">
              Max Attempts
            </label>
            <input
              id="maxAttempts"
              type="number"
              min="0"
              value={quizData.maxAttempts}
              onChange={(e) => handleSettingChange('maxAttempts', parseInt(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0 for unlimited"
            />
          </div>
        </div>
      </div>

      {/* Questions Section */}
      <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Questions ({quizData.questions.length})</h3>
          {editingQuestionId === null && (
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add Question
            </button>
          )}
        </div>

        {/* Question List */}
        <div className="space-y-3">
          {quizData.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-lg border border-slate-100 bg-slate-50 p-4 hover:shadow-sm transition"
            >
              <button
                onClick={() =>
                  setExpandedQuestionId(expandedQuestionId === question.id ? null : question.id)
                }
                className="flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium text-slate-500">Q{index + 1}</span>
                  <span className="text-sm text-slate-900">{question.text}</span>
                  <span className="inline-flex rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 capitalize">
                    {question.type.replace('-', ' ')}
                  </span>
                </div>
                {expandedQuestionId === question.id ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" strokeWidth={2} />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={2} />
                )}
              </button>

              {expandedQuestionId === question.id && (
                <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Question Text
                    </label>
                    <textarea
                      value={question.text}
                      onChange={(e) => handleQuestionFieldChange('text', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Question Type
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionFieldChange('type', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="true-false">True/False</option>
                      <option value="short-answer">Short Answer</option>
                    </select>
                  </div>

                  {/* Answers Section */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-900">
                        Answers
                      </label>
                      {question.type !== 'true-false' && (
                        <button
                          onClick={handleAddAnswer}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
                        >
                          + Add Answer
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {question.answers.map((answer, answerIndex) => (
                        <div key={answer.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={question.correctAnswers.includes(answer.id)}
                            onChange={() => toggleCorrectAnswer(answer.id)}
                            className="h-4 w-4 rounded border-slate-300 text-emerald-600 transition cursor-pointer"
                          />
                          <input
                            type="text"
                            value={answer.text}
                            onChange={(e) => handleAnswerChange(answerIndex, e.target.value)}
                            placeholder={`Answer ${answerIndex + 1}`}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          {question.answers.length > 1 && question.type !== 'true-false' && (
                            <button
                              onClick={() => handleRemoveAnswer(answerIndex)}
                              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-1">
                      Feedback (Optional)
                    </label>
                    <textarea
                      value={question.feedback || ''}
                      onChange={(e) => handleQuestionFieldChange('feedback', e.target.value)}
                      placeholder="Feedback shown after answering..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                    >
                      Update Question
                    </button>
                    <button
                      onClick={() => {
                        setEditingQuestionId(null);
                        setExpandedQuestionId(null);
                        setQuestionFormData({
                          text: '',
                          type: 'multiple-choice',
                          answers: [
                            { id: 1, text: '' },
                            { id: 2, text: '' },
                          ],
                          correctAnswers: [],
                          feedback: '',
                        });
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="ml-auto rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Question Form */}
        {editingQuestionId === null && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Question Text
                </label>
                <textarea
                  value={(questionFormData.text as string) || ''}
                  onChange={(e) => handleQuestionFieldChange('text', e.target.value)}
                  placeholder="Enter question..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Question Type
                </label>
                <select
                  value={(questionFormData.type as string) || 'multiple-choice'}
                  onChange={(e) => {
                    const type = e.target.value as QuestionType;
                    let answers = questionFormData.answers || [];
                    if (type === 'true-false') {
                      answers = [
                        { id: 1, text: 'True' },
                        { id: 2, text: 'False' },
                      ];
                    }
                    setQuestionFormData((prev) => ({
                      ...prev,
                      type,
                      answers,
                      correctAnswers: [],
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True/False</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-900">Answers</label>
                  {questionFormData.type !== 'true-false' && (
                    <button
                      onClick={handleAddAnswer}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
                    >
                      + Add Answer
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {(questionFormData.answers || []).map((answer, answerIndex) => (
                    <div key={answer.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(questionFormData.correctAnswers || []).includes(answer.id)}
                        onChange={() => toggleCorrectAnswer(answer.id)}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 transition cursor-pointer"
                      />
                      <input
                        type="text"
                        value={answer.text}
                        onChange={(e) => handleAnswerChange(answerIndex, e.target.value)}
                        placeholder={`Answer ${answerIndex + 1}`}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {(questionFormData.answers || []).length > 1 &&
                        questionFormData.type !== 'true-false' && (
                          <button
                            onClick={() => handleRemoveAnswer(answerIndex)}
                            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1">
                  Feedback (Optional)
                </label>
                <textarea
                  value={(questionFormData.feedback as string) || ''}
                  onChange={(e) => handleQuestionFieldChange('feedback', e.target.value)}
                  placeholder="Feedback shown after answering..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveQuestion}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  Add Question
                </button>
                <button
                  onClick={() => {
                    setEditingQuestionId(null);
                    setQuestionFormData({
                      text: '',
                      type: 'multiple-choice',
                      answers: [
                        { id: 1, text: '' },
                        { id: 2, text: '' },
                      ],
                      correctAnswers: [],
                      feedback: '',
                    });
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
