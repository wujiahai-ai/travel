"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { TravelResult } from "@/components/travel-result";

export default function LocalRecordPage() {
  const searchParams = useSearchParams();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const recordStr = localStorage.getItem("viewRecord");
    if (recordStr) {
      setRecord(JSON.parse(recordStr));
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        加载中...
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">记录不存在</p>
          <a href="/history" className="text-orange-500 hover:underline">返回历史记录</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 py-8">
      <div className="container mx-auto px-4">
        <a href="/history" className="text-orange-500 hover:underline mb-4 inline-block">
          ← 返回历史记录
        </a>
        <TravelResult
          rawContent={JSON.stringify(record.result_content)}
          onReset={() => window.close()}
          travelData={{
            destination: record.destination,
            startDate: record.start_date,
            endDate: record.end_date,
            travelers: record.travelers,
            tripType: record.trip_type,
          }}
        />
      </div>
    </div>
  );
}
