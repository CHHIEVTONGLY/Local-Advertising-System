"use client";

import { WalletHistoryPayload } from "@/app/types/WalletType";
import { exportExcelFromData } from "@/app/utils/excelExport";
import { Button } from "@/components/ui/button";

export default function ExportExcel(data: WalletHistoryPayload) {
  const handleDownload = () => {
    const now = new Date();
    const filename = `wallet_transactions_${now.toDateString()}.xlsx`;
    exportExcelFromData(data.data, filename, "Wallet Transactions");
  };

  return <Button onClick={handleDownload}>Download Excel</Button>;
}
