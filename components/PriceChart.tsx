"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ChartDataPoint {
  date: string;
  value: number;
}

export default function PriceChart() {
  const [period, setPeriod] = useState<string>("1D");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 将 period 转换为 Binance API 需要的 interval 和 limit 参数
  const getBinanceParams = (period: string): { interval: string; limit: number } => {
    const periodMap: { [key: string]: { interval: string; limit: number } } = {
      "1D": { interval: "5m", limit: 288 },   // 1天: 每5分钟一个点，288个点
      "1W": { interval: "1h", limit: 168 },    // 1周: 每小时一个点，168个点
      "1M": { interval: "4h", limit: 180 },    // 1月: 每4小时一个点，180个点
      "1Y": { interval: "1d", limit: 365 },    // 1年: 每天一个点，365个点
    };
    return periodMap[period] || periodMap["1D"];
  };

  // 格式化日期/时间用于 X 轴显示
  const formatXAxisLabel = (dateStr: string, period: string): string => {
    const date = new Date(dateStr);
    if (period === "1D") {
      // 1D: 显示时间 HH:mm
      return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
    } else if (period === "1W") {
      // 1W: 显示日期和时间 MM-DD HH:mm
      return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
    } else {
      // 其他: 显示日期 MM-DD
      return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
    }
  };

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true);
      try {
        const { interval, limit } = getBinanceParams(period);
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`
        );

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const data: any[][] = await response.json();

        // 转换数据格式：Binance 返回 [timestamp, open, high, low, close, ...]
        // 提取 index 0 (时间戳) 和 index 4 (收盘价)
        const formattedData: ChartDataPoint[] = data.map((kline) => ({
          date: new Date(kline[0]).toISOString(), // index 0: 时间戳
          value: parseFloat(kline[4]), // index 4: 收盘价
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [period]);

  const periods = [
    { label: "1D", value: "1D" },
    { label: "1W", value: "1W" },
    { label: "1M", value: "1M" },
    { label: "1Y", value: "1Y" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-100">Bitcoin (BTC) Price Trend</h2>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                period === p.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <div className="h-[350px] flex items-center justify-center text-slate-400">
          加载中...
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[350px] flex items-center justify-center text-slate-400">
          暂无数据
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => formatXAxisLabel(value, period)}
            />
            <YAxis
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              labelStyle={{ color: "#cbd5e1" }}
              formatter={(value: number) => [`$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Price"]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
