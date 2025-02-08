import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Restaurant } from "@/types/restaurant";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const RestaurantList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const response = await fetch("https://dining.apis.scottylabs.org/locations");
      const data = await response.json();
      return data.locations as Restaurant[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {data?.map((restaurant) => (
        <Card 
          key={restaurant.name} 
          className="flex flex-col h-full w-full"
        >
          <CardHeader>
            <CardTitle className="text-xl font-medium leading-tight line-clamp-2 mb-2">
              {restaurant.name}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 line-clamp-3">
              {restaurant.shortDescription}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-grow">
            {/* Spacer for consistent height */}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pt-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/buy', { 
                state: { restaurant: restaurant.name }
              })}
            >
              Buy a Block
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              size="lg"
              onClick={() => navigate('/sell', { 
                state: { restaurant: restaurant.name }
              })}
            >
              Sell a Block
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default RestaurantList;