import { X } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";

interface NotesModalProps {
  isOpen: boolean;
  problemName: string;
  notes: string | undefined;
  onClose: () => void;
  onSave: (notes: string) => void;
}

// Simple markdown to JSX converter for code blocks and formatting
const renderPreview = (text: string): ReactNode[] => {
  const lines = text.split("\n");
  const elements: ReactNode[] = [];
  let codeBlock = false;
  let codeContent: string[] = [];
  let key = 0;

  lines.forEach((line) => {
    if (line.startsWith("```")) {
      if (codeBlock) {
        // End code block
        elements.push(
          <pre
            key={key++}
            className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-2"
          >
            <code className="font-mono text-sm">{codeContent.join("\n")}</code>
          </pre>
        );
        codeContent = [];
      }
      codeBlock = !codeBlock;
      return;
    }

    if (codeBlock) {
      codeContent.push(line);
      return;
    }

    if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={key++} className="font-bold text-gray-900 my-2">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={key++} className="ml-4 text-gray-700">
          {line.substring(2)}
        </li>
      );
    } else if (line.trim()) {
      elements.push(
        <p key={key++} className="text-gray-700 my-1">
          {line}
        </p>
      );
    }
  });

  return elements;
};

const NotesModal = ({
  isOpen,
  problemName,
  notes,
  onClose,
  onSave,
}: NotesModalProps) => {
  const [editedNotes, setEditedNotes] = useState(notes || "");

  useEffect(() => {
    setEditedNotes(notes || "");
  }, [notes, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editedNotes);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        // Remove tab character before cursor (unindent)
        if (editedNotes[start - 1] === "\t") {
          const newText =
            editedNotes.substring(0, start - 1) + editedNotes.substring(start);
          setEditedNotes(newText);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start - 1;
          }, 0);
        }
      } else {
        // Insert tab character at cursor position
        const newText =
          editedNotes.substring(0, start) + "\t" + editedNotes.substring(end);
        setEditedNotes(newText);

        // Move cursor after the inserted tab
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold text-gray-800">{problemName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex gap-6 p-6 min-h-0">
          {/* Editor */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Editor
            </label>
            <textarea
              value={editedNotes}
              onChange={(e) => setEditedNotes(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add notes here...&#10;&#10;Supports:&#10;- Code blocks with triple backticks (```code```)&#10;- **Bold text**&#10;- Bullet points with -"
              className="flex-1 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-0"
            />
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <label className="text-sm font-semibold text-gray-700 mb-2">
              Preview
            </label>
            <div className="flex-1 overflow-y-auto p-4 border border-gray-300 rounded-lg bg-gray-50 min-h-0">
              {editedNotes ? (
                <div className="space-y-2">{renderPreview(editedNotes)}</div>
              ) : (
                <p className="text-gray-400 italic">
                  Preview will appear here...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;
