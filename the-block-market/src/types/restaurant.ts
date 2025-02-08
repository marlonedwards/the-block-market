
export interface Restaurant {
  conceptId: number;
  name: string;
  shortDescription: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  times: {
    start: {
      day: number;
      hour: number;
      minute: number;
    };
    end: {
      day: number;
      hour: number;
      minute: number;
    };
  }[];
  menu: string;
  acceptsOnlineOrders: boolean;
  todaysSpecials: {
    title: string;
    description: string;
  }[];
  todaysSoups: {
    title: string;
    description: string;
  }[];
}

export interface AccountPreferences {
  accountType: ('buyer' | 'seller')[];
  mealBlocksLeft?: number;
  diningDollarsLeft?: number;
}

export interface Order {
  id: string;
  type: 'buy' | 'sell';
  status: 'active' | 'completed' | 'cancelled';
  restaurant: string;
  items: string[];
  amount: number;
  createdAt: string;
}
