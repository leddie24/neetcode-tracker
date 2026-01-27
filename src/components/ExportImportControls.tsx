import { Download, Upload, Trash2 } from "lucide-react";
import { ExportImportControlsProps } from "../types";
import { problems, gfeProblems, adobeProblems } from "../data";

// Helper to convert progress to clean export format
const toCleanFormat = (
  progressState: Record<number, { solved: boolean; dates: Record<string, string>; solvedDate: string | null }>,
  problemList: { id: number; name: string; notes?: string }[]
) => {
  return problemList.map((p) => {
    const prog = progressState[p.id];
    const dateArray: string[] = [];
    
    if (prog?.solved && prog.dates) {
      const dates = prog.dates;
      // Convert dates object to ordered array: [initial, review1, review2, ...]
      if (dates.initial) dateArray.push(dates.initial);
      for (let i = 1; i <= 5; i++) {
        const key = `review${i}` as keyof typeof dates;
        if (dates[key]) dateArray.push(dates[key]!);
      }
    }
    
    return {
      id: p.id,
      name: p.name,
      dates: dateArray,
      ...(p.notes && { notes: p.notes }),
    };
  });
};

// Helper to convert clean format back to internal progress state
const fromCleanFormat = (
  cleanData: { id: number; name: string; dates: string[]; notes?: string }[]
): Record<number, { solved: boolean; dates: Record<string, string>; solvedDate: string | null }> => {
  const result: Record<number, { solved: boolean; dates: Record<string, string>; solvedDate: string | null }> = {};
  for (const item of cleanData) {
    const dates: Record<string, string> = {};
    if (item.dates[0]) dates.initial = item.dates[0];
    for (let i = 1; i < item.dates.length && i <= 5; i++) {
      dates[`review${i}`] = item.dates[i];
    }
    result[item.id] = {
      solved: true,
      dates,
      solvedDate: item.dates[0] || null,
    };
  }
  return result;
};

const ExportImportControls = ({
  neetcodeProgress,
  setNeetcodeProgress,
  gfeProgress,
  setGfeProgress,
  adobeProgress,
  setAdobeProgress,
}: ExportImportControlsProps) => {
  const exportData = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(now.getDate()).padStart(2, "0")}`;

    // Export in clean, readable format
    const exportContent = {
      neetcode: toCleanFormat(neetcodeProgress, problems),
      gfe: toCleanFormat(gfeProgress, gfeProblems),
      adobe: toCleanFormat(adobeProgress, adobeProblems),
      exportDate: dateStr,
    };

    const dataStr = JSON.stringify(exportContent, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `codetrack-progress-${dateStr}.json`;
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);

          // Handle NEW clean format (neetcode, gfe, adobe arrays)
          if (imported.neetcode && Array.isArray(imported.neetcode)) {
            setNeetcodeProgress(fromCleanFormat(imported.neetcode));
            // Update notes
            imported.neetcode.forEach((item: { id: number; notes?: string }) => {
              const problem = problems.find((p) => p.id === item.id);
              if (problem && item.notes) problem.notes = item.notes;
            });
          }
          if (imported.gfe && Array.isArray(imported.gfe)) {
            setGfeProgress(fromCleanFormat(imported.gfe));
            imported.gfe.forEach((item: { id: number; notes?: string }) => {
              const problem = gfeProblems.find((p) => p.id === item.id);
              if (problem && item.notes) problem.notes = item.notes;
            });
          }
          if (imported.adobe && Array.isArray(imported.adobe)) {
            setAdobeProgress(fromCleanFormat(imported.adobe));
            imported.adobe.forEach((item: { id: number; notes?: string }) => {
              const problem = adobeProblems.find((p) => p.id === item.id);
              if (problem && item.notes) problem.notes = item.notes;
            });
          }

          // Handle OLD format with neetcodeProgress/gfeProgress/adobeProgress objects
          if (imported.neetcodeProgress && !imported.neetcode) {
            setNeetcodeProgress(imported.neetcodeProgress);
            imported.problems?.forEach(
              (importedProblem: { id: number; notes?: string }) => {
                const problem = problems.find(
                  (p) => p.id === importedProblem.id
                );
                if (problem && importedProblem.notes) {
                  problem.notes = importedProblem.notes;
                }
              }
            );
          }

          if (imported.gfeProgress && !imported.gfe) {
            setGfeProgress(imported.gfeProgress);
            imported.gfeProblems?.forEach(
              (importedProblem: { id: number; notes?: string }) => {
                const problem = gfeProblems.find(
                  (p) => p.id === importedProblem.id
                );
                if (problem && importedProblem.notes) {
                  problem.notes = importedProblem.notes;
                }
              }
            );
          }

          if (imported.adobeProgress && !imported.adobe) {
            setAdobeProgress(imported.adobeProgress);
            imported.adobeProblems?.forEach(
              (importedProblem: { id: number; notes?: string }) => {
                const problem = adobeProblems.find(
                  (p) => p.id === importedProblem.id
                );
                if (problem && importedProblem.notes) {
                  problem.notes = importedProblem.notes;
                }
              }
            );
          }

          // Handle very old format (just progress) for backward compatibility
          if (imported.progress && !imported.neetcodeProgress && !imported.neetcode) {
            setNeetcodeProgress(imported.progress);
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
      setNeetcodeProgress({});
      setGfeProgress({});
      setAdobeProgress({});
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
