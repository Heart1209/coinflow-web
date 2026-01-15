"use client";

import { useState, useEffect } from "react";
import PriceChart from "@/components/PriceChart";

interface CryptoData {
  price: number;
  change24h: number;
}

interface CryptoPrices {
  bitcoin: CryptoData;
  ethereum: CryptoData;
}

export default function Home() {
  // 默认数据作为兜底
  const defaultData: CryptoPrices = {
    bitcoin: {
      price: 64200,
      change24h: 2.45,
    },
    ethereum: {
      price: 3450,
      change24h: 1.82,
    },
  };

  const [cryptoData, setCryptoData] = useState<CryptoPrices>(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        // 并行请求 BTC 和 ETH 的价格数据
        const [btcResponse, ethResponse] = await Promise.all([
          fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"),
          fetch("https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT"),
        ]);

        if (!btcResponse.ok || !ethResponse.ok) {
          throw new Error("API request failed");
        }

        const btcData = await btcResponse.json();
        const ethData = await ethResponse.json();

        setCryptoData({
          bitcoin: {
            price: parseFloat(btcData.lastPrice) || defaultData.bitcoin.price,
            change24h: parseFloat(btcData.priceChangePercent) || defaultData.bitcoin.change24h,
          },
          ethereum: {
            price: parseFloat(ethData.lastPrice) || defaultData.ethereum.price,
            change24h: parseFloat(ethData.priceChangePercent) || defaultData.ethereum.change24h,
          },
        });
      } catch (error) {
        console.error("Failed to fetch crypto prices:", error);
        // 使用默认数据作为兜底
        setCryptoData(defaultData);
      } finally {
        setIsLoading(false);
      }
    };

    // 立即执行一次
    fetchPrices();

    // 每1秒轮询一次（秒级刷新）
    const interval = setInterval(fetchPrices, 1000);

    // 组件卸载时清理 interval
    return () => clearInterval(interval);
  }, []);

  // 格式化价格为美元，保留2位小数
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // 格式化涨跌幅百分比
  const formatChange = (change: number): string => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome to CoinFlow Exchange</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Bitcoin Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Bitcoin</h2>
            <span className="text-sm text-slate-400">BTC</span>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-slate-100">
              {isLoading ? "加载中..." : formatPrice(cryptoData.bitcoin.price)}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  cryptoData.bitcoin.change24h >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {formatChange(cryptoData.bitcoin.change24h)}
              </span>
              <span className="text-sm text-slate-400">24h</span>
            </div>
            <div className="text-sm text-slate-400 mt-4">
              Market Cap: $1.26T
            </div>
          </div>
        </div>

        {/* Ethereum Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">Ethereum</h2>
            <span className="text-sm text-slate-400">ETH</span>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-slate-100">
              {isLoading ? "加载中..." : formatPrice(cryptoData.ethereum.price)}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  cryptoData.ethereum.change24h >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {formatChange(cryptoData.ethereum.change24h)}
              </span>
              <span className="text-sm text-slate-400">24h</span>
            </div>
            <div className="text-sm text-slate-400 mt-4">
              Market Cap: $414.5B
            </div>
          </div>
        </div>

        {/* 24h Volume Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-100">24h Volume</h2>
            <span className="text-sm text-slate-400">USD</span>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-slate-100">$89.5B</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-400">Active</span>
              <span className="text-sm text-slate-400">Live</span>
            </div>
            <div className="text-sm text-slate-400 mt-4">
              Top Pair: BTC/USDT
            </div>
          </div>
        </div>
      </div>

      {/* Bitcoin Price Chart Section */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <PriceChart />
      </div>
    </div>
  );
}
