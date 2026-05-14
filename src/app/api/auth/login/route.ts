import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';

// 用户登录
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    // 查询用户
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 检查会员状态
    let membershipType = user.membership_type;
    if (user.membership_expire_at && new Date(user.membership_expire_at) < new Date()) {
      membershipType = 'free';
      // 更新过期会员为免费用户
      await supabaseAdmin
        .from('users')
        .update({ membership_type: 'free' })
        .eq('id', user.id);
    }

    // 生成简单 token (实际生产环境应使用 JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        membership_type: membershipType,
        membership_expire_at: user.membership_expire_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '登录失败，请稍后重试' },
      { status: 500 }
    );
  }
}
