import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-client';

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = Buffer.from(token, 'base64').toString();
    const [userId] = decoded.split(':');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '无效的token' },
        { status: 401 }
      );
    }

    // 获取用户信息
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取会员权益
    const { data: benefits } = await supabaseAdmin
      .from('membership_benefits')
      .select('*')
      .eq('type', user.membership_type)
      .single();

    // 检查今日生成次数
    const today = new Date().toISOString().split('T')[0];
    const lastGenerateDate = user.last_generate_date
      ? new Date(user.last_generate_date).toISOString().split('T')[0]
      : null;

    let dailyCount = user.daily_generate_count;
    let dailyLimit = benefits?.daily_limit || 3;

    // 如果是新的一天，重置计数
    if (lastGenerateDate !== today) {
      dailyCount = 0;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        membership_type: user.membership_type,
        membership_expire_at: user.membership_expire_at,
        daily_generate_count: dailyCount,
        daily_limit: dailyLimit,
        can_generate: dailyCount < dailyLimit,
        can_export: benefits?.can_export || false,
        can_sync: benefits?.can_sync || false,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}
