"use client";

import { Activity, LayoutDashboard, TrendingUp, Fish, MessageSquare, Wallet } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Market", icon: TrendingUp, path: "/market" },
  { name: "Whale Watch", icon: Fish, path: "/whale-watch" },
  { name: "AI Chat", icon: MessageSquare, path: "/ai-chat" },
  { name: "Portfolio", icon: Wallet, path: "/portfolio" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-slate-900 border-r border-slate-800 flex flex-col z-10">
      <div className="p-6 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-bold text-blue-500">CoinFlow</span>
        </Link>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-slate-800 text-blue-400"
                      : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
