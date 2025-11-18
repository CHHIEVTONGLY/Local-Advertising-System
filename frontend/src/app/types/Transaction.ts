export type Transaction = {
  _id: string;
  orderId?: string;
  userId: string;
  walletId: string;
  amount: number;
  type: "deposit" | "refund" | "deduction";
  createdAt: string;
};

export interface TransactionPayload {
  transactions: Transaction[];
  total: number;
  page: number;
  pages: number;
}
