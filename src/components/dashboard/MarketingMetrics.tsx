
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const MarketingMetrics = () => {
  const data = [
    { name: "Jan", visitors: 1400, leads: 240, conversions: 24 },
    { name: "Feb", visitors: 1600, leads: 318, conversions: 29 },
    { name: "Mar", visitors: 1800, leads: 372, conversions: 32 },
    { name: "Apr", visitors: 2400, leads: 560, conversions: 54 },
    { name: "May", visitors: 2200, leads: 448, conversions: 48 },
    { name: "Jun", visitors: 2800, leads: 680, conversions: 72 },
  ];
  
  const config = {
    visitors: {
      label: "Website Visitors",
      theme: { light: "#3b82f6", dark: "#60a5fa" }
    },
    leads: {
      label: "Leads Generated",
      theme: { light: "#10b981", dark: "#34d399" }
    },
    conversions: {
      label: "Conversions",
      theme: { light: "#f97316", dark: "#fb923c" }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Marketing Metrics</CardTitle>
        <CardDescription>
          Website traffic, leads, and conversions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stackId="1"
                  stroke="var(--color-visitors)"
                  fill="var(--color-visitors)"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stackId="1"
                  stroke="var(--color-leads)"
                  fill="var(--color-leads)"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stackId="1"
                  stroke="var(--color-conversions)"
                  fill="var(--color-conversions)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketingMetrics;
