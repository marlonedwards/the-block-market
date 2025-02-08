import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { PriceChart } from '@/components/PriceChart';
import { supabase } from '@/config/supabase';

interface OrderBook {
  bids: Array<{ price: number; quantity: number }>;
  asks: Array<{ price: number; quantity: number }>;
}

type TimeframeOption = '15M' | '30M' | '1H' | '24H' | '7D';

const Market = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<TimeframeOption>('24H');
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [currentPrice, setCurrentPrice] = useState<number>(12.00);
  const [priceChange24h, setPriceChange24h] = useState<{ value: number; percentage: number }>({ value: 0, percentage: 0 });

  const fetchOrderBook = async () => {
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

      const aggregateOrders = (orders: { price: number }[]) => {
        const priceMap = orders.reduce((acc, order) => {
          acc[order.price] = (acc[order.price] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

        return Object.entries(priceMap).map(([price, quantity]) => ({
          price: parseFloat(price),
          quantity
        }));
      };

      const bids = aggregateOrders(bidsData || []);
      const asks = aggregateOrders(asksData || []);

      bids.sort((a, b) => b.price - a.price);
      asks.sort((a, b) => a.price - b.price);

      setOrderBook({ bids, asks });

      // Update current price
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
      console.error('Error in fetchOrderBook:', error);
    }
  };

  useEffect(() => {
    fetchOrderBook();
    const interval = setInterval(fetchOrderBook, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('orders-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrderBook)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="mb-8">
              <div className="flex flex-wrap gap-4 mb-6">
                {(['15M', '30M', '1H', '24H', '7D'] as const).map((tf) => (
                  <Button
                    key={tf}
                    variant={timeframe === tf ? 'default' : 'outline'}
                    onClick={() => setTimeframe(tf)}
                    className="px-4 py-2 text-sm"
                  >
                    {tf}
                  </Button>
                ))}
              </div>
              <PriceChart timeframe={timeframe} currentPrice={currentPrice} />
            </div>
          </div>

          <Card className="overflow-hidden shadow-sm border-t">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Order Book</h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Price</span>
                    <span>Size</span>
                  </div>
                  <div className="space-y-1">
                    {orderBook.bids.map((bid, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-1"
                      >
                        <span className="font-medium text-green-600">${bid.price.toFixed(2)}</span>
                        <span className="text-gray-600">{bid.quantity}</span>
                        <div 
                          className="absolute left-0 h-full bg-green-100/50" 
                          style={{ 
                            width: `${(bid.quantity / Math.max(...orderBook.bids.map(b => b.quantity))) * 100}%`,
                            zIndex: -1 
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Price</span>
                    <span>Size</span>
                  </div>
                  <div className="space-y-1">
                    {orderBook.asks.map((ask, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-1"
                      >
                        <span className="font-medium text-red-600">${ask.price.toFixed(2)}</span>
                        <span className="text-gray-600">{ask.quantity}</span>
                        <div 
                          className="absolute left-0 h-full bg-red-100/50" 
                          style={{ 
                            width: `${(ask.quantity / Math.max(...orderBook.asks.map(a => a.quantity))) * 100}%`,
                            zIndex: -1 
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-center gap-4 mt-8">
            <Button
              size="lg"
              onClick={() => navigate('/buy')}
              className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white"
            >
              Buy Block
            </Button>
            <Button
              size="lg"
              onClick={() => navigate('/sell')}
              className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white"
            >
              Sell Block
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Market;