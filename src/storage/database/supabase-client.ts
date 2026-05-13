import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 用户自己的 Supabase 配置
const SUPABASE_URL = 'https://lxoxrpothhlojqjrknqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4b3hycG90aGhsb2pxanJrbnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1NzE2ODUsImV4cCI6MjA5NDE0NzY4NX0.i0QAWdcVcF10rWlennMDgOtrLd_N7E_f1aCtYgRJ_XY';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4b3hycG90aGhsb2pxanJrbnF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU3MTY4NSwiZXhwIjoyMDk0MTQ3Njg1fQ.srwziUiEAW6Xzc1efPJoOroZCEjpM8i8v8PiIG5vmBU';

// 前端使用的客户端（anon key）
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// 后端使用的管理员客户端（service_role key）
export const supabaseAdmin: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

// 兼容旧代码的 getter 函数
export function getSupabaseClient(): SupabaseClient {
  return supabaseAdmin;
}

// 导出凭证供其他模块使用
export const supabaseCredentials = {
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
};
