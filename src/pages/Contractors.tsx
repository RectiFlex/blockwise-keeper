import { Card } from "@/components/ui/card";

const Contractors = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contractors</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 glass hover:shadow-lg transition-all">
            <div className="space-y-4">
              <div className="h-40 bg-white/5 rounded-lg" />
              <h3 className="text-xl font-semibold">Contractor {i}</h3>
              <p className="text-gray-400">
                Professional contractor specializing in residential and commercial projects.
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Contractors;