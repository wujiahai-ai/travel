'use client';

import { useState } from 'react';

interface MapLocation {
  name: string;
  lat?: number;
  lng?: number;
}

interface MapIntegrationProps {
  destination: string;
  attractions?: Array<{ name: string; description?: string }>;
}

export default function MapIntegration({ destination, attractions }: MapIntegrationProps) {
  const [mapType, setMapType] = useState<'amap' | 'baidu'>('amap');
  const [searchQuery, setSearchQuery] = useState(destination);

  // 高德地图嵌入 URL
  const getAmapUrl = () => {
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://uri.amap.com/search?keyword=${encodedQuery}&src=travel-planner`;
  };

  // 百度地图嵌入 URL
  const getBaiduUrl = () => {
    const encodedQuery = encodeURIComponent(searchQuery);
    return `https://map.baidu.com/search/${encodedQuery}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h3 className="font-semibold text-white">地图导航</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMapType('amap')}
              className={`px-3 py-1 rounded text-sm transition ${
                mapType === 'amap'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              高德地图
            </button>
            <button
              onClick={() => setMapType('baidu')}
              className={`px-3 py-1 rounded text-sm transition ${
                mapType === 'baidu'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              百度地图
            </button>
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="p-4 bg-slate-50 border-b border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="输入地点搜索..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <a
            href={mapType === 'amap' ? getAmapUrl() : getBaiduUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>🔍</span>
            搜索
          </a>
        </div>
      </div>

      {/* 景点快捷导航 */}
      {attractions && attractions.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-slate-700 mb-3">📍 景点快捷导航</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {attractions.slice(0, 6).map((attr, idx) => (
              <a
                key={idx}
                href={mapType === 'amap' 
                  ? `https://uri.amap.com/search?keyword=${encodeURIComponent(attr.name)}&src=travel-planner`
                  : `https://map.baidu.com/search/${encodeURIComponent(attr.name)}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-slate-100 hover:bg-blue-50 rounded-lg text-sm text-slate-700 hover:text-blue-600 transition truncate"
                title={attr.name}
              >
                {attr.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 提示 */}
      <div className="px-4 py-3 bg-blue-50 border-t border-slate-200">
        <p className="text-xs text-blue-600 flex items-center gap-1">
          <span>💡</span>
          点击景点名称可在地图中查看详细位置和导航路线
        </p>
      </div>
    </div>
  );
}
