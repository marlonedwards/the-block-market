
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-light text-primary">The Block Market</h1>
            <nav className="hidden md:flex gap-6">
              <a href="/market" className="text-muted hover:text-primary transition-colors">Market</a>
              <a href="/trade" className="text-muted hover:text-primary transition-colors">Trade</a>
              <a href="/profile" className="text-muted hover:text-primary transition-colors">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12 animate-fadeIn">
        <h2 className="text-2xl font-medium mb-8">Universities</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/trade')}
          >
            <div className="aspect-video bg-muted/10 rounded-lg mb-4"></div>
            <h3 className="font-medium text-lg mb-2">Carnegie Mellon University</h3>
            <p className="text-muted text-sm">Trade meal blocks securely with other students</p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
