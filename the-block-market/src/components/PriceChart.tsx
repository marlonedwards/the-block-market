import { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { supabase } from '@/config/supabase';

interface PricePoint {
  timestamp: string;
  price: number;
  displayTime: string;
}

interface PriceHistory {
  price: number;
  timestamp: string;
}

interface PriceChartProps {
  timeframe: '15M' | '30M' | '1H' | '24H' | '7D';
  currentPrice: number;
}

export const PriceChart = ({ timeframe, currentPrice }: PriceChartProps) => {
  const [priceData, setPriceData] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const priceChange = useMemo(() => {
    if (priceData.length < 2) return { value: 0, percentage: 0 };
    const firstPrice = priceData[0].price;
    const lastPrice = currentPrice;
    const change = lastPrice - firstPrice;
    const percentage = (change / firstPrice) * 100;
    return { value: change, percentage };
  }, [priceData, currentPrice]);

  const isPriceUp = priceChange.value >= 0;

  useEffect(() => {
    const fetchPriceHistory = async () => {
      setIsLoading(true);
      const now = new Date();
      let startTime;
      
      switch (timeframe) {
        case '15M':
          startTime = new Date(now.getTime() - 15 * 60 * 1000);
          break;
        case '30M':
          startTime = new Date(now.getTime() - 30 * 60 * 1000);
          break;
        case '1H':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24H':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7D':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
      }

      const { data, error } = await supabase
        .from('price_history')
        .select('price, timestamp')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching price history:', error);
        setIsLoading(false);
        return;
      }

      const formattedData = (data as PriceHistory[]).map((record) => {
        const date = new Date(record.timestamp);
        let displayTime;
        
        if (timeframe === '7D') {
          displayTime = date.toLocaleDateString(undefined, { weekday: 'short' });
        } else if (timeframe === '24H') {
          displayTime = date.toLocaleTimeString([], { 
            hour: 'numeric',
            minute: '2-digit',
            hour12: true 
          });
        } else {
          displayTime = date.toLocaleTimeString([], { 
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
        }

        return {
          timestamp: record.timestamp,
          displayTime,
          price: record.price
        };
      });

      // Add current price point
      if (formattedData.length > 0) {
        const now = new Date();
        formattedData.push({
          timestamp: now.toISOString(),
          displayTime: timeframe === '7D'
            ? now.toLocaleDateString(undefined, { weekday: 'short' })
            : now.toLocaleTimeString([], { 
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }),
          price: currentPrice
        });
      }

      setPriceData(formattedData);
      setIsLoading(false);
    };

    fetchPriceHistory();
    const intervalId = setInterval(fetchPriceHistory, 30000);

    return () => clearInterval(intervalId);
  }, [timeframe, currentPrice]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="h-6 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-[400px] w-full bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">Loading chart...</p>
        </div>
      </div>
    );
  }

  if (priceData.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <span className="text-3xl font-semibold block mb-1">${currentPrice.toFixed(2)}</span>
          <span className="text-gray-500 text-sm">No price change data</span>
        </div>
        <div className="h-[400px] w-full bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-400">No price history available</p>
        </div>
      </div>
    );
  }

  const minPrice = Math.min(...priceData.map(d => d.price));
  const maxPrice = Math.max(...priceData.map(d => d.price));
  const priceRange = maxPrice - minPrice;
  const yAxisDomain = [
    minPrice - (priceRange * 0.1), // Add 10% padding to bottom
    maxPrice + (priceRange * 0.1)  // Add 10% padding to top
  ];

  return (
    <div className="space-y-4">
      <div>
        <span className="text-3xl font-semibold block mb-1">${currentPrice.toFixed(2)}</span>
        <div className={isPriceUp ? 'text-green-600' : 'text-red-600'}>
          <span className="text-sm font-medium">
            {isPriceUp ? '↑' : '↓'} ${Math.abs(priceChange.value).toFixed(2)} 
            <span className="ml-1">({priceChange.percentage.toFixed(2)}%)</span>
          </span>
        </div>
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={priceData} 
            margin={{ top: 20, right: 30, bottom: 20, left: 40 }}
          >
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop 
                  offset="5%" 
                  stopColor={isPriceUp ? "#22c55e" : "#ef4444"} 
                  stopOpacity={0.1}
                />
                <stop 
                  offset="95%" 
                  stopColor={isPriceUp ? "#22c55e" : "#ef4444"} 
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="displayTime"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              minTickGap={30}
            />
            <YAxis 
              domain={yAxisDomain}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                padding: '8px 12px'
              }}
              labelStyle={{ color: '#6b7280', marginBottom: '4px' }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
              labelFormatter={(label) => label}
            />
            <ReferenceLine
              y={priceData[0].price}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPriceUp ? "#22c55e" : "#ef4444"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: 'white', strokeWidth: 2 }}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};