import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  ShoppingBag,
  AlertTriangle,
  Package,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AiChatMessage } from '../../types';
import { calculateReorderRecommendation, getStockStatus } from '../../utils/forecasting';

interface AiAssistantViewProps {
  onOpenCreatePO: (supplierId?: string, productId?: string) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ onOpenCreatePO }) => {
  const { products, sales, suppliers, purchaseOrders, kpis, businessProfile } = useStore();

  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! I am **StockSense AI**, your intelligent supply chain and inventory advisor.

I have full operational awareness of your catalog of **${products.length} products**, sales velocity across **${sales.length} transactions**, and pending vendor orders.

Here are a few questions you can ask me:
- *Which products must I reorder today to avoid stockouts?*
- *What is my current total inventory value and tied-up capital?*
- *Which products are slow-moving or overstocked?*
- *How much purchasing budget is required for upcoming supplier replenishment?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Suggested prompt pills
  const promptPills = [
    'Which products should I reorder today?',
    'What items are overstocked or not selling?',
    'Show total inventory value by category',
    'Which products are likely to run out next week?',
    'How much replenishment budget do I need?',
  ];

  // Prepare condensed store context snapshot for Gemini
  const prepareStoreSnapshot = () => {
    const criticalProducts = products
      .map((p) => calculateReorderRecommendation(p, sales))
      .filter((r) => r.priority === 'critical' || r.priority === 'high')
      .map((r) => ({
        sku: r.product.sku,
        name: r.product.name,
        currentStock: r.currentStock,
        daysLeft: r.daysOfStockLeft,
        burnRate: r.avgDailySales,
        leadTimeDays: r.leadTimeDays,
        supplier: r.product.supplierName,
        reorderQty: r.recommendedOrderQty,
        cost: r.estimatedCost,
      }));

    const overstocked = products
      .filter((p) => getStockStatus(p) === 'overstocked')
      .map((p) => ({
        sku: p.sku,
        name: p.name,
        stock: p.currentStock,
        dailySales: p.avgDailySales,
        tiedCost: p.currentStock * p.purchaseCost,
      }));

    return {
      storeName: businessProfile.businessName,
      businessType: businessProfile.businessType,
      currency: businessProfile.currency,
      kpis,
      criticalReorderItems: criticalProducts,
      overstockedItems: overstocked,
      supplierList: suppliers.map((s) => ({
        name: s.name,
        leadTimeDays: s.leadTimeDays,
        rating: s.rating,
      })),
      pendingPurchaseOrders: purchaseOrders
        .filter((po) => po.status === 'Ordered')
        .map((po) => ({
          poNumber: po.orderNumber,
          supplier: po.supplierName,
          expectedDate: po.expectedDeliveryDate,
          total: po.totalAmount,
        })),
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMessage: AiChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-5),
          storeContext: prepareStoreSnapshot(),
        }),
      });

      const data = await response.json();
      const replyText = data.reply || data.error || 'I could not analyze your inventory data right now.';

      const botMessage: AiChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('AI chat failed:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered a temporary connection issue. Please verify your network and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto h-[calc(100vh-5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="/stocksense-logo.jpeg"
            alt="StockSense AI"
            className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30 shadow-md shadow-emerald-900/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">StockSense AI Assistant</h2>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                Intelligence Engine
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Grounded exclusively in {businessProfile.businessName} inventory & sales data
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'msg_welcome',
                role: 'assistant',
                content: `Chat session cleared. How can I assist with your inventory planning today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
        {promptPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pill)}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 whitespace-nowrap transition-colors"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 overflow-hidden'
                }`}
              >
                {isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <img src="/stocksense-logo.jpeg" alt="StockSense" className="w-full h-full object-cover" />
                )}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-none prose-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <span
                  className={`text-[10px] block mt-2 ${
                    isUser ? 'text-emerald-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 rounded-tl-none flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span>Analyzing stock numbers, lead times, and replenishment schedules...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white p-2 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask anything about stock levels, reorder points, sales, or suppliers..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 placeholder-slate-400"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl shadow-sm transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
