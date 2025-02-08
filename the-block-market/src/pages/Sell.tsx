
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "react-router-dom";

interface SellFormValues {
  price: number;
  expiryTime: string;
}

const expiryTimes = Array.from({ length: 8 }, (_, i) => {
  const minutes = (i + 1) * 15;
  return {
    value: minutes.toString(),
    label: `${Math.floor(minutes / 60)}h ${minutes % 60}m`,
  };
});

const Sell = () => {
  const location = useLocation();
  const form = useForm<SellFormValues>({
    defaultValues: {
      price: 8.50,
      expiryTime: "60",
    },
  });

  const onSubmit = (data: SellFormValues) => {
    console.log("Sell order submitted:", data);
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
          <h2 className="text-2xl font-light mb-6">Sell Blocks</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limit Price (Current Market Price: $8.50)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
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
                      <SelectContent>
                        {expiryTimes.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Post Sell Order
              </Button>
            </form>
          </Form>
        </Card>
      </main>
    </div>
  );
};

export default Sell;
