"use client";

import * as React from "react";
import { io, Socket } from "socket.io-client";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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

interface TrafficData {
  date: string;
  tcp: number;
  udp: number;
  icmp: number;
  http: number;
}

const initialChartData: TrafficData[] = [
  { date: "2025-06-01", tcp: 220, udp: 150, icmp: 50, http: 100 },
  { date: "2025-06-02", tcp: 180, udp: 120, icmp: 40, http: 90 },
  { date: "2025-06-03", tcp: 250, udp: 200, icmp: 60, http: 110 },
  { date: "2025-06-04", tcp: 300, udp: 260, icmp: 70, http: 120 },
  { date: "2025-06-05", tcp: 320, udp: 280, icmp: 80, http: 130 },
  { date: "2025-06-06", tcp: 270, udp: 240, icmp: 55, http: 105 },
  { date: "2025-06-07", tcp: 290, udp: 260, icmp: 65, http: 115 },
  { date: "2025-06-08", tcp: 310, udp: 300, icmp: 75, http: 125 },
  { date: "2025-06-09", tcp: 200, udp: 180, icmp: 45, http: 95 },
  { date: "2025-06-10", tcp: 260, udp: 220, icmp: 60, http: 110 },
  { date: "2025-06-11", tcp: 340, udp: 310, icmp: 85, http: 135 },
  { date: "2025-06-12", tcp: 280, udp: 250, icmp: 70, http: 120 },
  { date: "2025-06-13", tcp: 350, udp: 320, icmp: 90, http: 140 },
  { date: "2025-06-14", tcp: 200, udp: 190, icmp: 50, http: 100 },
  { date: "2025-06-15", tcp: 180, udp: 170, icmp: 40, http: 90 },
  { date: "2025-06-16", tcp: 210, udp: 200, icmp: 55, http: 105 },
  { date: "2025-06-17", tcp: 400, udp: 360, icmp: 100, http: 150 },
  { date: "2025-06-18", tcp: 380, udp: 340, icmp: 95, http: 145 },
];

const chartConfig: ChartConfig = {
  traffic: {
    label: "Network Traffic",
  },
  tcp: {
    label: "TCP",
    color: "hsl(210, 70%, 50%)",
  },
  udp: {
    label: "UDP",
    color: "hsl(120, 70%, 50%)",
  },
  icmp: {
    label: "ICMP",
    color: "hsl(0, 70%, 50%)",
  },
  http: {
    label: "HTTP",
    color: "hsl(270, 70%, 50%)",
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

export function ChartAreaInteractive() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");
  const [selectedProtocols, setSelectedProtocols] = React.useState(["tcp", "udp", "icmp", "http"]);
  const [chartData, setChartData] = React.useState<TrafficData[]>(initialChartData);

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  React.useEffect(() => {
    socket.on("traffic", (data: { timestamp: string; tcp: number; udp: number; icmp: number; http: number }) => {
      setChartData((prev) => {
        const newData = [...prev, { date: data.timestamp, tcp: data.tcp, udp: data.udp, icmp: data.icmp, http: data.http }].slice(-90);
        return newData;
      });
    });

    return () => {
      socket.off("traffic");
    };
  }, []);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
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
        <CardTitle>Network Traffic</CardTitle>
        <CardDescription className="mb-6">
          <span className="hidden @[540px]/card:block">
            Network traffic for the selected protocols and time range
          </span>
          <span className="@[540px]/card:hidden">Selected protocols and time</span>
        </CardDescription>
        <div className="flex flex-row gap-4 items-center justify-between flex-wrap mt-4">
          <div>
            <ToggleGroup
              type="multiple"
              value={selectedProtocols}
              onValueChange={setSelectedProtocols}
              variant="outline"
              className="flex flex-wrap gap-2"
            >
              <ToggleGroupItem value="tcp">TCP</ToggleGroupItem>
              <ToggleGroupItem value="udp">UDP</ToggleGroupItem>
              <ToggleGroupItem value="icmp">ICMP</ToggleGroupItem>
              <ToggleGroupItem value="http">HTTP</ToggleGroupItem>
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
          <AreaChart data={filteredData}>
            <defs>
              {Object.keys(chartConfig).filter(key => key !== 'traffic').map(protocol => (
                <linearGradient key={protocol} id={`fill${protocol.toUpperCase()}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={chartConfig[protocol].color}
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor={chartConfig[protocol].color}
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
                  indicator="dot"
                />
              }
            />
            {selectedProtocols.map(protocol => (
              <Area
                key={protocol}
                dataKey={protocol}
                type="natural"
                fill={`url(#fill${protocol.toUpperCase()})`}
                stroke={chartConfig[protocol].color}
                stackId="a"
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}