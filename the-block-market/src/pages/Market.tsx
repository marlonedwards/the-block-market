
import { Card } from "@/components/ui/card";
import { PriceChart } from "@/components/PriceChart";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Market = () => {
  const [timeframe, setTimeframe] = useState("1D");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-light text-primary">The Block Market</h1>
            <nav className="hidden md:flex gap-6">
              <a href="/market" className="text-primary transition-colors">Market</a>
              <a href="/trade" className="text-muted hover:text-primary transition-colors">Trade</a>
              <a href="/profile" className="text-muted hover:text-primary transition-colors">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-light text-primary">$8.50</h2>
              <p className="text-success flex items-center gap-1">+2.5%</p>
            </div>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1D">1 Day</SelectItem>
                <SelectItem value="1W">1 Week</SelectItem>
                <SelectItem value="1M">1 Month</SelectItem>
                <SelectItem value="1Y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <PriceChart timeframe={timeframe} />
        </Card>
      </main>
    </div>
  );
};

export default Market;
