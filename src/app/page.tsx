"use client";

import { useState, useRef, useCallback } from "react";
import { Plane, Sparkles } from "lucide-react";
import { TravelForm, TravelFormData } from "@/components/travel-form";
import { TravelResult, LoadingSkeleton } from "@/components/travel-result";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [hasResult, setHasResult] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async (data: TravelFormData) => {
    setIsLoading(true);
    setResult("");
    setHasResult(false);

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
  }, []);

  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setResult("");
    setHasResult(false);
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50">
      {/* 头部 */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10" />
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-3">
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
