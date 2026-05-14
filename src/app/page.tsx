"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Plane, Sparkles, User, LogOut, Crown } from "lucide-react";
import { TravelForm, TravelFormData } from "@/components/travel-form";
import { TravelResult, LoadingSkeleton } from "@/components/travel-result";
import { useRouter } from "next/navigation";

interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  membership_type: string;
  daily_generate_count: number;
  daily_limit: number;
  can_generate: boolean;
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [hasResult, setHasResult] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [deviceUuid, setDeviceUuid] = useState<string>("");
  const [reportStatus, setReportStatus] = useState<"idle" | "success" | "error">("idle");
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showLimitAlert, setShowLimitAlert] = useState(false);

  // 初始化设备 UUID
  useEffect(() => {
    let uuid = localStorage.getItem("deviceUuid");
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem("deviceUuid", uuid);
    }
    setDeviceUuid(uuid);
  }, []);

  // 加载用户信息
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch {
        // 忽略错误
      }
    };
    loadUser();
  }, []);

  // 登出
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleGenerate = useCallback(async (data: TravelFormData) => {
    // 检查生成次数限制
    if (user && !user.can_generate) {
      setShowLimitAlert(true);
      return;
    }

    setIsLoading(true);
    setResult("");
    setHasResult(false);
    setReportStatus("idle");
    setShowLimitAlert(false);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/travel/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("生成失败");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setResult(fullContent);
        }
      }

      setHasResult(true);

      // 增加生成次数
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/increment-count", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        // 更新本地用户状态
        if (user) {
          setUser({
            ...user,
            daily_generate_count: user.daily_generate_count + 1,
            can_generate: user.daily_generate_count + 1 < user.daily_limit,
          });
        }
      }

      // 上报规划记录
      await reportRecord(data, fullContent);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("请求已取消");
      } else {
        console.error("生成失败:", error);
        setResult("生成失败，请稍后重试");
        setHasResult(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 上报记录到后台
  const reportRecord = async (data: TravelFormData, content: string) => {
    // 获取或生成 deviceUuid
    let uuid = localStorage.getItem("deviceUuid");
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem("deviceUuid", uuid);
      setDeviceUuid(uuid);
    }

    try {
      // 尝试解析 JSON 内容
      let resultContent = null;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          resultContent = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // 解析失败时不存储详细内容
      }

      console.log("正在上报记录:", { uuid, destination: data.destination });
      
      const response = await fetch("/api/travel-records/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceUuid: uuid,
          destination: data.destination,
          startDate: data.startDate.split("T")[0],
          endDate: data.endDate.split("T")[0],
          travelers: data.travelers,
          tripType: data.tripType,
          preferences: data.preferences,
          resultContent,
          userId: user?.id, // 关联用户ID
        }),
      });

      const result = await response.json();
      console.log("上报结果:", result);

      if (response.ok && result.success) {
        setReportStatus("success");
      } else {
        console.error("上报失败:", result);
        setReportStatus("error");
      }
    } catch (error) {
      console.error("上报记录失败:", error);
      setReportStatus("error");
    }
  };

  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setResult("");
    setHasResult(false);
    setIsLoading(false);
    setReportStatus("idle");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      {/* 头部 */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10" />
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl shadow-lg shadow-orange-500/25">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
                  智能旅行规划助手
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  AI 驱动的个性化旅行攻略与行李清单生成
                </p>
              </div>
            </div>

            {/* 用户信息 */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/50">
                  {user.membership_type !== "free" && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.nickname}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.membership_type === "free" 
                        ? `今日剩余 ${user.daily_limit - user.daily_generate_count} 次`
                        : "会员无限次"}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {user.membership_type === "free" && (
                      <button
                        onClick={() => router.push("/membership")}
                        className="p-2 hover:bg-yellow-50 rounded-lg transition text-yellow-600"
                        title="升级会员"
                      >
                        <Crown className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="退出登录"
                    >
                      <LogOut className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => router.push("/auth")}
                  className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/50 hover:bg-white/80 transition"
                >
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">登录/注册</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容 */}
      <main className="container mx-auto px-4 py-8">
        {/* 特性展示 */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-sm">智能行程规划</p>
              <p className="text-xs text-muted-foreground">AI 定制最佳路线</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-sm">精选景点推荐</p>
              <p className="text-xs text-muted-foreground">发现独特体验</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-sm">行李清单</p>
              <p className="text-xs text-muted-foreground">不遗漏任何物品</p>
            </div>
          </div>
        </div>

        {/* 次数限制提示 */}
        {showLimitAlert && (
          <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">今日生成次数已用完</p>
            <p className="text-red-600 text-sm mt-1">
              升级会员可解锁无限次生成
              <button 
                onClick={() => router.push("/membership")}
                className="ml-2 underline hover:no-underline"
              >
                立即升级
              </button>
            </p>
          </div>
        )}

        {/* 上报状态提示 */}
        {reportStatus === "success" && (
          <div className="max-w-4xl mx-auto mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            规划已保存，可前往管理后台查看
          </div>
        )}
        {reportStatus === "error" && (
          <div className="max-w-4xl mx-auto mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            规划生成成功，但保存记录时出现问题
          </div>
        )}

        {/* 表单或结果 */}
        <div className="mb-8">
          {!hasResult ? (
            <TravelForm onGenerate={handleGenerate} isLoading={isLoading} />
          ) : isLoading ? (
            <LoadingSkeleton />
          ) : (
            <TravelResult rawContent={result} onReset={handleReset} />
          )}
        </div>

        {/* 加载状态下的流式内容 */}
        {isLoading && result && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="animate-spin">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-sm text-muted-foreground">正在生成您的专属攻略...</span>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm font-muted-foreground bg-muted/30 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                  {result}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 设备ID展示（调试用，生产环境可隐藏） */}
        {deviceUuid && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-slate-100 rounded-lg">
            <p className="text-xs text-slate-500">
              设备ID: <span className="font-mono">{deviceUuid}</span>
            </p>
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="border-t border-muted/20 bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            使用 AI 技术，为您打造专属旅行体验
          </p>
        </div>
      </footer>
    </div>
  );
}
