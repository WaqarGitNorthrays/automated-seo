import { AlertCircle } from "lucide-react";
import { getSeverityColor } from "@/utils/helpers";

export default function IssueCard({ issue }) {
  return (
    <div className={`p-4 rounded-lg border ${getSeverityColor(issue.severity)}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" aria-label="Issue" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">{issue.title}</h4>
            <span className="text-xs font-semibold uppercase">{issue.severity}</span>
          </div>
          <p className="text-sm opacity-90">{issue.description}</p>
          {issue.suggestion && (
            <div className="mt-2 pt-2 border-t border-current border-opacity-20">
              <p className="text-xs font-medium">Suggestion:</p>
              <p className="text-xs mt-1">{issue.suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
