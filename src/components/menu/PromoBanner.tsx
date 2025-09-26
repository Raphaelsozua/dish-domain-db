export function PromoBanner() {
  return (
    <div className="mx-4 my-6">
      <div 
        className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-100 to-orange-100"
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-bakery-brown mb-1">
              Do forno
            </h2>
            <h2 className="text-2xl font-bold text-bakery-brown mb-1">
              para sua
            </h2>
            <h2 className="text-3xl font-bold text-primary italic">
              mesa
            </h2>
          </div>
          
          <div className="flex-1 text-right">
            <div className="text-4xl font-script text-bakery-brown">
              Bakery
            </div>
          </div>
        </div>
        
        {/* Decorative bread illustration placeholder */}
        <div className="absolute right-4 bottom-4 w-16 h-16 bg-amber-200 rounded-full opacity-50" />
        <div className="absolute right-8 bottom-8 w-12 h-12 bg-orange-200 rounded-full opacity-30" />
      </div>
    </div>
  );
}