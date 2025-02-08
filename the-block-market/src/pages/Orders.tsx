
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Order } from "@/types/restaurant";

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'cancelled'>('active');

  // Mock data - replace with actual data fetching
  const orders: Order[] = [
    {
      id: '1',
      type: 'buy',
      status: 'active',
      restaurant: 'The Underground',
      items: ['Burger', 'Fries', 'Drink'],
      amount: 8.50,
      createdAt: new Date().toISOString(),
    },
    // Add more mock orders as needed
  ];

  const filteredOrders = orders.filter(order => order.status === activeTab);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-light text-primary">The Block Market</h1>
            <nav className="hidden md:flex gap-6">
              <a href="/market" className="text-muted hover:text-primary transition-colors">Market</a>
              <a href="/trade" className="text-muted hover:text-primary transition-colors">Trade</a>
              <a href="/orders" className="text-primary transition-colors">Orders</a>
              <a href="/profile" className="text-muted hover:text-primary transition-colors">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-8">
            {(['active', 'completed', 'cancelled'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                onClick={() => setActiveTab(tab)}
                className="flex-1"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-medium">{order.restaurant}</h3>
                    <p className="text-muted-foreground truncate max-w-md">
                      {order.items.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                    </p>
                  </div>
                </div>
                {order.type === 'buy' && (
                  <Button
                    onClick={() =>
                      navigate('/buy', {
                        state: {
                          restaurant: order.restaurant,
                          items: order.items,
                        },
                      })
                    }
                  >
                    Order Again
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Orders;
