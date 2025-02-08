
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const transactions = [
  { time: "14:30", price: 8.50, quantity: 1 },
  { time: "14:15", price: 8.45, quantity: 2 },
  { time: "14:00", price: 8.50, quantity: 1 },
  { time: "13:45", price: 8.40, quantity: 1 },
];

export const RecentTransactions = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Quantity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx, i) => (
          <TableRow key={i}>
            <TableCell>{tx.time}</TableCell>
            <TableCell>${tx.price}</TableCell>
            <TableCell>{tx.quantity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
