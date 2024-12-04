export default function Reports() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-6 glass card-gradient space-y-4">
            <h3 className="text-xl font-semibold">Report {i}</h3>
            <p className="text-gray-400">
              Sample report placeholder. Detailed reports coming soon.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}