
import { useQuery } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Restaurant } from "@/types/restaurant";
import { useNavigate } from "react-router-dom";

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
    return <div className="text-center">Loading restaurants...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {data?.map((restaurant) => (
        <Card key={restaurant.name} className="p-6">
          <h3 className="text-xl font-medium mb-2">{restaurant.name}</h3>
          <p className="text-muted-foreground mb-4 line-clamp-2">{restaurant.shortDescription}</p>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/buy', { state: { restaurant: restaurant.name }})}>
              Buy Blocks
            </Button>
            <Button variant="outline" onClick={() => navigate('/sell', { state: { restaurant: restaurant.name }})}>
              Sell Blocks
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RestaurantList;
