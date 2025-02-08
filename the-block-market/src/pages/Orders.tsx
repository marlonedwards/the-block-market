import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { supabase } from "@/config/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Session } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface OrderDetails {
  restaurant: string;
  items: string[];
}

interface Order {
  id: string;
  buyer_id: string;
  seller_id: string | null;
  status: string;
  order_details: OrderDetails;
  price: number;
  order_time: string;
  delivery_time: string;
  expiration_time: string;
  is_disputed: boolean;
}

const Orders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [session, setSession] = useState<Session | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      setSession(session);
    };

    checkSession();
  }, [navigate]);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", session?.user?.id, activeTab],
    queryFn: async () => {
      if (!session?.user?.id) return [];

      const query = supabase
        .from('orders')
        .select('*')
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .eq('status', activeTab)
        .order('order_time', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!session?.user?.id,
  });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'CANCELLED' })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  });

  const completeOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'COMPLETED' })
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsCompletionModalOpen(false);
      setSelectedOrder(null);
    }
  });

  const handleImageUpload = () => {
    if (!selectedOrder) return;
    completeOrder.mutate(selectedOrder.id);
  };

  const isUserBuyer = (order: Order) => order.buyer_id === session?.user?.id;
  const isUserSeller = (order: Order) => order.seller_id === session?.user?.id;
  const canCancelOrder = (order: Order) => 
    order.seller_id === null && 
    isUserBuyer(order) && 
    order.status === 'PENDING';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-8">
            {(['PENDING', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                onClick={() => setActiveTab(tab)}
                className="flex-1"
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-muted-foreground">No {activeTab.toLowerCase()} orders found.</p>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="w-full sm:w-auto">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-medium">
                          {order.order_details?.restaurant || 'Restaurant not specified'}
                        </h3>
                        <Badge 
                          variant={isUserBuyer(order) ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {isUserBuyer(order) ? "Buying" : "Selling"}
                        </Badge>
                        <Badge 
                          variant={order.status === 'ACCEPTED' ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm sm:text-base truncate max-w-md">
                        {order.order_details?.items?.join(', ') || 'No items specified'}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Delivery by: {new Date(order.delivery_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="font-medium">${order.price.toFixed(2)}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {new Date(order.order_time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
              
                  <div className="flex flex-wrap gap-2">
                    {canCancelOrder(order) && (
                      <Button
                        variant="destructive"
                        onClick={() => cancelOrder.mutate(order.id)}
                        className="w-full sm:w-auto"
                      >
                        Cancel Order
                      </Button>
                    )}
                    {order.status === 'ACCEPTED' && isUserSeller(order) && (
                      <Button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsCompletionModalOpen(true);
                        }}
                        className="w-full sm:w-auto"
                      >
                        Complete Order
                      </Button>
                    )}
                    {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && isUserBuyer(order) && (
                      <Button
                        onClick={() =>
                          navigate('/buy', {
                            state: {
                              restaurant: order.order_details?.restaurant,
                              items: order.order_details?.items || [],
                            },
                          })
                        }
                        className="w-full sm:w-auto"
                      >
                        Order Again
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>

      <Dialog open={isCompletionModalOpen} onOpenChange={setIsCompletionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Order - {selectedOrder?.order_details.restaurant}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Order Items:</h4>
              <ul className="list-disc pl-4 space-y-1">
                {selectedOrder?.order_details.items.map((item, index) => (
                  <li key={index} className="text-sm text-foreground">{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Upload Completion Image
              </label>
              <Input
                type="file"
                accept="image/*"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCompletionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImageUpload}
              >
                Complete Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;