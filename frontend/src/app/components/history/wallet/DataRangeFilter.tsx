"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown } from "lucide-react";

function toDateString(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function label(from?: string, to?: string) {
  if (!from && !to) return "All dates";
  if (from && !to) return `${from} →`;
  if (!from && to) return `→ ${to}`;
  return `${from} → ${to}`;
}

export default function DateRangeQueryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qsFrom = searchParams.get("startDate") || "";
  const qsTo = searchParams.get("endDate") || "";

  const [from, setFrom] = React.useState(qsFrom);
  const [to, setTo] = React.useState(qsTo);

  React.useEffect(() => {
    setFrom(qsFrom);
    setTo(qsTo);
  }, [qsFrom, qsTo]);

  const pushParams = (nextFrom?: string, nextTo?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextFrom) params.set("startDate", nextFrom);
    else params.delete("startDate");
    if (nextTo) params.set("endDate", nextTo);
    else params.delete("endDate");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clear = () => pushParams(undefined, undefined);

  const preset = (kind: "today" | "last7" | "last30" | "thisMonth" | "all") => {
    const today = new Date();
    if (kind === "all") return clear();
    if (kind === "today") {
      const d = toDateString(today);
      setFrom(d);
      setTo(d);
      return pushParams(d, d);
    }
    if (kind === "last7") {
      const toStr = toDateString(today);
      const fromDt = new Date(today);
      fromDt.setDate(today.getDate() - 6);
      const fromStr = toDateString(fromDt);
      setFrom(fromStr);
      setTo(toStr);
      return pushParams(fromStr, toStr);
    }
    if (kind === "last30") {
      const toStr = toDateString(today);
      const fromDt = new Date(today);
      fromDt.setDate(today.getDate() - 29);
      const fromStr = toDateString(fromDt);
      setFrom(fromStr);
      setTo(toStr);
      return pushParams(fromStr, toStr);
    }
    if (kind === "thisMonth") {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      const fromStr = toDateString(first);
      const toStr = toDateString(today);
      setFrom(fromStr);
      setTo(toStr);
      return pushParams(fromStr, toStr);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-between gap-2 w-64"
        >
          <span className="flex items-center gap-2 truncate">
            <Calendar className="w-4 h-4" />
            <span className="truncate">
              {label(qsFrom || undefined, qsTo || undefined)}
            </span>
          </span>
          <ChevronDown className="w-4 h-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80">
        <div className="px-2 py-2">
          <div className="text-xs text-slate-500 mb-1.5">Quick ranges</div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => preset("today")}
            >
              Today
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => preset("last7")}
            >
              Last 7 days
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => preset("last30")}
            >
              Last 30 days
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => preset("thisMonth")}
            >
              This month
            </Button>
            <Button variant="ghost" size="sm" onClick={() => preset("all")}>
              All time
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="px-2 py-2">
          <div className="text-xs text-slate-500 mb-1.5">Custom range</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Start</label>
              <input
                type="date"
                value={from}
                max={to || undefined}
                onChange={(e) => setFrom(e.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">End</label>
              <input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => setTo(e.target.value)}
                className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={clear}>
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => pushParams(from || undefined, to || undefined)}
            >
              Apply
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
