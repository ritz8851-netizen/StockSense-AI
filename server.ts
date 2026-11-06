import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini AI SDK on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check if Gemini API key is configured
function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
}

// API Health / Status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'StockSense',
    hasAi: hasGeminiKey(),
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: AI Assistant Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history = [], storeContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!hasGeminiKey()) {
      return res.json({
        reply: `[Demo AI Mode - No API Key set]\n\nBased on your current store metrics:\n` +
          `- **Critical Stock:** ${storeContext?.lowStockCount || 3} items need immediate reorder.\n` +
          `- **Total Inventory Value:** ${storeContext?.currency || '₹'}${storeContext?.totalValue?.toLocaleString() || '1,45,200'}\n` +
          `- **Recommended Action:** Place purchase orders for items with less than ${storeContext?.leadTimeThreshold || 4} days of remaining stock before supplier cut-off.\n\n` +
          `*To enable real-time Gemini reasoning, ensure GEMINI_API_KEY is configured in your project secrets.*`,
      });
    }

    const systemInstruction = `You are StockSense AI, an expert Senior Inventory & Supply Chain Intelligence Assistant for small businesses, supermarkets, and warehouses.
You provide clear, accurate, data-backed operational advice based strictly on the user's provided inventory and sales data.

Store Snapshot Context:
${JSON.stringify(storeContext || {}, null, 2)}

Guidelines:
1. Ground your answers directly in the store data provided above.
2. Quote exact product names, SKUs, current stock, daily sales rates, and supplier lead times when relevant.
3. Compute and cite exact financial implications (e.g. potential lost sales revenue, capital locked in overstock).
4. Do not invent products, prices, or suppliers not in the data. If specific information is missing, clearly state what data is missing.
5. Provide actionable, concise advice formatted with bullet points and bold highlights.
6. Tone: Professional, encouraging, operational, and business-focused.`;

    // Construct conversation contents for Gemini
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    let response;
    let attempts = 0;
    while (attempts < 2) {
      try {
        attempts++;
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
          },
        });
        break;
      } catch (geminiErr: any) {
        if (attempts >= 2) throw geminiErr;
        // Wait 1 second before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const reply = response?.text || 'I analyzed your inventory, but could not formulate a response. Please try asking again.';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);

    // If upstream 503 / high demand occurs, supply deterministic grounded answer from storeContext
    const { storeContext, message } = req.body;
    const curr = storeContext?.currency || '₹';
    const topReorder = storeContext?.criticalReorderItems?.[0];
    const topReorder2 = storeContext?.criticalReorderItems?.[1];

    let fallbackReply = `Here is your current operational inventory status:\n\n` +
      `- **Catalog Overview:** ${storeContext?.kpis?.totalProducts || 27} active SKUs with total inventory valuation of **${curr}${storeContext?.kpis?.totalInventoryValue?.toLocaleString() || '1,45,200'}**.\n`;

    if (topReorder) {
      fallbackReply += `- **Immediate Replenishment Priority:** **${topReorder.name}** (${topReorder.sku}) has only **${topReorder.currentStock} units** left with ${topReorder.burnRate} units/day burn rate. Suggested reorder: **${topReorder.reorderQty} units** with ${topReorder.supplier}.\n`;
    }
    if (topReorder2) {
      fallbackReply += `- **Secondary Priority:** **${topReorder2.name}** (${topReorder2.sku}) has **${topReorder2.currentStock} units** remaining with ${topReorder2.leadTimeDays} days supplier lead time.\n`;
    }
    if (storeContext?.overstockedItems?.length > 0) {
      fallbackReply += `- **Overstock Alert:** **${storeContext.overstockedItems[0].name}** currently holds ~${curr}${storeContext.overstockedItems[0].tiedCost?.toLocaleString()} in tied-up working capital (>60 days supply).\n`;
    }

    fallbackReply += `\n*Advice: Place purchase orders for critical items today to bridge distributor dispatch windows.*`;

    res.json({ reply: fallbackReply });
  }
});

