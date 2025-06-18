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
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const socket: Socket = io("http://localhost:8000");

// Types
type TrafficData = {
  date: string;
  tcp: number;
  udp: number;
  icmp: number;
};

type Alert = {
  id: string;
  timestamp: Date;
  priority: "high" | "medium" | "low";
  classification: string;
  sourceIp: string;
  destIp: string;
  protocol: string;
};

type Rule = {
  id: string;
  sid: string;
  action: "alert" | "log" | "drop";
  protocol: string;
  source: string;
  destination: string;
  message: string;
};

type DpiEvent = {
  id: string;
  timestamp: Date;
  sourceIp: string;
  destIp: string;
  protocol: string;
  payload: string;
};

// Mock data
const initialTrafficData: TrafficData[] = [
  { date: "2025-06-18T12:00:00", tcp: 200, udp: 150, icmp: 50 },
  { date: "2025-06-18T12:01:00", tcp: 220, udp: 160, icmp: 60 },
  { date: "2025-06-18T12:02:00", tcp: 180, udp: 140, icmp: 55 },
];

const mockAlerts: Alert[] = [
  {
    id: "1",
    timestamp: new Date("2025-06-18T12:30:00"),
    priority: "high",
    classification: "SQL Injection Attempt",
    sourceIp: "192.168.1.100",
    destIp: "10.0.0.50",
    protocol: "TCP",
  },
  {
    id: "2",
    timestamp: new Date("2025-06-18T12:45:00"),
    priority: "medium",
    classification: "Unusual Traffic Pattern",
    sourceIp: "172.16.0.10",
    destIp: "10.0.0.50",
    protocol: "UDP",
  },
];

const mockRules: Rule[] = [
  {
    id: "1",
    sid: "1000001",
    action: "alert",
    protocol: "tcp",
    source: "any",
    destination: "$HOME_NET",
    message: "ET SCAN SQL Injection",
  },
  {
    id: "2",
    sid: "1000002",
    action: "drop",
    protocol: "udp",
    source: "any",
    destination: "any",
    message: "ET POLICY Anomalous UDP",
  },
];

const mockDpiEvents: DpiEvent[] = [
  {
    id: "1",
    timestamp: new Date("2025-06-18T12:30:05"),
    sourceIp: "192.168.1.100",
    destIp: "10.0.0.50",
    protocol: "TCP",
    payload: "GET /login.php?user=admin'-- HTTP/1.1",
  },
  {
    id: "2",
    timestamp: new Date("2025-06-18T12:45:10"),
    sourceIp: "172.16.0.10",
    destIp: "10.0.0.50",
    protocol: "UDP",
    payload: "Malformed UDP packet",
  },
];

// Form schema
const ruleFormSchema = z.object({
  sid: z.string().min(1, "SID is required"),
  action: z.enum(["alert", "log", "drop"]),
  protocol: z.enum(["tcp", "udp", "icmp"]),
  message: z.string().min(2, "Message must be at least 2 characters"),
});

// Chart config
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
};

// Color palette
const colorPalette = {
  high: "hsl(0, 70%, 50%)",
  medium: "hsl(210, 70%, 50%)",
  low: "hsl(120, 70%, 50%)",
  alert: "hsl(210, 70%, 50%)",
  protocol: "hsl(270, 70%, 50%)",
};

