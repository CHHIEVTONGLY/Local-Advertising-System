export type WalletType = {
  wallet: {
    balance: number;
    userId: string;
  };
};

export type WalletHistoryType = {
  id: string;
  orderId: string;
  type: "Deposit" | "Refund" | "Deduction";
  amount: number;
  createdAt: Date;
};

export interface WalletHistoryPayload {
  data: WalletHistoryType[];
}
