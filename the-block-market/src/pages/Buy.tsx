
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Restaurant } from "@/types/restaurant";

interface BuyFormValues {
  restaurant: string;
  items: string[];
  price: number;
  scheduleDate?: string;
  scheduleTime?: string;
}

const Buy = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const form = useForm<BuyFormValues>({
    defaultValues: {
      restaurant: location.state?.restaurant || "",
      items: [""],
      price: 8.50,
    },
  });

  const { data: restaurants } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const response = await fetch("https://dining.apis.scottylabs.org/locations");
      return response.json() as Promise<Restaurant[]>;
    },
  });

  const onSubmit = (data: BuyFormValues) => {
    console.log("Order submitted:", data);
    // Handle order submission
  };

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
        <Card className="max-w-2xl mx-auto p-6">
          <h2 className="text-2xl font-light mb-6">Buy Blocks</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="restaurant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Restaurant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select restaurant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {restaurants?.map((restaurant) => (
                          <SelectItem key={restaurant.name} value={restaurant.name}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          <Input {...field} />
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
                    <FormLabel>Price (Current Market Price: $8.50)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Post Order
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/schedule')}>
                  Schedule Ahead
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
};

export default Buy;
