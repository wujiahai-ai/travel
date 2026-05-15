import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 创建分享记录
export async function POST(request: NextRequest) {
  try {
    const { travelData, deviceUuid, userId } = await request.json();

    if (!travelData) {
      return NextResponse.json({ success: false, error: '缺少旅行数据' }, { status: 400 });
    }

    // 生成分享码
    const shareCode = generateShareCode();

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('travel_records')
      .insert({
        device_uuid: deviceUuid || 'shared',
        destination: travelData.destination || '分享的旅行攻略',
        start_date: travelData.startDate,
        end_date: travelData.endDate,
        travelers: travelData.travelers,
        trip_type: travelData.tripType,
        preferences: travelData.preferences,
        result_content: travelData,
        user_id: userId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('创建分享记录失败:', error);
      return NextResponse.json({ success: false, error: '创建分享记录失败' }, { status: 500 });
    }

    // 构建分享链接
    const domain = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'http://localhost:5000';
    const shareUrl = `${domain}/share/${shareCode}?id=${data.id}`;

    return NextResponse.json({
      success: true,
      shareCode,
      shareUrl,
      recordId: data.id,
    });
  } catch (error) {
    console.error('分享失败:', error);
    return NextResponse.json({ success: false, error: '分享失败' }, { status: 500 });
  }
}

// 生成分享码
function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
