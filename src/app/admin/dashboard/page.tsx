"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, Trash2, Eye, LogOut, Plane, Users, MapPin, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface TravelRecord {
  id: number;
  device_uuid: string;
  destination: string;
  start_date: string;
  end_date: string;
  travelers: string;
  trip_type: string;
  preferences: string | null;
  result_content: Record<string, unknown> | null;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<TravelRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin");
    }
  }, [router]);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        keyword,
      });
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/travel-records?${params}`);
      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("获取记录失败:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, startDate, endDate]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      fetchRecords();
    }
  }, [fetchRecords]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");
    router.push("/admin");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/travel-records?id=${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteId(null);
        fetchRecords();
      }
    } catch (error) {
      console.error("删除失败:", error);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 头部 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">旅行规划管理后台</h1>
                <p className="text-sm text-slate-500">
                  欢迎，{localStorage.getItem("adminUsername") || "管理员"}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Plane className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">总记录数</p>
                  <p className="text-2xl font-bold">{total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">热门目的地</p>
                  <p className="text-lg font-bold truncate">
                    {records.length > 0
                      ? [...new Set(records.map((r) => r.destination))][0] || "暂无数据"
                      : "暂无数据"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">总出行人数</p>
                  <p className="text-2xl font-bold">
                    {records.reduce((sum, r) => sum + parseInt(r.travelers || "0"), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索过滤 */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              筛选查询
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>关键字搜索</Label>
                <Input
                  placeholder="目的地、设备ID、类型..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                />
              </div>
              <div className="space-y-2">
                <Label>开始日期</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>结束日期</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setKeyword("");
                    setStartDate("");
                    setEndDate("");
                    setPage(1);
                  }}
                  className="flex-1"
                >
                  重置
                </Button>
                <Button onClick={() => setPage(1)} className="flex-1">
                  搜索
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 记录列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              规划记录列表
              <Badge variant="secondary" className="ml-2">{total} 条</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                暂无记录
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-600">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">设备ID</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">目的地</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">旅行日期</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">人数</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">类型</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">创建时间</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm">{record.id}</td>
                          <td className="py-3 px-4 text-sm font-mono text-xs text-slate-500">
                            {record.device_uuid.substring(0, 16)}...
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{record.destination}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {record.start_date} ~ {record.end_date}
                          </td>
                          <td className="py-3 px-4 text-sm">{record.travelers}人</td>
                          <td className="py-3 px-4">
                            <Badge variant="secondary">{record.trip_type}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500">
                            {formatDate(record.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedRecord(record)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(record.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                      第 {page} / {totalPages} 页，共 {total} 条
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="px-3 py-1 bg-slate-100 rounded text-sm">
                        {page} / {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* 详情弹窗 */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>规划详情 - {selectedRecord?.destination}</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-500">设备ID</Label>
                  <p className="font-mono text-sm mt-1">{selectedRecord.device_uuid}</p>
                </div>
                <div>
                  <Label className="text-slate-500">旅行类型</Label>
                  <p className="mt-1">{selectedRecord.trip_type}</p>
                </div>
                <div>
                  <Label className="text-slate-500">旅行日期</Label>
                  <p className="mt-1">{selectedRecord.start_date} ~ {selectedRecord.end_date}</p>
                </div>
                <div>
                  <Label className="text-slate-500">出行人数</Label>
                  <p className="mt-1">{selectedRecord.travelers}人</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-slate-500">特殊需求</Label>
                  <p className="mt-1">{selectedRecord.preferences || "无"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-slate-500">创建时间</Label>
                  <p className="mt-1">{formatDate(selectedRecord.created_at)}</p>
                </div>
              </div>

              {selectedRecord.result_content && (
                <div className="pt-4 border-t">
                  <Label className="text-slate-500 mb-2 block">规划内容</Label>
                  <pre className="bg-slate-50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedRecord.result_content, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">确定要删除这条记录吗？此操作不可恢复。</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  删除中...
                </>
              ) : (
                "确认删除"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
