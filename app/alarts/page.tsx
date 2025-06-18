"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
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

// Types
type Alert = {
  id: string;
  timestamp: Date;
  severity: "critical" | "high" | "medium" | "low";
  classification: string;
  sourceIp: string;
  destIp: string;
  protocol: string;
};

type AlertData = {
  date: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
};

// Form schema for notification configuration
const notificationFormSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
  severities: z.array(z.enum(["critical", "high", "medium", "low"])).min(1, "Select at least one severity"),
});

// Mock data
const initialAlerts: Alert[] = [
  {
    id: "1",
    timestamp: new Date("2025-06-18T12:30:00"),
    severity: "critical",
    classification: "SQL Injection Attempt",
    sourceIp: "192.168.1.100",
    destIp: "10.0.0.50",
    protocol: "TCP",
  },
  {
    id: "2",
    timestamp: new Date("2025-06-18T12:45:00"),
    severity: "high",
    classification: "DDoS Attack",
    sourceIp: "172.16.0.10",
    destIp: "10.0.0.50",
    protocol: "UDP",
  },
  {
    id: "3",
    timestamp: new Date("2025-06-18T13:00:00"),
    severity: "medium",
    classification: "Port Scan",
    sourceIp: "192.168.1.200",
    destIp: "10.0.0.50",
    protocol: "ICMP",
  },
  {
    id: "4",
    timestamp: new Date("2025-06-18T13:15:00"),
    severity: "low",
    classification: "Suspicious Packet",
    sourceIp: "192.168.1.150",
    destIp: "10.0.0.50",
    protocol: "TCP",
  },
];

const initialChartData: AlertData[] = [
  { date: "2025-06-18", critical: 5, high: 10, medium: 20, low: 30 },
  { date: "2025-06-17", critical: 3, high: 8, medium: 15, low: 25 },
  { date: "2025-06-16", critical: 7, high: 12, medium: 18, low: 28 },
];

// Chart config
const chartConfig: ChartConfig = {
  alerts: {
    label: "Alerts",
  },
  critical: {
    label: "Critical",
    color: "hsl(0, 70%, 50%)", // Red
  },
  high: {
    label: "High",
    color: "hsl(210, 70%, 50%)", // Blue
  },
  medium: {
    label: "Medium",
    color: "hsl(120, 70%, 50%)", // Green
  },
  low: {
    label: "Low",
    color: "hsl(270, 70%, 50%)", // Purple
  },
};

// Color palette
const colorPalette = {
  critical: "hsl(0, 70%, 50%)",
  high: "hsl(210, 70%, 50%)",
  medium: "hsl(120, 70%, 50%)",
  low: "hsl(270, 70%, 50%)",
};

