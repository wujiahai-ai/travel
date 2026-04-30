import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import bcrypt from "bcryptjs";

// 管理员登录
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 查询管理员
    const { data, error } = await client
      .from("admin_users")
      .select("id, username, password_hash")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      throw new Error(`查询管理员失败: ${error.message}`);
    }

    if (!data) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, data.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    // 生成简单 token（实际生产环境建议用 JWT）
    const token = Buffer.from(`${data.id}:${Date.now()}`).toString("base64");

    return NextResponse.json({
      success: true,
      token,
      username: data.username,
    });
  } catch (error) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
