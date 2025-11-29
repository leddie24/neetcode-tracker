import {
  CheckCircle2,
  Circle,
  Calendar,
  ExternalLink,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { ProblemTableProps, Problem } from "../types";
import NotesModal from "./NotesModal";

const difficultyColor: Record<Problem["difficulty"], string> = {
  Easy: "text-green-600",
  Medium: "text-yellow-600",
  Hard: "text-red-600",
};

const ProblemTable = ({
  problems,
  progress,
  toggleComplete,
  calculateNextReviews,
  calculateOriginalSchedule,
  filterCategory,
  filterDifficulty,
  showOnlyDueToday,
}: ProblemTableProps) => {
  const [notesModal, setNotesModal] = useState<{
    isOpen: boolean;
    problemId: number | null;
    problemName: string;
    notes: string | undefined;
  }>({
    isOpen: false,
    problemId: null,
    problemName: "",
    notes: undefined,
  });

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;

  const filteredProblems = problems.filter((problem) => {
    const categoryMatch =
      filterCategory === "All" || problem.category === filterCategory;
    const difficultyMatch =
      filterDifficulty === "All" || problem.difficulty === filterDifficulty;

    if (!showOnlyDueToday) return categoryMatch && difficultyMatch;

    const prob = progress[problem.id];
    if (!prob || !prob.solved) return false;
    const nextReviews = calculateNextReviews(prob.solvedDate, prob.dates);
    const isDueToday = nextReviews.some((date, idx) => {
      const reviewKey = `review${idx + 1}` as keyof typeof prob.dates;
      const isCompleted = prob.dates?.[reviewKey];
      return !isCompleted && date <= today;
    });
    return categoryMatch && difficultyMatch && isDueToday;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (date: string) => {
    return date < today;
  };

  const isDueToday = (date: string) => {
    return date === today;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Problems</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviews & Due Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProblems.map((problem) => {
              const prob = progress[problem.id] || {
                solved: false,
                dates: {},
              };
              const nextReviews = calculateNextReviews(
                prob.solvedDate,
                prob.dates
              );
              const originalSchedule = calculateOriginalSchedule(
                prob.solvedDate
              );
              return (
                <tr key={problem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {problem.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      Link:{" "}
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        title={`Open ${problem.name} on NeetCode`}
                      >
                        {problem.name}
                        <ExternalLink size={14} className="flex-shrink-0" />
                      </a>
                    </div>
                    {problem.leetcodeUrl && (
                      <div className="flex items-center gap-2">
                        Leetcode:{" "}
                        <a
                          href={problem.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          title={`Open ${problem.name} on NeetCode`}
                        >
                          {problem.name}
                          <ExternalLink size={14} className="flex-shrink-0" />
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {problem.category}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      difficultyColor[problem.difficulty]
                    }`}
                  >
                    {problem.difficulty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        if (prob.solved) {
                          if (
                            window.confirm(
                              "Are you sure you want to mark this problem as unsolved? This will clear all review progress."
                            )
                          ) {
                            toggleComplete(problem.id);
                          }
                        } else {
                          toggleComplete(problem.id);
                        }
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                      {prob.solved ? (
                        <CheckCircle2 className="text-green-600" size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                      <span className="text-xs">
                        {prob.solved ? "Solved" : "Not Solved"}
                      </span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {prob.solved ? (
                      <div className="flex flex-wrap gap-2">
                        {nextReviews.map((date, idx) => {
                          const reviewKey = `review${
                            idx + 1
                          }` as keyof typeof prob.dates;
                          const completedDate = prob.dates?.[reviewKey];
                          const isCompleted = !!completedDate;
                          const originalDate = originalSchedule[idx];
                          const overdue = !isCompleted && isOverdue(date);
                          const dueToday = !isCompleted && isDueToday(date);

                          return (
                            <div
                              key={idx}
                              className="flex flex-col items-center"
                            >
                              <button
                                onClick={() => toggleComplete(problem.id, idx)}
                                className={`px-2 py-1 rounded text-xs border min-w-[60px] ${
                                  isCompleted
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : overdue
                                    ? "bg-red-100 text-red-700 border-red-300"
                                    : dueToday
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                    : "bg-gray-100 text-gray-600 border-gray-300"
                                }`}
                                title={`Review ${idx + 1} - ${
                                  isCompleted
                                    ? `Completed: ${formatDate(
                                        completedDate
                                      )}, Next due: ${formatDate(date)}`
                                    : `Originally due: ${formatDate(
                                        originalDate
                                      )}, Now due: ${formatDate(date)}`
                                }`}
                              >
                                {`R${idx + 1}`}
                              </button>
                              <div className="text-xs mt-1 flex flex-col items-center gap-0.5">
                                {isCompleted && (
                                  <div className="text-gray-400 flex items-center gap-1">
                                    <Calendar size={10} />
                                    <span className="line-through">
                                      {formatDate(originalDate)}
                                    </span>
                                  </div>
                                )}
                                {!isCompleted && originalDate !== date && (
                                  <div className="text-gray-400 flex items-center gap-1">
                                    <Calendar size={10} />
                                    <span className="line-through">
                                      {formatDate(originalDate)}
                                    </span>
                                  </div>
                                )}
                                <div
                                  className={`flex items-center gap-1 ${
                                    isCompleted
                                      ? "text-gray-500"
                                      : overdue
                                      ? "text-red-600"
                                      : dueToday
                                      ? "text-yellow-600"
                                      : "text-gray-500"
                                  }`}
                                >
                                  <Calendar size={10} />
                                  {formatDate(date)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Complete problem to see review schedule
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() =>
                        setNotesModal({
                          isOpen: true,
                          problemId: problem.id,
                          problemName: problem.name,
                          notes: problem.notes,
                        })
                      }
                      className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
                      title="Add/View notes"
                    >
                      <FileText
                        size={16}
                        className={problem.notes ? "text-blue-600" : ""}
                      />
                      <span className="text-xs">
                        {problem.notes ? "Edit Notes" : "Add Notes"}
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NotesModal
        isOpen={notesModal.isOpen}
        problemName={notesModal.problemName}
        notes={notesModal.notes}
        onClose={() =>
          setNotesModal({
            isOpen: false,
            problemId: null,
            problemName: "",
            notes: undefined,
          })
        }
        onSave={(notes) => {
          // Update the problem notes in the data
          const problemIndex = problems.findIndex(
            (p) => p.id === notesModal.problemId
          );
          if (problemIndex !== -1) {
            problems[problemIndex].notes = notes;
          }
        }}
      />
    </div>
  );
};

export default ProblemTable;
