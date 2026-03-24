"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Chart({ type, range, showStats }: any) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    current: 0,
    previous: 0,
    diff: 0,
  });

  useEffect(() => {
    fetch(`/api/chart?type=${type}&range=${range}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data);
        setStats(res.stats);
      });
  }, [type, range]);

  // 🌈 Gradient colors for bars
  const colors = ["#22c55e", "#3b82f6", "#a855f7"];

  return (
    <motion.div
      className="h-full w-full p-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ✅ STATS */}
      {showStats && (
        <div className="mb-3 flex gap-4 text-sm">
          <span>
            Current: <b>{stats.current}</b>
          </span>

          <span>
            Previous: <b>{stats.previous}</b>
          </span>

          <span
            className={
              stats.diff >= 0 ? "text-green-600" : "text-red-600"
            }
          >
            Diff: {stats.diff >= 0 ? `+${stats.diff}` : stats.diff}
          </span>
        </div>
      )}

      {/* ✅ NEON BAR CHART */}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
          barGap={8} // spacing between bars
        >
          {/* 💡 GLOW FILTER */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          <Bar
            dataKey="count"
            barSize={18} // ✅ thin bars
            radius={[6, 6, 0, 0]}
            isAnimationActive={true}
            animationDuration={1200}
            style={{
              filter: "url(#glow)",
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}