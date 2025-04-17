
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CampaignPerformance = () => {
  const data = [
    { name: "Email", revenue: 4000, roi: 240 },
    { name: "SMS", revenue: 3000, roi: 198 },
    { name: "Social", revenue: 2000, roi: 120 },
    { name: "Google", revenue: 2780, roi: 168 },
    { name: "Referral", revenue: 1890, roi: 142 },
  ];

  const config = {
    revenue: {
      label: "Revenue ($)",
      theme: { light: "#8b5cf6", dark: "#a78bfa" }
    },
    roi: {
      label: "ROI (%)",
      theme: { light: "#ec4899", dark: "#f472b6" }
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Campaign Performance</CardTitle>
        <CardDescription>
          Revenue and ROI by campaign channel
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="var(--color-revenue)" />
                <Bar yAxisId="right" dataKey="roi" fill="var(--color-roi)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignPerformance;
