"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Trash2, Eye, Share2 } from "lucide-react";

interface TravelRecord {
  id: number;
  device_uuid: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: string;
  trip_type: string;
  preferences: string;
  result_content: any;
  created_at: string;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
    if (token) {
      fetchRecords(token);
    } else {
      fetchRecordsByDevice();
    }
  }, []);

  const fetchRecords = async (token: string) => {
    try {
      const res = await fetch("/api/travel-records?page=1&pageSize=50", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRecordsByDevice = async () => {
    let deviceId = localStorage.getItem("deviceUuid");
    if (!deviceId) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/travel-records?deviceId=${deviceId}&page=1&pageSize=50`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: number) => {
    if (!confirm("确定要删除这条记录吗？")) return;
    try {
      const res = await fetch(`/api/travel-records/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setRecords(records.filter(r => r.id !== id));
      }
    } catch {
      alert("删除失败");
    }
  };

  const shareRecord = async (record: TravelRecord) => {
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          travelData: {
            destination: record.destination,
            startDate: record.start_date,
            endDate: record.end_date,
            travelers: record.travelers,
            tripType: record.trip_type,
            ...record.result_content
          }
        }),
      });
      const data = await res.json();
      if (data.success) {
        await navigator.clipboard.writeText(data.shareUrl);
        alert("分享链接已复制！");
      }
    } catch {
      alert("分享失败");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50 flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">我的旅行记录</h1>
            <p className="text-slate-500 mt-1">
              {user ? `欢迎，${user.nickname || user.email}` : "查看您生成的所有旅行攻略"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline">生成新攻略</Button>
            </Link>
            {user && (
              <Link href="/membership">
                <Button variant="outline">会员中心</Button>
              </Link>
            )}
          </div>
        </div>

        {/* 记录列表 */}
        {records.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 mb-4">暂无旅行记录</p>
              <Link href="/">
                <Button>立即生成攻略</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {records.map((record) => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-orange-500" />
                        <h3 className="text-xl font-semibold">{record.destination}</h3>
                        <Badge variant="secondary">{record.trip_type}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {record.start_date} ~ {record.end_date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {record.travelers}人
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(record.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {record.result_content?.summary && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          {record.result_content.summary}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          localStorage.setItem("viewRecord", JSON.stringify(record));
                          window.open(`/share/local?id=${record.id}`, "_blank");
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        查看
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => shareRecord(record)}>
                        <Share2 className="w-4 h-4 mr-1" />
                        分享
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => deleteRecord(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