export default function AlertsNotifications() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [chartData, setChartData] = useState<AlertData[]>(initialChartData);
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedSeverities, setSelectedSeverities] = useState(["critical", "high", "medium", "low"]);

  // WebSocket for real-time alerts
  useEffect(() => {
    socket.on("alert", (data: Alert) => {
      setAlerts((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 alerts
      setChartData((prev) => {
        const date = data.timestamp.toISOString().split("T")[0];
        const existing = prev.find((item) => item.date === date);
        if (existing) {
          return prev.map((item) =>
            item.date === date
              ? { ...item, [data.severity]: item[data.severity] + 1 }
              : item
          );
        }
        return [{ date, critical: 0, high: 0, medium: 0, low: 0, [data.severity]: 1 }, ...prev].slice(0, 7);
      });
    });

    return () => {
      socket.off("alert");
    };
  }, []);

  // Notification form
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      email: "",
      phone: "",
      severities: ["critical", "high"],
    },
  });

  const handleSaveNotifications = (values: z.infer<typeof notificationFormSchema>) => {
    toast.success("Notification preferences saved successfully");
    notificationForm.reset();
  };

  const getSeverityBadge = (severity: Alert["severity"]) => (
    <Badge
      variant="outline"
      style={{ backgroundColor: `${colorPalette[severity.toLowerCase() as keyof typeof colorPalette]}10` }}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );

  const filteredChartData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2025-06-18");
    let daysToSubtract = 7;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "90d") daysToSubtract = 90;
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-8 py-6 px-6">
            {/* View Active Alerts */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: colorPalette.critical }}>View Active Alerts</CardTitle>
                  <CardDescription>Real-time Snort alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Source IP</TableHead>
                        <TableHead>Destination IP</TableHead>
                        <TableHead>Protocol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>{alert.timestamp.toLocaleString()}</TableCell>
                          <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                          <TableCell>{alert.classification}</TableCell>
                          <TableCell>{alert.sourceIp}</TableCell>
                          <TableCell>{alert.destIp}</TableCell>
                          <TableCell>{alert.protocol}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            {/* Alert Severity Levels */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Alert Severity Levels</CardTitle>
                  <CardDescription className="mb-2">Distribution of alerts by severity</CardDescription>
                  <div className="flex flex-row gap-4 justify-between items-center flex-wrap">
                    <ToggleGroup
                      type="multiple"
                      value={selectedSeverities}
                      onValueChange={setSelectedSeverities}
                      variant="outline"
                      className="flex-wrap"
                    >
                      <ToggleGroupItem value="critical">Critical</ToggleGroupItem>
                      <ToggleGroupItem value="high">High</ToggleGroupItem>
                      <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
                      <ToggleGroupItem value="low">Low</ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup
                      type="single"
                      value={timeRange}
                      onValueChange={setTimeRange}
                      variant="outline"
                      className="flex-wrap"
                    >
                      <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
                      <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
                      <ToggleGroupItem value="90d">Last 90 days</ToggleGroupItem>
                    </ToggleGroup>

                  </div>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={filteredChartData}>
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
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        label={{ value: "Alert Count", angle: -90, position: "insideLeft" }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
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
            </section>

            {/* Configure Email/SMS Notifications */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Configure Email/SMS Notifications</CardTitle>
                  <CardDescription className="mb-2">Set up alert notification preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(handleSaveNotifications)} className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number (e.g., +1234567890)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={notificationForm.control}
                        name="severities"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notify for Severities</FormLabel>
                            <ToggleGroup
                              type="multiple"
                              value={field.value}
                              onValueChange={field.onChange}
                              variant="outline"
                              className="flex-wrap"
                            >
                              {["critical", "high", "medium", "low"].map((severity) => (
                                <ToggleGroupItem
                                  key={severity}
                                  value={severity}
                                  style={{ backgroundColor: field.value.includes(severity) ? `${colorPalette[severity.toLowerCase() as keyof typeof colorPalette]}10` : undefined }}
                                >
                                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" /> Save Preferences
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </section>

            {/* Alert Logging & History */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Alert Logging & History</CardTitle>
                  <CardDescription className="mb-2">Historical alert records</CardDescription>
                  <div className="flex flex-col gap-4">
                    <Select
                      value={timeRange}
                      onValueChange={setTimeRange}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Last 7 days" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Source IP</TableHead>
                        <TableHead>Destination IP</TableHead>
                        <TableHead>Protocol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts
                        .filter((alert) => {
                          const date = new Date(alert.timestamp);
                          const referenceDate = new Date("2025-06-18");
                          let daysToSubtract = 7;
                          if (timeRange === "30d") daysToSubtract = 30;
                          else if (timeRange === "90d") daysToSubtract = 90;
                          const startDate = new Date(referenceDate);
                          startDate.setDate(startDate.getDate() - daysToSubtract);
                          return date >= startDate;
                        })
                        .map((alert) => (
                          <TableRow key={alert.id}>
                            <TableCell>{alert.timestamp.toLocaleString()}</TableCell>
                            <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                            <TableCell>{alert.classification}</TableCell>
                            <TableCell>{alert.sourceIp}</TableCell>
                            <TableCell>{alert.destIp}</TableCell>
                            <TableCell>{alert.protocol}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}