export default function MonitoringDetection() {
  const [trafficData, setTrafficData] = useState<TrafficData[]>(initialTrafficData);

  // WebSocket for live traffic data
  useEffect(() => {
    socket.on("traffic", (data: { timestamp: string; tcp: number; udp: number; icmp: number }) => {
      setTrafficData((prev) => [
        ...prev,
        { date: data.timestamp, tcp: data.tcp, udp: data.udp, icmp: data.icmp },
      ].slice(-60)); // Keep last 60 data points
    });

    return () => {
      socket.off("traffic");
    };
  }, []);

  // Rule form
  const ruleForm = useForm<z.infer<typeof ruleFormSchema>>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      sid: "",
      action: "alert",
      protocol: "tcp",
      message: "",
    },
  });

  const handleCreateRule = (values: z.infer<typeof ruleFormSchema>) => {
    toast.success(`Rule ${values.sid} created successfully`);
    ruleForm.reset();
  };

  const handleDeleteRule = (ruleId: string) => {
    toast.success("Rule deleted successfully");
  };

  const getPriorityBadge = (priority: Alert["priority"]) => (
    <Badge
      variant="outline"
      style={{ backgroundColor: `${colorPalette[priority.toLowerCase() as keyof typeof colorPalette]}10` }}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );

  const getActionBadge = (action: Rule["action"]) => {
    const variants: Record<
      Rule["action"],
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      alert: { label: "Alert", variant: "default" },
      log: { label: "Log", variant: "secondary" },
      drop: { label: "Drop", variant: "destructive" },
    };
    const { label, variant } = variants[action];
    return <Badge variant={variant}>{label}</Badge>;
  };

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
            {/* Monitoring & Detection */}
            <section>

              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colorPalette.alert }}>Total Alerts</CardTitle>
                    <CardDescription>Active alerts in the last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">1,234</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Active Rules</CardTitle>
                    <CardDescription>Snort rules currently enforced</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">456</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Traffic Volume</CardTitle>
                    <CardDescription>Total packets processed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">12.5M</div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Live Traffic Analysis */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Live Traffic Analysis</CardTitle>
                  <CardDescription>
                    Real-time network traffic by protocol
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart data={trafficData}>
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
                        tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        label={{ value: "Packets", angle: -90, position: "insideLeft" }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            labelFormatter={(value) => new Date(value).toLocaleTimeString()}
                            indicator="dot"
                          />
                        }
                      />
                      {["tcp", "udp", "icmp"].map(protocol => (
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
            </section>

            {/* Signature-Based Detection */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Signature-Based Detection</CardTitle>
                  <CardDescription>Manage Snort rules for known threats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-4">
                    <Form {...ruleForm}>
                      <form onSubmit={ruleForm.handleSubmit(handleCreateRule)} className="flex gap-4">
                        <FormField
                          control={ruleForm.control}
                          name="sid"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="SID (e.g., 1000001)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={ruleForm.control}
                          name="action"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Action" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="alert">Alert</SelectItem>
                                  <SelectItem value="log">Log</SelectItem>
                                  <SelectItem value="drop">Drop</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={ruleForm.control}
                          name="protocol"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="w-32">
                                    <SelectValue placeholder="Protocol" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="tcp">TCP</SelectItem>
                                  <SelectItem value="udp">UDP</SelectItem>
                                  <SelectItem value="icmp">ICMP</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={ruleForm.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input placeholder="Rule message" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit">
                          <Plus className="h-4 w-4 mr-2" /> Add Rule
                        </Button>
                      </form>
                    </Form>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SID</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Protocol</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>{rule.sid}</TableCell>
                          <TableCell>{getActionBadge(rule.action)}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{ backgroundColor: `${colorPalette.alert}10` }}
                            >
                              {rule.protocol.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{rule.message}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            {/* Anomaly-Based Detection */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Anomaly-Based Detection</CardTitle>
                  <CardDescription>Alerts for unusual network behavior</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Classification</TableHead>
                        <TableHead>Source IP</TableHead>
                        <TableHead>Destination IP</TableHead>
                        <TableHead>Protocol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockAlerts.map((alert) => (
                        <TableRow key={alert.id}>
                          <TableCell>{alert.timestamp.toLocaleString()}</TableCell>
                          <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
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

            {/* Protocol Analysis */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Protocol Analysis</CardTitle>
                  <CardDescription>Summary of protocol-specific alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Protocol</TableHead>
                        <TableHead>Alert Count</TableHead>
                        <TableHead>High Priority</TableHead>
                        <TableHead>Medium Priority</TableHead>
                        <TableHead>Low Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {["TCP", "UDP", "ICMP"].map((protocol) => (
                        <TableRow key={protocol}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{ backgroundColor: `${colorPalette.protocol}10` }}
                            >
                              {protocol}
                            </Badge>
                          </TableCell>
                          <TableCell>{mockAlerts.filter((a) => a.protocol === protocol).length}</TableCell>
                          <TableCell>{mockAlerts.filter((a) => a.protocol === protocol && a.priority === "high").length}</TableCell>
                          <TableCell>{mockAlerts.filter((a) => a.protocol === protocol && a.priority === "medium").length}</TableCell>
                          <TableCell>{mockAlerts.filter((a) => a.protocol === protocol && a.priority === "low").length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            {/* Deep Packet Inspection (DPI) */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Deep Packet Inspection (DPI)</CardTitle>
                  <CardDescription>Packet payload analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Protocol</TableHead>
                        <TableHead>Source IP</TableHead>
                        <TableHead>Destination IP</TableHead>
                        <TableHead>Payload</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockDpiEvents.map((event) => (
                        <TableRow key={event.id}>
                          <TableCell>{event.timestamp.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{ backgroundColor: `${colorPalette[event.protocol.toLowerCase() as keyof typeof colorPalette]}10` }}
                            >
                              {event.protocol}
                            </Badge>
                          </TableCell>
                          <TableCell>{event.sourceIp}</TableCell>
                          <TableCell>{event.destIp}</TableCell>
                          <TableCell className="truncate max-w-[200px]">{event.payload}</TableCell>
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