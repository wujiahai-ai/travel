import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: '缺少用户ID' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        id,
        created_at,
        travel_records (
          id,
          destination,
          start_date,
          end_date,
          travelers,
          trip_type,
          result_content,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取收藏失败:', error);
      return NextResponse.json({ success: false, error: '获取收藏失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, favorites: data });
  } catch (error) {
    console.error('获取收藏失败:', error);
    return NextResponse.json({ success: false, error: '获取收藏失败' }, { status: 500 });
  }
}

// 添加收藏
export async function POST(request: NextRequest) {
  try {
    const { userId, recordId } = await request.json();

    if (!userId || !recordId) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, record_id: recordId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, error: '已收藏' }, { status: 400 });
      }
      console.error('添加收藏失败:', error);
      return NextResponse.json({ success: false, error: '添加收藏失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, favorite: data });
  } catch (error) {
    console.error('添加收藏失败:', error);
    return NextResponse.json({ success: false, error: '添加收藏失败' }, { status: 500 });
  }
}

// 取消收藏
export async function DELETE(request: NextRequest) {
  try {
    const { userId, recordId } = await request.json();

    if (!userId || !recordId) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('record_id', recordId);

    if (error) {
      console.error('取消收藏失败:', error);
      return NextResponse.json({ success: false, error: '取消收藏失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('取消收藏失败:', error);
    return NextResponse.json({ success: false, error: '取消收藏失败' }, { status: 500 });
  }
}
