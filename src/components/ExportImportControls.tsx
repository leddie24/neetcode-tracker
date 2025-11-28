import { Download, Upload, Trash2 } from "lucide-react";
import { ExportImportControlsProps } from "../types";
import { problems } from "../data";

const ExportImportControls = ({
  progress,
  setProgress,
}: ExportImportControlsProps) => {
  const exportData = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;

    // Include problems with their notes in the export
    const exportContent = {
      progress,
      problems: problems.map((p) => ({
        id: p.id,
        name: p.name,
        notes: p.notes,
      })),
      exportDate: dateStr,
    };

    const dataStr = JSON.stringify(exportContent, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `neetcode-progress-${dateStr}.json`;
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);

          // Handle both old format (just progress) and new format (progress + problems)
          if (imported.progress && imported.problems) {
            // New format with notes
            setProgress(imported.progress);
            // Update problems with imported notes
            imported.problems.forEach(
              (importedProblem: { id: number; notes?: string }) => {
                const problem = problems.find(
                  (p) => p.id === importedProblem.id
                );
                if (problem && importedProblem.notes) {
                  problem.notes = importedProblem.notes;
                }
              }
            );
          } else {
            // Old format - just progress
            setProgress(imported);
          }
          alert("Progress imported successfully!");
        } catch {
          alert("Error importing file. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all progress?")) {
      setProgress({});
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={exportData}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
      >
        <Download size={16} /> Export Progress
      </button>
      <label className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors cursor-pointer">
        <Upload size={16} /> Import Progress
        <input
          type="file"
          accept=".json"
          onChange={importData}
          className="hidden"
        />
      </label>
      <button
        onClick={clearAllData}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
      >
        <Trash2 size={16} /> Clear All
      </button>
    </div>
  );
};

export default ExportImportControls;