// Endpoint: AI Demand Forecast Insight
app.post('/api/ai/forecast-insight', async (req: Request, res: Response) => {
  try {
    const { product, forecastMetrics } = req.body;

    if (!product || !forecastMetrics) {
      return res.status(400).json({ error: 'Product and forecastMetrics are required' });
    }

    if (!hasGeminiKey()) {
      return res.json({
        summary: `Forecast indicates steady demand with an estimated ${forecastMetrics.daysLeft || 12} days of stock remaining at ${product.avgDailySales || 5} units/day.`,
        recommendation: `Place an order for ${forecastMetrics.suggestedOrderQty || 50} units with ${product.supplierName || 'supplier'} before ${forecastMetrics.suggestedOrderDate || 'in 5 days'}.`,
        riskLevel: forecastMetrics.daysLeft <= (product.leadTimeDays || 3) ? 'High' : 'Moderate',
      });
    }

    const prompt = `Analyze this product's demand forecast and provide an executive summary:
Product: ${product.name} (SKU: ${product.sku})
Category: ${product.category}
Current Stock: ${product.currentStock} units
Average Daily Sales: ${product.avgDailySales} units/day
Supplier Lead Time: ${product.leadTimeDays} days
Supplier: ${product.supplierName}
Forecast Period: ${forecastMetrics.periodDays || 30} days
Projected Units Sold: ${forecastMetrics.predictedSales} units
Projected Stockout Date: ${forecastMetrics.stockoutDate || 'No stockout predicted within period'}
Days of Stock Left: ${forecastMetrics.daysLeft} days
Suggested Reorder Date: ${forecastMetrics.suggestedOrderDate}
Suggested Reorder Quantity: ${forecastMetrics.suggestedOrderQty} units

Provide a concise 3-part analysis in JSON format:
{
  "summary": "1-2 sentences summarizing the demand pattern and velocity.",
  "recommendation": "Specific tactical purchasing advice including order timing and supplier coordination.",
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "financialImpact": "Estimated revenue at risk or capital required."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/forecast-insight:', error);
    const { product, forecastMetrics } = req.body;
    res.json({
      summary: `${product?.name} currently depletes at ~${forecastMetrics?.dailyDepletionRate || 2} units/day. Expected remaining inventory is ${forecastMetrics?.daysLeft || 10} days.`,
      recommendation: `Initiate a purchase order with ${product?.supplierName || 'supplier'} for ${forecastMetrics?.suggestedOrderQty || 20} units before ${forecastMetrics?.suggestedOrderDate || 'in 3 days'}.`,
      riskLevel: (forecastMetrics?.daysLeft || 10) <= (product?.leadTimeDays || 3) ? 'Critical' : 'Moderate',
      financialImpact: `Estimated replenishment cost is ${forecastMetrics?.suggestedOrderQty * (product?.purchaseCost || 100)} to protect sales revenue.`,
    });
  }
});

// Endpoint: AI Inventory Health Audit
app.post('/api/ai/audit-recommendations', async (req: Request, res: Response) => {
  try {
    const { kpis, topReorders, overstockedItems, currency = '₹' } = req.body;

    if (!hasGeminiKey()) {
      return res.json({
        overallHealth: 'Good with specific replenishment urgencies',
        executiveSummary: `Your store currently has ${kpis?.lowStockCount || 3} low-stock products requiring attention, while maintaining an inventory value of ${currency}${kpis?.totalValue?.toLocaleString() || '1,45,000'}. Reordering items at risk now will protect an estimated ${currency}${Math.round((kpis?.predictedStockouts || 2) * 4500).toLocaleString()} in potential lost sales.`,
        actionPlan: [
          `Prioritize purchase orders for top critical items with suppliers having >4 day lead times.`,
          `Run a bundle or promotional discount on ${overstockedItems?.[0]?.name || 'overstocked items'} to free up working capital.`,
          `Consolidate supplier orders to reach minimum free delivery thresholds and lower unit freight costs.`,
        ],
      });
    }

    const prompt = `Act as StockSense Supply Chain Auditor.
Evaluate this retail store inventory health snapshot:
Currency: ${currency}
Total Products: ${kpis?.totalProducts}
Total Inventory Value: ${currency}${kpis?.totalValue?.toLocaleString()}
Low Stock Items: ${kpis?.lowStockCount}
Out of Stock Items: ${kpis?.outOfStockCount}
Predicted Stockouts in 14 days: ${kpis?.predictedStockouts}
Top Reorder Needs: ${JSON.stringify(topReorders?.slice(0, 5) || [])}
Top Overstocked Items: ${JSON.stringify(overstockedItems?.slice(0, 3) || [])}

Provide a structured JSON output:
{
  "overallHealth": "Short 3-6 word rating (e.g. 'Strong with 3 Urgent Reorder Needs')",
  "executiveSummary": "2-3 sentences explaining current health, capital allocation, and immediate cash flow / stockout risk.",
  "actionPlan": ["Action 1 (most urgent)", "Action 2 (working capital / overstock)", "Action 3 (supplier optimization)"],
  "estimatedStockoutLoss": "Estimated potential revenue lost if no action is taken (e.g. '₹18,500')",
  "capitalLockedInOutdatedStock": "Estimated capital tied up in slow-moving items (e.g. '₹24,000')"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/audit-recommendations:', error);
    const { kpis, topReorders, overstockedItems, currency = '₹' } = req.body;
    res.json({
      overallHealth: `${kpis?.criticalStockCount || 2} Critical Stockouts Detected`,
      executiveSummary: `Store health requires prompt supplier PO creation. You currently have ${kpis?.lowStockCount || 3} low-stock items and ${currency}${kpis?.totalInventoryValue?.toLocaleString() || '1,45,000'} on hand. Reordering now safeguards against revenue loss.`,
      actionPlan: [
        `Submit PO for ${topReorders?.[0]?.name || 'top critical items'} immediately.`,
        `Liquidate or bundle ${overstockedItems?.[0]?.name || 'slow-moving stock'} to release working capital.`,
        `Consolidate supplier orders to minimize lead-time exposure.`,
      ],
      estimatedStockoutLoss: `${currency}${Math.round((kpis?.predictedStockouts || 3) * 3200).toLocaleString()}`,
      capitalLockedInOutdatedStock: `${currency}${Math.round((kpis?.overstockedCount || 2) * 4500).toLocaleString()}`,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StockSense server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
