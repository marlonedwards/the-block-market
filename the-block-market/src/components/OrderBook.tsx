
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const buyOrders = [
  { price: 8.45, quantity: 2 },
  { price: 8.40, quantity: 3 },
  { price: 8.35, quantity: 1 },
];

const sellOrders = [
  { price: 8.55, quantity: 1 },
  { price: 8.60, quantity: 2 },
  { price: 8.65, quantity: 1 },
];

export const OrderBook = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Price</TableHead>
          <TableHead>Quantity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sellOrders.map((order, i) => (
          <TableRow key={`sell-${i}`}>
            <TableCell className="text-warning">${order.price}</TableCell>
            <TableCell>{order.quantity}</TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell colSpan={2} className="text-center border-y border-border/40">
            $8.50
          </TableCell>
        </TableRow>
        {buyOrders.map((order, i) => (
          <TableRow key={`buy-${i}`}>
            <TableCell className="text-success">${order.price}</TableCell>
            <TableCell>{order.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
