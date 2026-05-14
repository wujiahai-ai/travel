import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 创建订单
export async function POST(request: NextRequest) {
  try {
    const { userId, productType } = await request.json();

    if (!userId || !productType) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数" },
        { status: 400 }
      );
    }

    // 价格配置
    const priceMap: Record<string, number> = {
      monthly: 19,
      yearly: 168,
    };

    if (!priceMap[productType]) {
      return NextResponse.json(
        { success: false, error: "无效的产品类型" },
        { status: 400 }
      );
    }

    const amount = priceMap[productType];
    const orderNo = `ORD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const supabase = getSupabaseClient();

    // 创建订单
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        order_no: orderNo,
        product_type: productType,
        amount: amount,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("创建订单失败:", error);
      return NextResponse.json(
        { success: false, error: "创建订单失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: data.id,
        orderNo: data.order_no,
        productType: data.product_type,
        amount: data.amount,
        status: data.status,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error("创建订单异常:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
