"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Crown,
  Check,
  X,
  Loader2,
  CreditCard,
  Sparkles,
} from "lucide-react";

interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  membership_type: string;
  membership_expire_at: string | null;
}

export default function MembershipPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }
    fetchUserInfo();
  }, [router]);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      } else {
        router.push("/auth");
      }
    } catch {
      router.push("/auth");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productType: "monthly" | "yearly") => {
    if (!user) return;
    setPaying(productType);

    try {
      // 创建订单
      const createRes = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productType }),
      });
      const createData = await createRes.json();

      if (!createData.success) {
        alert("创建订单失败: " + createData.error);
        return;
      }

      // 模拟支付（生产环境跳转到真实支付页面）
      const payRes = await fetch("/api/payment/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo: createData.order.orderNo, paymentMethod: "mock" }),
      });
      const payData = await payRes.json();

      if (payData.success) {
        alert("支付成功！您已成为会员");
        fetchUserInfo();
      } else {
        alert("支付失败: " + payData.error);
      }
    } catch (error) {
      console.error("支付异常:", error);
      alert("支付失败，请重试");
    } finally {
      setPaying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isMember = user?.membership_type !== "free";
  const expireDate = user?.membership_expire_at
    ? new Date(user.membership_expire_at).toLocaleDateString("zh-CN")
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md mb-4">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-800">会员中心</span>
          </div>
          <p className="text-gray-600">
            {isMember
              ? `您是${user?.membership_type === "yearly" ? "年度" : "月度"}会员，有效期至 ${expireDate}`
              : "升级会员，解锁全部功能"}
          </p>
        </div>

        {/* 会员权益对比 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* 免费用户 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-2">免费用户</h3>
            <p className="text-3xl font-bold text-gray-900 mb-4">
              ¥0<span className="text-sm font-normal text-gray-500">/永久</span>
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">每日 3 次生成</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-5 h-5 text-gray-300" />
                <span className="text-gray-400">导出 PDF/Word</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-5 h-5 text-gray-300" />
                <span className="text-gray-400">历史记录云同步</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-5 h-5 text-gray-300" />
                <span className="text-gray-400">专属客服支持</span>
              </li>
            </ul>
            {user?.membership_type === "free" && (
              <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2">
                当前套餐
              </div>
            )}
          </div>

          {/* 月度会员 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-indigo-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm">
              推荐
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">月度会员</h3>
            <p className="text-3xl font-bold text-indigo-600 mb-4">
              ¥19<span className="text-sm font-normal text-gray-500">/月</span>
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">无限次生成</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">导出 PDF/Word</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">历史记录云同步</span>
              </li>
              <li className="flex items-center gap-2">
                <X className="w-5 h-5 text-gray-300" />
                <span className="text-gray-400">专属客服支持</span>
              </li>
            </ul>
            <button
              onClick={() => handlePurchase("monthly")}
              disabled={paying !== null || user?.membership_type === "monthly"}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {paying === "monthly" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : user?.membership_type === "monthly" ? (
                "当前套餐"
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  立即开通
                </>
              )}
            </button>
          </div>

          {/* 年度会员 */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 shadow-lg text-white relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              省 ¥60
            </div>
            <h3 className="text-lg font-bold mb-2">年度会员</h3>
            <p className="text-3xl font-bold mb-4">
              ¥168<span className="text-sm font-normal opacity-80">/年</span>
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-300" />
                <span>无限次生成</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-300" />
                <span>导出 PDF/Word</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-300" />
                <span>历史记录云同步</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-300" />
                <span>专属客服支持</span>
              </li>
            </ul>
            <button
              onClick={() => handlePurchase("yearly")}
              disabled={paying !== null || user?.membership_type === "yearly"}
              className="mt-6 w-full bg-white hover:bg-gray-100 disabled:bg-gray-300 text-indigo-600 rounded-lg py-3 font-medium transition-colors flex items-center justify-center gap-2"
            >
              {paying === "yearly" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : user?.membership_type === "yearly" ? (
                "当前套餐"
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  立即开通
                </>
              )}
            </button>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← 返回首页
          </button>
        </div>

        {/* 说明 */}
        <div className="mt-8 bg-white/50 rounded-xl p-6 text-center text-sm text-gray-600">
          <p className="mb-2">
            当前为模拟支付环境，点击立即开通即可直接成为会员
          </p>
          <p>生产环境请接入微信支付或支付宝</p>
        </div>
      </div>
    </div>
  );
}
