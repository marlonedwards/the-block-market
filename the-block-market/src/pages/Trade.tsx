import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import RestaurantList from "@/components/RestaurantList";
import Header from "@/components/Header";
import { supabase } from "@/config/supabase";

const Trade = () => {
  const navigate = useNavigate();
  const [currentPrice, setCurrentPrice] = useState<number>(12.00);

  const fetchCurrentPrice = async () => {
    try {
      const { data: bidsData, error: bidsError } = await supabase
        .from('orders')
        .select('price')
        .eq('status', 'PENDING')
        .is('seller_id', null)
        .gt('price', 0);

      const { data: asksData, error: asksError } = await supabase
        .from('orders')
        .select('price')
        .eq('status', 'PENDING')
        .not('seller_id', 'is', null)
        .gt('price', 0);

      if (bidsError || asksError) {
        console.error('Error fetching orders:', { bidsError, asksError });
        return;
      }

      const bids = bidsData || [];
      const asks = asksData || [];

      // Sort bids in descending order and asks in ascending order
      bids.sort((a, b) => b.price - a.price);
      asks.sort((a, b) => a.price - b.price);

      // Update current price based on best bid and ask
      if (bids.length > 0 && asks.length > 0) {
        const bestBid = bids[0].price;
        const bestAsk = asks[0].price;
        const midPrice = (bestBid + bestAsk) / 2;
        setCurrentPrice(midPrice);
      } else if (bids.length > 0) {
        setCurrentPrice(bids[0].price);
      } else if (asks.length > 0) {
        setCurrentPrice(asks[0].price);
      }
    } catch (error) {
      console.error('Error in fetchCurrentPrice:', error);
    }
  };

  useEffect(() => {
    fetchCurrentPrice();
    const interval = setInterval(fetchCurrentPrice, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchCurrentPrice)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-2">Current Price: ${currentPrice.toFixed(2)}</h2>
          <p className="text-muted mb-8">Carnegie Mellon University Meal Blocks</p>
          <div className="grid grid-cols-2 gap-4 mb-12">
            <Button size="lg" onClick={() => navigate('/buy')} className="h-32 text-xl">
              Buy Blocks
            </Button>
            <Button size="lg" onClick={() => navigate('/sell')} className="h-32 text-xl">
              Sell Blocks
            </Button>
          </div>
          
          <h3 className="text-2xl font-light mb-6">Open Dining Locations</h3>
          <RestaurantList />
        </div>
      </main>
    </div>
  );
};

export default Trade;