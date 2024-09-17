import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "0%", value: 0 },
  { name: "25%", value: 25 },
  { name: "50%", value: 50 },
  { name: "75%", value: 75 },
  { name: "100%", value: 100 },
];

const LinearMeterChart = ({ value }) => {
  return (
    <div style={{ width: "100%", height: 100 }}>
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
          <ReferenceArea
            x1={value === 100 ? "100%" : "0%"}
            x2={value === 100 ? "100%" : "0%"}
            y1={0}
            y2={100}
            fill="rgba(255, 0, 0, 0.3)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LinearMeterChart;
