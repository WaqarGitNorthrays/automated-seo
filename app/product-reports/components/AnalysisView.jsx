import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function AnalysisView({ issues }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No analysis available for this product.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue, idx) => {
        const [issueText, scoreText] = issue.split(/(\d+\/\d+)$/);
        const isError = scoreText && parseInt(scoreText) === 0;
        
        return (
          <div 
            key={idx} 
            className={`flex items-start p-4 rounded-lg ${isError ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-50 border-l-4 border-green-500'}`}
          >
            {isError ? (
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm text-gray-800">
                {issueText.trim()}
                {scoreText && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white bg-opacity-70">
                    {scoreText}
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
