"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import WalletFilterDropdown from "@/app/components/history/wallet/TypeFilter";
import DateRangeQueryFilter from "@/app/components/history/wallet/DataRangeFilter";
import { useSearchParams } from "next/navigation";
import type { TransactionPayload, Transaction } from "@/app/types/Transaction";
import ExportButton from "@/app/components/common/ExcelExport";

type WalletTxType = "Deposit" | "Refund" | "Deduction";
type WalletTx = {
  id: string;
  orderId?: string;
  type: WalletTxType;
  amount: number;
  createdAt: string;
};

export default function WalletHistory() {
  return (
    <Suspense
      fallback={<div className="p-3 text-sm text-slate-500">Loading…</div>}
    >
      <WalletHistoryInner />
    </Suspense>
  );
}

function WalletHistoryInner() {
  const [transactions, setTransactions] = useState<WalletTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<"All" | WalletTxType>("All");

  const searchParams = useSearchParams();
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";

  useEffect(() => {
    let ignore = false;

    const fetchTx = async () => {
      try {
        setLoading(true);
        setError("");

        const url = new URL(
          "/api/wallets/transactions/me",
          window.location.origin
        );
        if (selectedType !== "All")
          url.searchParams.set("type", selectedType.toLowerCase());
        if (search.trim()) url.searchParams.set("q", search.trim());
        if (startDate) url.searchParams.set("startDate", startDate);
        if (endDate) url.searchParams.set("endDate", endDate);

        const res = await fetch(url.toString(), {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `HTTP ${res.status}`);
        }

        const payload: TransactionPayload = await res.json();

        const toUiType = (t: Transaction["type"]): WalletTxType =>
          t === "deposit" ? "Deposit" : t === "refund" ? "Refund" : "Deduction";

        const list: WalletTx[] = payload.transactions.map((t) => ({
          id: t._id,
          orderId: t.orderId,
          type: toUiType(t.type),
          amount: Number(t.amount),
          createdAt: t.createdAt,
        }));

        if (!ignore) setTransactions(list);
      } catch (e: unknown) {
        if (!ignore)
          setError(
            e instanceof Error ? e.message : "Failed to load transactions"
          );
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchTx();
    return () => {
      ignore = true;
    };
  }, [selectedType, search, startDate, endDate]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType =
        selectedType === "All" ||
        tx.type.toLowerCase() === selectedType.toLowerCase();
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        tx.id.toLowerCase().includes(q) ||
        (tx.orderId?.toLowerCase().includes(q) ?? false);
      return matchesType && matchesSearch;
    });
  }, [transactions, selectedType, search]);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="p-2.5">
          <div className="flex gap-1">
            <Wallet size={28} />
            <h1 className="text-2xl font-bold">Wallet History</h1>
          </div>
        </div>

        <div className="flex p-3 gap-2.5">
          <Input
            type="text"
            placeholder="Search by Order ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <WalletFilterDropdown
            selected={selectedType}
            onSelect={(value) =>
              setSelectedType(
                value as "All" | "Deposit" | "Refund" | "Deduction"
              )
            }
          />
          {/* Filter Date Range */}
          <DateRangeQueryFilter />

          {/* Export Excel Data  */}
          <ExportButton
            data={filtered}
            filename={`transactions_${new Date().toISOString().slice(0, 10)}`}
            sheetName="Transactions"
            fileType="xlsx" // or "csv"
            buttonLabel="Export Excel"
            columns={[
              { key: "id", header: "ID" },
              { key: "orderId", header: "Order ID" },
              { key: "type", header: "Type" },
              { key: "amount", header: "Amount", formatter: (v) => Number(v) },
              {
                key: "createdAt",
                header: "Created At",
                formatter: (v) => new Date(v).toLocaleString(),
              },
            ]}
          />
        </div>

        <div className="p-3 space-y-2">
          {loading && <div className="text-sm text-slate-500">Loading…</div>}
          {error && !loading && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {!loading &&
            !error &&
            filtered.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{tx.orderId ?? tx.id}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs px-2 py-1 rounded bg-slate-100">
                    {tx.type}
                  </span>
                  <span
                    className={
                      tx.type === "Deposit" || tx.type === "Refund"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {tx.type === "Deposit" || tx.type === "Refund"
                      ? `+$${tx.amount.toFixed(2)}`
                      : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </span>
                </div>
              </div>
            ))}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-sm text-slate-500">No results.</div>
          )}
        </div>
      </div>
    </div>
  );
}
