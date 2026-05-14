import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/storage/database/supabase-client';

// 增加生成次数
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: true }); // 未登录用户不计数
    }

    const token = authHeader.substring(7);
    const decoded = Buffer.from(token, 'base64').toString();
    const [userId] = decoded.split(':');

    if (!userId) {
      return NextResponse.json({ success: true });
    }

    // 获取用户
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const today = new Date().toISOString().split('T')[0];
    const lastGenerateDate = user.last_generate_date
      ? new Date(user.last_generate_date).toISOString().split('T')[0]
      : null;

    let newCount = 1;
    if (lastGenerateDate === today) {
      newCount = user.daily_generate_count + 1;
    }

    // 更新计数
    await supabaseAdmin
      .from('users')
      .update({
        daily_generate_count: newCount,
        last_generate_date: today,
      })
      .eq('id', userId);

    return NextResponse.json({ success: true, count: newCount });
  } catch (error) {
    console.error('Update generate count error:', error);
    return NextResponse.json({ success: true });
  }
}
