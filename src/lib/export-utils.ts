'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface TravelData {
  summary: string;
  itinerary: Array<{
    day: number;
    theme: string;
    morning?: string;
    afternoon?: string;
    evening?: string;
  }>;
  attractions: Array<{
    name: string;
    description: string;
    duration: string;
    highlights: string;
    ticket?: string;
  }>;
  food: Array<{
    name: string;
    type: string;
    price: string;
    specialty: string;
    location: string;
  }>;
  luggage: Array<{
    category: string;
    items: string[];
  }>;
  tips?: string[];
  budget?: {
    transportation: string;
    accommodation: string;
    food: string;
    tickets: string;
    total: string;
  };
}

// 导出为 PDF
export async function exportToPDF(data: TravelData, basicInfo?: { destination?: string; startDate?: string; endDate?: string; travelers?: string; tripType?: string }, filename: string = 'travel-plan.pdf'): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;
  const lineHeight = 7;

  const addLine = (text: string, fontSize: number = 12, isBold: boolean = false) => {
    if (y > pageHeight - margin - 20) {
      pdf.addPage();
      y = margin;
    }
    pdf.setFontSize(fontSize);
    if (isBold) {
      pdf.setFont('helvetica', 'bold');
    } else {
      pdf.setFont('helvetica', 'normal');
    }
    const lines = pdf.splitTextToSize(text, pageWidth - margin * 2);
    lines.forEach((line: string) => {
      pdf.text(line, margin, y);
      y += lineHeight;
    });
  };

  const addSection = (title: string) => {
    y += 5;
    pdf.setFillColor(59, 130, 246);
    pdf.rect(margin, y - 3, pageWidth - margin * 2, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin + 3, y + 3);
    pdf.setTextColor(0, 0, 0);
    y += 12;
  };

  // 标题
  pdf.setTextColor(30, 64, 175);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('旅行攻略', pageWidth / 2, y, { align: 'center' });
  y += 15;
  pdf.setTextColor(0, 0, 0);

  // 概述
  addSection('📋 行程概述');
  addLine(data.summary, 11);

  // 行程安排
  if (data.itinerary && data.itinerary.length > 0) {
    addSection('📅 行程安排');
    data.itinerary.forEach(day => {
      addLine(`第 ${day.day} 天 - ${day.theme}`, 12, true);
      if (day.morning) addLine(`  上午：${day.morning}`, 10);
      if (day.afternoon) addLine(`  下午：${day.afternoon}`, 10);
      if (day.evening) addLine(`  晚上：${day.evening}`, 10);
      y += 3;
    });
  }

  // 景点推荐
  if (data.attractions && data.attractions.length > 0) {
    addSection('🎯 景点推荐');
    data.attractions.forEach(attr => {
      addLine(`${attr.name}`, 12, true);
      addLine(`  ${attr.description}`, 10);
      addLine(`  游玩时长：${attr.duration} | 亮点：${attr.highlights}`, 10);
      if (attr.ticket) addLine(`  门票：${attr.ticket}`, 10);
      y += 3;
    });
  }

  // 美食推荐
  if (data.food && data.food.length > 0) {
    addSection('🍜 美食推荐');
    data.food.forEach(f => {
      addLine(`${f.name}（${f.type}）`, 11, true);
      addLine(`  招牌菜：${f.specialty} | 人均：${f.price}`, 10);
      addLine(`  地址：${f.location}`, 10);
      y += 2;
    });
  }

  // 行李清单
  if (data.luggage && data.luggage.length > 0) {
    addSection('🧳 行李清单');
    data.luggage.forEach(category => {
      addLine(`${category.category}`, 11, true);
      addLine(`  ${category.items.join('、')}`, 10);
      y += 2;
    });
  }

  // 旅行小贴士
  if (data.tips && data.tips.length > 0) {
    addSection('💡 旅行小贴士');
    data.tips.forEach(tip => {
      addLine(`• ${tip}`, 10);
    });
  }

  // 预算估算
  if (data.budget) {
    addSection('💰 预算估算');
    addLine(`交通：${data.budget.transportation}`, 10);
    addLine(`住宿：${data.budget.accommodation}`, 10);
    addLine(`餐饮：${data.budget.food}`, 10);
    addLine(`门票：${data.budget.tickets}`, 10);
    addLine(`总计：${data.budget.total}`, 12, true);
  }

  // 页脚
  pdf.setFontSize(9);
  pdf.setTextColor(128, 128, 128);
  pdf.text('由 AI 旅行攻略生成器创建', pageWidth / 2, pageHeight - 10, { align: 'center' });

  pdf.save(filename);
}

// 导出为图片
export async function exportToImage(elementId: string, filename: string = 'travel-plan.png'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
