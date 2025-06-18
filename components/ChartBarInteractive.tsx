"use client";

import * as React from "react";
import { io, Socket } from "socket.io-client";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

const socket: Socket = io("http://localhost:8000");

interface AlertData {
  date: string;
  high: number;
  medium: number;
  low: number;
}

const initialChartData: AlertData[] = [
  { date: "2025-06-01", high: 10, medium: 25, low: 50 },
  { date: "2025-06-02", high: 8, medium: 20, low: 45 },
  { date: "2025-06-03", high: 15, medium: 30, low: 60 },
  { date: "2025-06-04", high: 12, medium: 28, low: 55 },
  { date: "2025-06-05", high: 20, medium: 35, low: 70 },
  { date: "2025-06-06", high: 18, medium: 22, low: 48 },
  { date: "2025-06-07", high: 14, medium: 27, low: 52 },
  { date: "2025-06-08", high: 16, medium: 33, low: 65 },
  { date: "2025-06-09", high: 9, medium: 19, low: 40 },
  { date: "2025-06-10", high: 11, medium: 26, low: 58 },
  { date: "2025-06-11", high: 17, medium: 31, low: 62 },
  { date: "2025-06-12", high: 13, medium: 24, low: 53 },
  { date: "2025-06-13", high: 19, medium: 29, low: 67 },
  { date: "2025-06-14", high: 10, medium: 21, low: 49 },
  { date: "2025-06-15", high: 8, medium: 23, low: 51 },
  { date: "2025-06-16", high: 15, medium: 30, low: 60 },
  { date: "2025-06-17", high: 22, medium: 35, low: 75 },
  { date: "2025-06-18", high: 14, medium: 27, low: 55 },
];

const chartConfig: ChartConfig = {
  alerts: {
    label: "Alerts",
  },
  high: {
    label: "High Severity",
    color: "hsl(0, 40%, 50%)", // Red, matching ICMP from area chart
  },
  medium: {
    label: "Medium Severity",
    color: "hsl(210, 40%, 50%)", // Blue, matching TCP from area chart
  },
  low: {
    label: "Low Severity",
    color: "hsl(120, 40%, 50%)", // Green, matching UDP from area chart
  },
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

export function ChartBarInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [selectedSeverities, setSelectedSeverities] = React.useState(["high", "medium", "low"]);
  const [chartData, setChartData] = React.useState<AlertData[]>(initialChartData);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  React.useEffect(() => {
    socket.on("alert_distribution", (data: { date: string; high: number; medium: number; low: number }) => {
      setChartData((prev) => {
        const existingIndex = prev.findIndex((item) => item.date === data.date);
        let newData: AlertData[];
        if (existingIndex !== -1) {
          newData = [...prev];
          newData[existingIndex] = data;
        } else {
          newData = [...prev, data].slice(-90);
        }
        return newData;
      });
    });

    return () => {
      socket.off("alert_distribution");
    };
  }, []);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2025-06-18");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Alert Severity Distribution</CardTitle>
        <CardDescription className="mb-6">
          <span className="hidden @[540px]/card:block">
            Distribution of alert severities for the selected time range
          </span>
          <span className="@[540px]/card:hidden">Selected severities and time</span>
        </CardDescription>
        <div className="flex flex-row gap-4 justify-between items-center flex-wrap mt-4">
          <div>
            <ToggleGroup
              type="multiple"
              value={selectedSeverities}
              onValueChange={setSelectedSeverities}
              variant="outline"
              className="flex flex-wrap gap-2"
            >
              <ToggleGroupItem value="high">High</ToggleGroupItem>
              <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
              <ToggleGroupItem value="low">Low</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div>
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={setTimeRange}
              variant="outline"
              className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
            >
              <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
              <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
              <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="flex w-40 *:data-[slot=select-value]:block *:data-[slot=select-value]:truncate @[767px]/card:hidden"
                size="sm"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Last 3 months" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  Last 3 months
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart data={filteredData}>
            <defs>
              {Object.keys(chartConfig).filter(key => key !== 'alerts').map(severity => (
                <linearGradient key={severity} id={`fill${severity.charAt(0).toUpperCase() + severity.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig[severity].color}
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig[severity].color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={{ value: "Alert Count", angle: -90, position: "insideLeft" }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="line"
                />
              }
            />
            {selectedSeverities.map(severity => (
              <Bar
                key={severity}
                dataKey={severity}
                fill={`url(#fill${severity.charAt(0).toUpperCase() + severity.slice(1)})`}
                radius={[4, 4, 0, 0]}
                stackId="a"
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}