import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 查询订单状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNo: string }> }
) {
  try {
    const { orderNo } = await params;

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_no", orderNo)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "订单不存在" },
        { status: 404 }
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
        paymentMethod: data.payment_method,
        paidAt: data.paid_at,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error("查询订单异常:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
