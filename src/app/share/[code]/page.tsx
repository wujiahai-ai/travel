'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { TravelResult } from '@/components/travel-result';

function ShareContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [travelData, setTravelData] = useState<any>(null);
  const [recordInfo, setRecordInfo] = useState<any>(null);

  useEffect(() => {
    const recordId = searchParams.get('id');
    if (!recordId) {
      setError('无效的分享链接');
      setLoading(false);
      return;
    }

    const fetchTravelData = async (id: string) => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('travel_records')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          setError('未找到该旅行攻略');
          setLoading(false);
          return;
        }

        setRecordInfo(data);
        setTravelData(data.result_content);
        setLoading(false);
      } catch {
        setError('加载失败，请稍后重试');
        setLoading(false);
      }
    };

    fetchTravelData(recordId);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">出错了</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 顶部信息栏 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <h1 className="font-bold text-slate-800">分享的旅行攻略</h1>
                <p className="text-xs text-slate-500">
                  目的地：{recordInfo?.destination || '未知'}
                </p>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              {recordInfo?.created_at 
                ? new Date(recordInfo.created_at).toLocaleDateString('zh-CN')
                : ''}
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <TravelResult 
          rawContent={JSON.stringify(travelData)} 
          onReset={() => {}}
        />
      </div>

      {/* 底部提示 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 py-3">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-600">
            由 <span className="font-semibold text-blue-600">AI 旅行攻略生成器</span> 创建
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
