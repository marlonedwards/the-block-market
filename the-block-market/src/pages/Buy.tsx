import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ethers } from 'ethers';
import { supabase } from "@/config/supabase";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { Alert, AlertDescription } from "@/components/ui/alert";

// RLUSD Constants
const RLUSD_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)"
];
const RLUSD_PROXY_ADDRESS = "0xe101FB315a64cDa9944E570a7bFfaFE60b994b1D";
const PLATFORM_WALLET = "0x43CDf41aC26f64D3d75010c68413BFe7daa164F9";

interface BuyFormValues {
  restaurant: string;
  items: string[];
  price: number;
}

interface LocationData {
  conceptId: number;
  name: string;
  shortDescription: string;
  description: string;
  location: string;
  menu: string;
  acceptsOnlineOrders: boolean;
}

const DEFAULT_PRICE = 8.50;
const SHOW_SCHEDULE = false;

const Buy = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'failed' | 'success' | null>(null);

  const form = useForm<BuyFormValues>({
    defaultValues: {
      restaurant: location.state?.restaurant || "",
      items: [""],
      price: DEFAULT_PRICE,
    },
  });

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
        navigate('/onboard');
        return;
      }

      setSession(session);
    };

    checkSession();
  }, [navigate]);

  const { data: restaurantsData, isError: isRestaurantsError } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      try {
        const response = await fetch("https://dining.apis.scottylabs.org/locations");
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();
        return Object.values(data.locations || {}) as LocationData[];
      } catch (error) {
        console.error('Error fetching restaurants:', error);
        return [];
      }
    },
  });

  const selectedRestaurant = restaurantsData?.find(
    (r: LocationData) => r.name === form.watch("restaurant")
  );

  const restaurants = Array.isArray(restaurantsData) ? restaurantsData : [];

  const processPayment = async (amount: number) => {
    if (!window.ethereum?.isMetaMask) {
      setPaymentStatus('failed');
      return false;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      
      // Get the network and ensure we're on Sepolia
      const network = await provider.getNetwork();
      if (network.chainId !== parseInt('0xaa36a7', 16)) {
        setPaymentStatus('failed');
        return false;
      }

      // Create contract instance
      const rlusdContract = new ethers.Contract(
        RLUSD_PROXY_ADDRESS,
        RLUSD_ABI,
        signer
      );

      // Convert amount to wei (RLUSD has 18 decimals)
      const platformFee = amount * 0.10; // 10% of the total amount
      const amountInWei = ethers.utils.parseUnits(platformFee.toString(), 18);

      try {
        // Attempt the transaction but expect it to fail
        const tx = await rlusdContract.transfer(PLATFORM_WALLET, amountInWei);
        await tx.wait();
        setPaymentStatus('success');
        return true;
      } catch (txError) {
        console.log('Transaction failed as expected');
        setPaymentStatus('failed');
        return false;
      }
    } catch (err) {
      console.log('Payment processing error:', err);
      setPaymentStatus('failed');
      return false;
    }
  };

  const createOrder = useMutation({
    mutationFn: async (data: BuyFormValues) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      setIsProcessingPayment(true);
      try {
        // Attempt payment but continue even if it fails
        await processPayment(data.price);
        
        const orderData = {
          buyer_id: session.user.id,
          seller_id: null,
          status: "PENDING",
          order_details: {
            restaurant: data.restaurant,
            items: data.items.filter(item => item.trim() !== ""),
            payment_status: paymentStatus === 'success' ? 'paid' : 'pending'
          },
          price: data.price,
          order_time: new Date().toISOString(),
          delivery_time: new Date(Date.now() + 30 * 60000).toISOString(),
          expiration_time: new Date(Date.now() + 15 * 60000).toISOString(),
          is_disputed: false
        };

        const { data: order, error } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (error) throw error;
        return order;
      } finally {
        setIsProcessingPayment(false);
      }
    },
    onSuccess: () => {
      if (paymentStatus === 'failed') {
        setError('Payment processing failed. Order created with pending payment status.');
        setTimeout(() => navigate('/orders'), 2000);
      } else {
        navigate('/orders');
      }
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      setError('Failed to create order. Please try again.');
    }
  });

  const onSubmit = (data: BuyFormValues) => {
    setError(null);
    setPaymentStatus(null);
    createOrder.mutate(data);
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-12">
        <Card className="max-w-2xl mx-auto p-6">
          <h2 className="text-2xl font-light mb-6">Buy a Block</h2>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="restaurant"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Restaurant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select restaurant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {restaurants.length > 0 ? (
                          restaurants.map((restaurant) => (
                            <SelectItem 
                              key={restaurant.name} 
                              value={restaurant.name}
                              className="cursor-pointer hover:bg-gray-100"
                            >
                              {restaurant.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="loading" disabled>
                            {isRestaurantsError ? "Error loading restaurants" : "Loading restaurants..."}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {selectedRestaurant?.menu && (
                      <a 
                        href={selectedRestaurant.menu}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline block mt-2"
                      >
                        View Menu →
                      </a>
                    )}
                  </FormItem>
                )}
              />

              {form.watch("items").map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`items.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item {index + 1}</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} className="bg-background" />
                        </FormControl>
                        {index === form.watch("items").length - 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const items = form.getValues("items");
                              form.setValue("items", [...items, ""]);
                            }}
                          >
                            +
                          </Button>
                        )}
                      </div>
                    </FormItem>
                  )}
                />
              ))}

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Price (Market Price: ${DEFAULT_PRICE.toFixed(2)})
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        className="bg-background"
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

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createOrder.isPending || isProcessingPayment}
                >
                  {isProcessingPayment ? "Processing Payment..." : 
                   createOrder.isPending ? "Creating Order..." : "Post Order"}
                </Button>
                {SHOW_SCHEDULE && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1" 
                    onClick={() => navigate('/schedule')}
                  >
                    Schedule Ahead
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
};

export default Buy;