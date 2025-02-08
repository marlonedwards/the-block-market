
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface OnboardingForm {
  accountTypes: string[];
  mealBlocksLeft?: number;
  diningDollarsLeft?: number;
}

const Onboard = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const form = useForm<OnboardingForm>({
    defaultValues: {
      accountTypes: [],
    },
  });

  const onSubmit = (data: OnboardingForm) => {
    console.log(data);
    navigate('/trade');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2].map((number) => (
              <div
                key={number}
                className={`h-2 flex-1 ${
                  number <= step ? "bg-primary" : "bg-muted"
                } ${number === 1 ? "rounded-l" : "rounded-r"}`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Step {step} of 2
          </p>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-2xl font-light mb-6">Select Account Type</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="buyer"
                  onCheckedChange={(checked) => {
                    const types = form.getValues().accountTypes;
                    if (checked) {
                      form.setValue('accountTypes', [...types, 'buyer']);
                    } else {
                      form.setValue('accountTypes', types.filter(t => t !== 'buyer'));
                    }
                  }}
                />
                <Label htmlFor="buyer">Buyer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="seller"
                  onCheckedChange={(checked) => {
                    const types = form.getValues().accountTypes;
                    if (checked) {
                      form.setValue('accountTypes', [...types, 'seller']);
                    } else {
                      form.setValue('accountTypes', types.filter(t => t !== 'seller'));
                    }
                  }}
                />
                <Label htmlFor="seller">Seller</Label>
              </div>
            </div>
            <Button 
              className="w-full mt-6"
              onClick={() => {
                if (form.getValues().accountTypes.length > 0) {
                  setStep(2);
                }
              }}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <h2 className="text-2xl font-light mb-6">Account Details</h2>
              
              {form.getValues().accountTypes.includes('seller') && (
                <>
                  <FormField
                    control={form.control}
                    name="mealBlocksLeft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meal Blocks Left</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diningDollarsLeft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dining Dollars Left</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              {form.getValues().accountTypes.includes('buyer') && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">Current Block Price</p>
                  <p className="text-2xl font-light mt-2">$8.50</p>
                  <p className="text-sm text-muted-foreground mt-1">Account funding coming soon</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  Complete Setup
                </Button>
              </div>
            </form>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default Onboard;
