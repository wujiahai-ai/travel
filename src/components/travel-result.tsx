"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Utensils, Package, Calendar, DollarSign, Lightbulb, Check, RefreshCw, Clock, Star, Copy, CheckCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TravelResultProps {
  rawContent: string;
  onReset: () => void;
}

interface ParsedResult {
  summary?: string;
  itinerary?: Array<{
    day: number;
    title: string;
    morning: string;
    afternoon: string;
    evening: string;
    tips: string;
  }>;
  attractions?: Array<{
    name: string;
    description: string;
    recommendedTime: string;
    highlights: string[];
    ticket: string;
  }>;
  foodRecommendations?: Array<{
    name: string;
    type: string;
    priceRange: string;
    specialties: string[];
    location: string;
  }>;
  packingList?: {
    documents: string[];
    clothing: string[];
    electronics: string[];
    toiletries: string[];
    medicine: string[];
    others: string[];
  };
  budget?: {
    transportation: string;
    accommodation: string;
    food: string;
    attractions: string;
    total: string;
  };
  tips?: string[];
}

export function TravelResult({ rawContent, onReset }: TravelResultProps) {
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const parseContent = useCallback(() => {
    try {
      // 尝试找到JSON内容
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        setParsed(data);
      } else {
        // 如果无法解析JSON，尝试解析为可读文本
        setParsed({ summary: rawContent } as ParsedResult);
      }
    } catch {
      // 如果JSON解析失败，尝试清理文本
      const cleaned = rawContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      try {
        const data = JSON.parse(cleaned);
        setParsed(data);
      } catch {
        // 如果仍然失败，保存原始内容
        setParsed({ summary: rawContent } as ParsedResult);
      }
    }
  }, [rawContent]);

  useEffect(() => {
    parseContent();
  }, [parseContent]);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!parsed) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 工具栏 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Check className="w-3 h-3 mr-1" />
            攻略已生成
          </Badge>
        </div>
        <Button onClick={onReset} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          重新规划
        </Button>
      </div>

      {/* 概览 */}
      {parsed.summary && (
        <Card className="bg-gradient-to-r from-orange-50 to-rose-50 border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Star className="w-5 h-5" />
              旅行概览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed">{parsed.summary}</p>
          </CardContent>
        </Card>
      )}

      {/* 主内容区 */}
      <Tabs defaultValue="itinerary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-lg">
          <TabsTrigger value="itinerary" className="py-3 data-[state=active]:bg-white">
            <Calendar className="w-4 h-4 mr-2" />
            行程规划
          </TabsTrigger>
          <TabsTrigger value="attractions" className="py-3 data-[state=active]:bg-white">
            <MapPin className="w-4 h-4 mr-2" />
            景点推荐
          </TabsTrigger>
          <TabsTrigger value="food" className="py-3 data-[state=active]:bg-white">
            <Utensils className="w-4 h-4 mr-2" />
            美食推荐
          </TabsTrigger>
          <TabsTrigger value="packing" className="py-3 data-[state=active]:bg-white">
            <Package className="w-4 h-4 mr-2" />
            行李清单
          </TabsTrigger>
        </TabsList>

        {/* 行程规划 */}
        <TabsContent value="itinerary" className="space-y-4">
          <div className="grid gap-4">
            {parsed.itinerary?.map((day, index) => (
              <Card key={index} className="overflow-hidden border-l-4 border-l-orange-500">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-500 text-white font-bold">
                        D{day.day}
                      </div>
                      <CardTitle className="text-xl">{day.title}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(day, null, 2), index)}
                      className="gap-1"
                    >
                      {copiedIndex === index ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedIndex === index ? "已复制" : "复制"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                        <span className="text-lg">🌅</span> 上午
                      </div>
                      <p className="text-sm text-muted-foreground">{day.morning}</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-600 font-medium mb-2">
                        <span className="text-lg">☀️</span> 下午
                      </div>
                      <p className="text-sm text-muted-foreground">{day.afternoon}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 text-purple-600 font-medium mb-2">
                        <span className="text-lg">🌙</span> 晚上
                      </div>
                      <p className="text-sm text-muted-foreground">{day.evening}</p>
                    </div>
                  </div>
                  {day.tips && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5" />
                      <p className="text-sm text-amber-800">{day.tips}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 景点推荐 */}
        <TabsContent value="attractions" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {parsed.attractions?.map((attr, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        {attr.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="w-3 h-3" />
                          {attr.recommendedTime}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {attr.ticket}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{attr.description}</p>
                  {attr.highlights && attr.highlights.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">亮点推荐：</p>
                      <div className="flex flex-wrap gap-2">
                        {attr.highlights.map((h, i) => (
                          <Badge key={i} variant="secondary" className="bg-orange-50 text-orange-700">
                            {h}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 美食推荐 */}
        <TabsContent value="food" className="space-y-4">
          <div className="grid gap-4">
            {parsed.foodRecommendations?.map((food, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-orange-100">
                      <Utensils className="w-6 h-6 text-rose-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{food.name}</h3>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {food.priceRange}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{food.type}</Badge>
                        <span className="text-sm text-muted-foreground">{food.location}</span>
                      </div>
                      {food.specialties && food.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {food.specialties.map((s, i) => (
                            <Badge key={i} variant="secondary" className="bg-rose-50 text-rose-700">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 行李清单 */}
        <TabsContent value="packing" className="space-y-6">
          {/* 清单列表 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parsed.packingList?.documents && parsed.packingList.documents.length > 0 && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                    <span className="text-xl">📄</span> 证件类
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parsed.packingList.documents.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {parsed.packingList?.clothing && parsed.packingList.clothing.length > 0 && (
              <Card className="border-purple-200 bg-purple-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                    <span className="text-xl">👕</span> 衣物类
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parsed.packingList.clothing.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-purple-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {parsed.packingList?.electronics && parsed.packingList.electronics.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                    <span className="text-xl">📱</span> 电子设备
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parsed.packingList.electronics.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-amber-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {parsed.packingList?.toiletries && parsed.packingList.toiletries.length > 0 && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-green-700">
                    <span className="text-xl">🧴</span> 洗漱用品
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parsed.packingList.toiletries.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {parsed.packingList?.medicine && parsed.packingList.medicine.length > 0 && (
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-red-700">
                    <span className="text-xl">💊</span> 常备药品
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parsed.packingList.medicine.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {parsed.packingList?.others && parsed.packingList.others.length > 0 && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                    <span className="text-xl">📦</span> 其他物品
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {parsed.packingList.others.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-orange-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* 预算估算 */}
      {parsed.budget && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <DollarSign className="w-5 h-5" />
              预算估算
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">交通</p>
                <p className="text-lg font-semibold text-blue-600">{parsed.budget.transportation}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">住宿</p>
                <p className="text-lg font-semibold text-purple-600">{parsed.budget.accommodation}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">餐饮</p>
                <p className="text-lg font-semibold text-amber-600">{parsed.budget.food}</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground mb-1">景点</p>
                <p className="text-lg font-semibold text-rose-600">{parsed.budget.attractions}</p>
              </div>
              <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-sm text-white">
                <p className="text-sm opacity-90 mb-1">总预算</p>
                <p className="text-xl font-bold">{parsed.budget.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 旅行小贴士 */}
      {parsed.tips && parsed.tips.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <Lightbulb className="w-5 h-5" />
              旅行小贴士
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {parsed.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-200 text-amber-800 text-sm font-medium shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 流式加载动画组件
export function LoadingSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/6" />
        </div>
      </CardContent>
    </Card>
  );
}
