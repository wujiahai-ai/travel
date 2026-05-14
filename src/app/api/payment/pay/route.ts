import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

// 模拟支付接口（开发测试用）
// 生产环境请替换为真实支付（微信/支付宝）

export async function POST(request: NextRequest) {
  try {
    const { orderNo, paymentMethod } = await request.json();

    if (!orderNo) {
      return NextResponse.json(
        { success: false, error: "缺少订单号" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 查询订单
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("order_no", orderNo)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: "订单不存在" },
        { status: 404 }
      );
    }

    if (order.status === "paid") {
      return NextResponse.json(
        { success: false, error: "订单已支付" },
        { status: 400 }
      );
    }

    // ========== 模拟支付 ==========
    // 生产环境请替换为真实支付逻辑
    
    // 模拟支付成功
    const paidAt = new Date().toISOString();
    
    // 更新订单状态
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_method: paymentMethod || "mock",
        paid_at: paidAt,
      })
      .eq("order_no", orderNo);

    if (updateError) {
      console.error("更新订单失败:", updateError);
      return NextResponse.json(
        { success: false, error: "支付失败" },
        { status: 500 }
      );
    }

    // 更新用户会员状态
    const membershipType = order.product_type; // monthly 或 yearly
    const expireAt = new Date();
    if (membershipType === "monthly") {
      expireAt.setMonth(expireAt.getMonth() + 1);
    } else if (membershipType === "yearly") {
      expireAt.setFullYear(expireAt.getFullYear() + 1);
    }

    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        membership_type: membershipType,
        membership_expire_at: expireAt.toISOString(),
      })
      .eq("id", order.user_id);

    if (userUpdateError) {
      console.error("更新会员状态失败:", userUpdateError);
    }

    return NextResponse.json({
      success: true,
      message: "支付成功",
      membership: {
        type: membershipType,
        expireAt: expireAt.toISOString(),
      },
    });

    // ========== 真实支付代码示例 ==========
    // 
    // 微信支付：
    // const wxPay = new WxPay({ ... });
    // const result = await wxPay.transactions_native({
    //   description: `旅行攻略${membershipType === 'monthly' ? '月度' : '年度'}会员`,
    //   out_trade_no: orderNo,
    //   amount: { total: Math.round(order.amount * 100), currency: 'CNY' },
    // });
    // return NextResponse.json({ success: true, qrCode: result.code_url });
    //
    // 支付宝：
    // const alipay = new Alipay({ ... });
    // const result = alipay.pageExec('alipay.trade.page.pay', {
    //   outTradeNo: orderNo,
    //   totalAmount: order.amount.toString(),
    //   subject: `旅行攻略会员`,
    // });
    // return NextResponse.json({ success: true, payUrl: result });
  } catch (error) {
    console.error("支付异常:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
