"use client";

import { useState } from "react";
import { Calendar, Users, MapPin, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays } from "date-fns";
import { zhCN } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface TravelFormProps {
  onGenerate: (data: TravelFormData) => void;
  isLoading: boolean;
}

export interface TravelFormData {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  tripType: string;
  preferences: string;
}

export function TravelForm({ onGenerate, isLoading }: TravelFormProps) {
  const [destination, setDestination] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), 7),
    to: addDays(new Date(), 10),
  });
  const [travelers, setTravelers] = useState(2);
  const [tripType, setTripType] = useState("常规旅行");
  const [preferences, setPreferences] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !dateRange?.from || !dateRange?.to) return;

    onGenerate({
      destination,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
      travelers,
      tripType,
      preferences,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">
            智能旅行规划
          </CardTitle>
        </div>
        <p className="text-muted-foreground">
          输入您的旅行信息，AI 将为您生成专属的旅行攻略和行李清单
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 目的地 */}
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              旅行目的地
            </Label>
            <Input
              id="destination"
              placeholder="例如：云南大理、日本东京、泰国曼谷"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="h-12 text-base"
              required
            />
          </div>

          {/* 日期选择 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              旅行时间
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-12 text-base justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "yyyy年MM月dd日", { locale: zhCN })} -{" "}
                        {format(dateRange.to, "yyyy年MM月dd日", { locale: zhCN })}
                      </>
                    ) : (
                      format(dateRange.from, "yyyy年MM月dd日", { locale: zhCN })
                    )
                  ) : (
                    "选择出发和返回日期"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={zhCN}
                  disabled={{ before: new Date() }}
                  className="rounded-lg border shadow-lg"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* 出行人数和旅行类型 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="travelers" className="flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                出行人数
              </Label>
              <Select
                value={travelers.toString()}
                onValueChange={(v) => setTravelers(parseInt(v))}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} 人
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tripType" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                旅行类型
              </Label>
              <Select value={tripType} onValueChange={setTripType}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="常规旅行">常规旅行</SelectItem>
                  <SelectItem value="亲子游">亲子游</SelectItem>
                  <SelectItem value="蜜月旅行">蜜月旅行</SelectItem>
                  <SelectItem value="闺蜜游">闺蜜游</SelectItem>
                  <SelectItem value="独自旅行">独自旅行</SelectItem>
                  <SelectItem value="商务旅行">商务旅行</SelectItem>
                  <SelectItem value="探险旅行">探险旅行</SelectItem>
                  <SelectItem value="文化之旅">文化之旅</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 特殊偏好 */}
          <div className="space-y-2">
            <Label htmlFor="preferences" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              特殊需求（可选）
            </Label>
            <Textarea
              id="preferences"
              placeholder="例如：希望体验当地特色美食、喜欢自然风光、有老人小孩同行..."
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className="min-h-[100px] text-base resize-none"
            />
          </div>

          {/* 提交按钮 */}
          <Button
            type="submit"
            disabled={isLoading || !destination || !dateRange?.from || !dateRange?.to}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/25 transition-all duration-300"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">✨</span>
                正在生成专属攻略...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                开始规划我的旅行
                <ChevronRight className="w-5 h-5" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
