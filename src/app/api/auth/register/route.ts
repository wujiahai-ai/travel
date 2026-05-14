import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';

// 用户注册
export async function POST(request: NextRequest) {
  try {
    const { email, password, nickname } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: '密码长度至少6位' },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已注册' },
        { status: 400 }
      );
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        nickname: nickname || email.split('@')[0],
        membership_type: 'free',
        daily_generate_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Create user error:', error);
      return NextResponse.json(
        { success: false, error: '注册失败，请稍后重试' },
        { status: 500 }
      );
    }

    // 生成 token
    const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
        membership_type: newUser.membership_type,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试' },
      { status: 500 }
    );
  }
}
