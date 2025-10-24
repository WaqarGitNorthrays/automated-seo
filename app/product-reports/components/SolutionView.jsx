export default function SolutionView({ solutions }) {
  if (!solutions) {
    return (
      <div className="text-center py-8 text-gray-500">
        No solutions available for this product. Run the SEO analysis to generate solutions.
      </div>
    );
  }

  try {
    const parsedSolutions = typeof solutions === 'string' ? JSON.parse(solutions) : [];
    
    if (!Array.isArray(parsedSolutions) || parsedSolutions.length === 0) {
      throw new Error('No valid solutions data');
    }

    return (
      <div className="space-y-6">
        {parsedSolutions.map((item, idx) => (
          <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r">
            <h3 className="font-medium text-gray-900">{item.Issue}</h3>
            <p className="mt-1 text-gray-700">{item.Solution}</p>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('Error parsing solutions:', error);
    return (
      <div className="text-center py-8 text-red-500">
        Error loading solutions. Please try again later.
      </div>
    );
  }
}
