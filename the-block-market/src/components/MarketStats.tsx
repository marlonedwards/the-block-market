
export const MarketStats = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-muted">24h Volume</span>
        <span className="font-medium">52 blocks</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted">24h High</span>
        <span className="font-medium">$8.75</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted">24h Low</span>
        <span className="font-medium">$8.25</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted">Active Orders</span>
        <span className="font-medium">23</span>
      </div>
    </div>
  );
};
