import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

interface SellFormValues {
  price: number;
  expiryTime: string;
}

interface MarketPrice {
  current_price: number;
  last_updated: string;
}

interface Order {
  id: string;
  price: number;
  expiration_time: string;
  order_details: {
    type: string;
    expiry_minutes: number;
  };
}

const DEFAULT_PRICE = 8.50;

const expiryTimes = Array.from({ length: 8 }, (_, i) => {
  const minutes = (i + 1) * 15;
  return {
    value: minutes.toString(),
    label: `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
  };
});

const Sell = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data: userData } = await supabase
        .from('public_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!userData) {
        navigate('/onboarding');
        return;
      }

      setSession(session);
    };

    checkSession();
  }, [navigate]);

  const limitForm = useForm<SellFormValues>({
    defaultValues: {
      price: DEFAULT_PRICE,
      expiryTime: "60",
    },
  });

  const marketForm = useForm<SellFormValues>({
    defaultValues: {
      expiryTime: "60",
    },
  });

  // Fetch current market price using both order book and recent trades
  const { data: marketPrice, refetch: refetchMarketPrice } = useQuery<MarketPrice>({
    queryKey: ["market-price"],
    queryFn: async () => {
      try {
        // Get best bid and ask from order book
        const [bidsResponse, asksResponse, recentTradesResponse] = await Promise.all([
          // Get bids (buy orders)
          supabase
            .from('orders')
            .select('price')
            .eq('status', 'PENDING')
            .is('seller_id', null)
            .gt('price', 0)
            .order('price', { ascending: false })
            .limit(1),

          // Get asks (sell orders)
          supabase
            .from('orders')
            .select('price')
            .eq('status', 'PENDING')
            .not('seller_id', 'is', null)
            .gt('price', 0)
            .order('price', { ascending: true })
            .limit(1),

          // Get recent trades
          supabase
            .from('orders')
            .select('price')
            .eq('status', 'ACCEPTED')
            .not('buyer_id', 'is', null)
            .not('seller_id', 'is', null)
            .order('order_time', { ascending: false })
            .limit(5)
        ]);

        let price = DEFAULT_PRICE;

        // If we have both bid and ask, use mid price
        if (bidsResponse.data?.[0] && asksResponse.data?.[0]) {
          const bestBid = bidsResponse.data[0].price;
          const bestAsk = asksResponse.data[0].price;
          price = (bestBid + bestAsk) / 2;
        }
        // If we have recent trades, average with the current price
        else if (recentTradesResponse.data && recentTradesResponse.data.length > 0) {
          const avgRecentPrice = recentTradesResponse.data.reduce((acc, trade) => acc + trade.price, 0) / recentTradesResponse.data.length;
          price = avgRecentPrice;
        }
        // If we only have bids
        else if (bidsResponse.data?.[0]) {
          price = bidsResponse.data[0].price;
        }
        // If we only have asks
        else if (asksResponse.data?.[0]) {
          price = asksResponse.data[0].price;
        }

        return {
          current_price: price,
          last_updated: new Date().toISOString()
        };
      } catch (error) {
        console.error('Error fetching market price:', error);
        return {
          current_price: DEFAULT_PRICE,
          last_updated: new Date().toISOString()
        };
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Set up real-time subscription for price updates
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          refetchMarketPrice();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchMarketPrice]);

  // Fetch order book - only pending BUY orders that haven't expired
  const { data: orderBook } = useQuery({
    queryKey: ["order-book"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'PENDING')
        .gt('expiration_time', now)
        .order('price', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 5000,
  });

  const createSellOrder = useMutation({
    mutationFn: async (data: SellFormValues & { type: 'market' | 'limit' }) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const expiryMinutes = parseInt(data.expiryTime);
      const expirationTime = new Date(Date.now() + expiryMinutes * 60000);

      const orderData = {
        seller_id: session.user.id,
        buyer_id: '00000000-0000-0000-0000-000000000000',
        status: "PENDING",
        order_details: {
          type: data.type === 'market' ? 'sell_market' : 'sell_limit',
          expiry_minutes: expiryMinutes
        },
        price: data.type === 'market' ? marketPrice?.current_price || DEFAULT_PRICE : data.price,
        order_time: new Date().toISOString(),
        delivery_time: new Date(Date.now() + 30 * 60000).toISOString(),
        expiration_time: expirationTime.toISOString(),
        is_disputed: false
      };

      const { data: order, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;
      return order;
    },
    onSuccess: () => {
      navigate('/orders');
    },
    onError: (error) => {
      console.error('Error creating sell order:', error);
    }
  });

  const acceptOrder = useMutation({
    mutationFn: async (orderId: string) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }
  
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'ACCEPTED',
          seller_id: session.user.id,
          acceptance_time: new Date().toISOString()
        })
        .eq('id', orderId)
        .select('id, status, seller_id, acceptance_time')
        .maybeSingle();
  
      if (updateError) {
        console.error('Supabase error:', updateError);
        throw new Error(`Update failed: ${updateError.message}`);
      }
      
      if (!data) {
        console.error('No data returned from update');
        throw new Error('No matching order found');
      }
      
      return data;
    },
    onSuccess: (data) => {
      console.log('Order successfully accepted:', data);
      setShowOrderModal(false);
      navigate('/orders');
    },
    onError: (error: Error) => {
      console.error('Error accepting order:', error.message);
    }
  });

  const onSubmitMarket = (data: SellFormValues) => {
    createSellOrder.mutate({ ...data, type: 'market' });
  };

  const onSubmitLimit = (data: SellFormValues) => {
    createSellOrder.mutate({ ...data, type: 'limit' });
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Current Market Price</h2>
              <span className="text-3xl font-bold text-primary">
                ${marketPrice?.current_price.toFixed(2) || DEFAULT_PRICE.toFixed(2)}
              </span>
            </div>
          </Card>

          <Card className="p-6 mb-6">
            <Tabs defaultValue="market" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="market" className="w-full">Sell Now (Market)</TabsTrigger>
                <TabsTrigger value="limit" className="w-full">Sell Later (Limit)</TabsTrigger>
              </TabsList>

              <TabsContent value="market">
                <Form {...marketForm}>
                  <form onSubmit={marketForm.handleSubmit(onSubmitMarket)} className="space-y-6">
                    <FormField
                      control={marketForm.control}
                      name="expiryTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Expiry Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select expiry time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {expiryTimes.map((time) => (
                                <SelectItem 
                                  key={time.value} 
                                  value={time.value}
                                  className="cursor-pointer hover:bg-gray-100"
                                >
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createSellOrder.isPending}
                    >
                      {createSellOrder.isPending ? "Creating Order..." : "Sell at Market Price"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="limit">
                <Form {...limitForm}>
                  <form onSubmit={limitForm.handleSubmit(onSubmitLimit)} className="space-y-6">
                    <FormField
                      control={limitForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Limit Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (value < 0) return;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={limitForm.control}
                      name="expiryTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order Expiry Time</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select expiry time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white">
                              {expiryTimes.map((time) => (
                                <SelectItem 
                                  key={time.value} 
                                  value={time.value}
                                  className="cursor-pointer hover:bg-gray-100"
                                >
                                  {time.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createSellOrder.isPending}
                    >
                      {createSellOrder.isPending ? "Creating Order..." : "Create Limit Order"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Available Buy Orders</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left">Price</th>
                    <th className="py-2 text-left">Expiration</th>
                    <th className="py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderBook && orderBook.length > 0 ? (
                    orderBook.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">${order.price.toFixed(2)}</td>
                        <td className="py-3">
                          {new Date(order.expiration_time).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOrderClick(order)}
                          >
                            Fulfill Order
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-500">
                        No buy orders available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Order Fulfillment</DialogTitle>
            <DialogDescription>
              Review the order details before accepting.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Price:</span>
                <span>${selectedOrder?.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Expires:</span>
                <span>{new Date(selectedOrder?.expiration_time || '').toLocaleString()}</span>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  By accepting this order, you agree to fulfill it within 5 minutes. 
                  Failure to do so may affect your seller rating.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOrderModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedOrder && acceptOrder.mutate(selectedOrder.id)}
              disabled={acceptOrder.isPending}
            >
              {acceptOrder.isPending ? "Accepting..." : "Accept Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sell;