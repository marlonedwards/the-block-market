
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { AccountPreferences } from "@/types/restaurant";
import Header from "@/components/Header";

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
      <Header />

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
