
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RestaurantList from "@/components/RestaurantList";

const Trade = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-light text-primary">The Block Market</h1>
            <nav className="hidden md:flex gap-6">
              <a href="/market" className="text-muted hover:text-primary transition-colors">Market</a>
              <a href="/trade" className="text-primary transition-colors">Trade</a>
              <a href="/profile" className="text-muted hover:text-primary transition-colors">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-2">Current Price: $8.50</h2>
          <p className="text-muted mb-8">Carnegie Mellon University Meal Blocks</p>
          <div className="grid grid-cols-2 gap-4 mb-12">
            <Button size="lg" onClick={() => navigate('/buy')} className="h-32 text-xl">
              Buy Blocks
            </Button>
            <Button size="lg" onClick={() => navigate('/sell')} className="h-32 text-xl">
              Sell Blocks
            </Button>
          </div>
          
          <h3 className="text-2xl font-light mb-6">Available Restaurants</h3>
          <RestaurantList />
        </div>
      </main>
    </div>
  );
};

export default Trade;
