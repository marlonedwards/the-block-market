
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '9:00', price: 8.2 },
  { time: '10:00', price: 8.3 },
  { time: '11:00', price: 8.4 },
  { time: '12:00', price: 8.35 },
  { time: '13:00', price: 8.45 },
  { time: '14:00', price: 8.5 },
];

interface PriceChartProps {
  timeframe: string;
}

export const PriceChart = ({ timeframe }: PriceChartProps) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <XAxis dataKey="time" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#2A85FF"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
