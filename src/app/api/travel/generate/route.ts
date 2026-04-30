import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { destination, startDate, endDate, travelers, tripType, preferences } = await request.json();

    if (!destination) {
      return NextResponse.json({ error: "目的地不能为空" }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const start = new Date(startDate).toLocaleDateString("zh-CN");
    const end = new Date(endDate).toLocaleDateString("zh-CN");

    const prompt = `你是一位专业的旅行规划师。请为以下旅行信息生成一份详细的旅行攻略：

**旅行信息：**
- 目的地：${destination}
- 出发日期：${start}
- 返程日期：${end}
- 出行人数：${travelers || 1}人
- 旅行类型：${tripType || "常规旅行"}
- 特殊偏好：${preferences || "无特殊要求"}

请按以下JSON格式返回旅行攻略（只返回JSON，不要其他内容）：

{
  "summary": "整体旅行概述（100字以内）",
  "itinerary": [
    {
      "day": 1,
      "title": "第1天行程主题",
      "morning": "上午安排",
      "afternoon": "下午安排",
      "evening": "晚上安排",
      "tips": "当天小贴士"
    }
  ],
  "attractions": [
    {
      "name": "景点名称",
      "description": "景点简介",
      "recommendedTime": "建议游玩时长",
      "highlights": ["亮点1", "亮点2"],
      "ticket": "门票信息"
    }
  ],
  "foodRecommendations": [
    {
      "name": "餐厅/美食名称",
      "type": "类型（餐厅/小吃/特色）",
      "priceRange": "价格范围",
      "specialties": ["特色菜1", "特色菜2"],
      "location": "位置"
    }
  ],
  "packingList": {
    "documents": ["证件类物品"],
    "clothing": ["衣物类物品"],
    "electronics": ["电子设备"],
    "toiletries": ["洗漱用品"],
    "medicine": ["常备药品"],
    "others": ["其他物品"]
  },
  "budget": {
    "transportation": "交通预算估算",
    "accommodation": "住宿预算估算",
    "food": "餐饮预算估算",
    "attractions": "景点门票预算估算",
    "total": "总预算估算"
  },
  "tips": ["旅行小贴士1", "旅行小贴士2", "旅行小贴士3"]
}

请确保JSON格式正确，可以被解析。`;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messages: Array<{ role: "user"; content: string }> = [
            { role: "user", content: prompt }
          ];

          const aiStream = client.stream(messages as Parameters<typeof client.stream>[0], {
            model: "doubao-seed-2-0-lite-260215",
            temperature: 0.7,
          });

          for await (const chunk of aiStream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(chunk.content.toString()));
            }
          }
          controller.close();
        } catch {
          controller.enqueue(encoder.encode(JSON.stringify({ error: "生成失败，请重试" })));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
