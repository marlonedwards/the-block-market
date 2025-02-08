
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { AccountPreferences } from "@/types/restaurant";

const Profile = () => {
  const [preferences, setPreferences] = useState<AccountPreferences>({
    accountType: ['buyer', 'seller'],
    mealBlocksLeft: 10,
    diningDollarsLeft: 100,
  });

  const handleSave = () => {
    console.log('Saving preferences:', preferences);
    // Handle saving preferences
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-light text-primary">The Block Market</h1>
            <nav className="hidden md:flex gap-6">
              <a href="/market" className="text-muted hover:text-primary transition-colors">Market</a>
              <a href="/trade" className="text-muted hover:text-primary transition-colors">Trade</a>
              <a href="/orders" className="text-muted hover:text-primary transition-colors">Orders</a>
              <a href="/profile" className="text-primary transition-colors">Profile</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-12">
        <Card className="max-w-2xl mx-auto p-6">
          <h2 className="text-2xl font-light mb-6">Profile Settings</h2>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Type</h3>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="buyer"
                    checked={preferences.accountType.includes('buyer')}
                    onCheckedChange={(checked) => {
                      setPreferences(prev => ({
                        ...prev,
                        accountType: checked
                          ? [...prev.accountType, 'buyer']
                          : prev.accountType.filter(t => t !== 'buyer'),
                      }));
                    }}
                  />
                  <Label htmlFor="buyer">Buyer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="seller"
                    checked={preferences.accountType.includes('seller')}
                    onCheckedChange={(checked) => {
                      setPreferences(prev => ({
                        ...prev,
                        accountType: checked
                          ? [...prev.accountType, 'seller']
                          : prev.accountType.filter(t => t !== 'seller'),
                      }));
                    }}
                  />
                  <Label htmlFor="seller">Seller</Label>
                </div>
              </div>
            </div>

            {preferences.accountType.includes('seller') && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mealBlocks">Meal Blocks Left</Label>
                  <Input
                    id="mealBlocks"
                    type="number"
                    value={preferences.mealBlocksLeft}
                    onChange={(e) =>
                      setPreferences(prev => ({
                        ...prev,
                        mealBlocksLeft: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diningDollars">Dining Dollars Left</Label>
                  <Input
                    id="diningDollars"
                    type="number"
                    value={preferences.diningDollarsLeft}
                    onChange={(e) =>
                      setPreferences(prev => ({
                        ...prev,
                        diningDollarsLeft: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </>
            )}

            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
