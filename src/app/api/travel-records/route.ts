import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 获取旅行记录列表（支持分页和模糊搜索）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const keyword = searchParams.get("keyword") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const client = getSupabaseClient();
    let query = client
      .from("travel_records")
      .select("id, device_uuid, destination, start_date, end_date, travelers, trip_type, preferences, result_content, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    // 关键字模糊搜索
    if (keyword) {
      query = query.or(
        `destination.ilike.%${keyword}%,device_uuid.ilike.%${keyword}%,trip_type.ilike.%${keyword}%`
      );
    }

    // 日期范围过滤
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate + "T23:59:59");
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("查询失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}

// 删除旅行记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "记录ID不能为空" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();
    const { error } = await client
      .from("travel_records")
      .delete()
      .eq("id", parseInt(id));

    if (error) {
      throw new Error(`删除失败: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("删除失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
