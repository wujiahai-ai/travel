import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 上报旅行规划记录（供前端网站调用）
export async function POST(request: NextRequest) {
  try {
    const { deviceUuid, destination, startDate, endDate, travelers, tripType, preferences, resultContent } = await request.json();

    if (!deviceUuid || !destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from("travel_records")
      .insert({
        device_uuid: deviceUuid,
        destination,
        start_date: startDate,
        end_date: endDate,
        travelers: travelers?.toString() || "1",
        trip_type: tripType || "常规旅行",
        preferences: preferences || "",
        result_content: resultContent || null,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(`上报失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      id: data.id,
    });
  } catch (error) {
    console.error("上报失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
