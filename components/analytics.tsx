"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

// Initialize WebSocket
const socket: Socket = io("http://localhost:8000");

// Types
type AttackLog = {
  id: string;
  timestamp: Date;
  severity: "critical" | "high" | "medium" | "low";
  sourceIp: string;
  ruleSid: string;
};

type TrafficLog = {
  id: string;
  timestamp: Date;
  protocol: "tcp" | "udp" | "icmp";
};

// Mock data
const initialAttackLogs: AttackLog[] = [
  {
    id: "1",
    timestamp: new Date("2025-06-18T20:30:00"),
    severity: "critical",
    sourceIp: "192.168.1.100",
    ruleSid: "1000001",
  },
  {
    id: "2",
    timestamp: new Date("2025-06-18T20:45:00"),
    severity: "high",
    sourceIp: "172.16.0.10",
    ruleSid: "1000002",
  },
  {
    id: "3",
    timestamp: new Date("2025-06-18T21:00:00"),
    severity: "medium",
    sourceIp: "192.168.1.200",
    ruleSid: "1000001",
  },
  {
    id: "4",
    timestamp: new Date("2025-06-18T21:15:00"),
    severity: "low",
    sourceIp: "192.168.1.100",
    ruleSid: "1000003",
  },
  {
    id: "5",
    timestamp: new Date("2025-06-18T21:30:00"),
    severity: "high",
    sourceIp: "172.16.0.10",
    ruleSid: "1000002",
  },
];

const initialTrafficLogs: TrafficLog[] = [
  {
    id: "1",
    timestamp: new Date("2025-06-18T20:30:00"),
    protocol: "tcp",
  },
  {
    id: "2",
    timestamp: new Date("2025-06-18T20:45:00"),
    protocol: "udp",
  },
  {
    id: "3",
    timestamp: new Date("2025-06-18T21:00:00"),
    protocol: "icmp",
  },
  {
    id: "4",
    timestamp: new Date("2025-06-18T21:15:00"),
    protocol: "tcp",
  },
  {
    id: "5",
    timestamp: new Date("2025-06-18T21:30:00"),
    protocol: "udp",
  },
];

// Color palette from ChartAreaInteractive
const colorPalette = {
  critical: "hsl(0, 70%, 50%)", // Red
  high: "hsl(210, 70%, 50%)", // Blue
  medium: "hsl(120, 70%, 50%)", // Green
  low: "hsl(270, 70%, 50%)", // Purple
};

// Prepare chart data
const prepareSeverityData = (logs: AttackLog[]) => {
  const counts = logs.reduce(
    (acc, log) => {
      acc[log.severity] = (acc[log.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return [
    { name: "Critical", value: counts.critical || 0 },
    { name: "High", value: counts.high || 0 },
    { name: "Medium", value: counts.medium || 0 },
    { name: "Low", value: counts.low || 0 },
  ];
};

const prepareProtocolData = (logs: TrafficLog[]) => {
  const counts = logs.reduce(
    (acc, log) => {
      acc[log.protocol] = (acc[log.protocol] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return [
    { name: "TCP", value: counts.tcp || 0 },
    { name: "UDP", value: counts.udp || 0 },
    { name: "ICMP", value: counts.icmp || 0 },
  ];
};

const prepareSourceIpData = (logs: AttackLog[]) => {
  const counts = logs.reduce(
    (acc, log) => {
      acc[log.sourceIp] = (acc[log.sourceIp] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

const prepareRuleData = (logs: AttackLog[]) => {
  const counts = logs.reduce(
    (acc, log) => {
      acc[log.ruleSid] = (acc[log.ruleSid] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return Object.entries(counts)
    .map(([name, value]) => ({ name: `SID:${name}`, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
};

export default function Analytics() {
  const [attackLogs, setAttackLogs] = useState<AttackLog[]>(initialAttackLogs);
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>(initialTrafficLogs);

  // WebSocket for real-time log updates
  useEffect(() => {
    socket.on("attack_log", (data: AttackLog) => {
      setAttackLogs((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 logs
      toast.info("New attack log received");
    });
    socket.on("traffic_log", (data: TrafficLog) => {
      setTrafficLogs((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 logs
      toast.info("New traffic log received");
    });

    return () => {
      socket.off("attack_log");
      socket.off("traffic_log");
    };
  }, []);

  // Chart data
  const severityData = prepareSeverityData(attackLogs);
  const protocolData = prepareProtocolData(trafficLogs);
  const sourceIpData = prepareSourceIpData(attackLogs);
  const ruleData = prepareRuleData(attackLogs);

  // Custom tooltip style
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-background/90 p-2 rounded shadow border" style={{ opacity: 0.9 }}>
          <p>{`${payload[0].name}: ${payload[0].value} (${((payload[0].value / total) * 100).toFixed(1)}%)`}</p>
        </div>
      );
    }
    return null;
  };

  return (

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-8">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: colorPalette.high }}>Analytics</CardTitle>
                <CardDescription className="mb-6">Analysis of network security data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2">
                  {/* Attack Severity Distribution */}
                  <div className="flex flex-col align-center">
                    <h3 className="text-sm font-semibold mb-4 text-center" style={{ color: colorPalette.critical }}>
                      Attack Severity Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <defs>
                          {severityData.map((entry) => (
                            <linearGradient key={entry.name} id={`fill${entry.name}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={colorPalette[entry.name.toLowerCase() as keyof typeof colorPalette]} stopOpacity={1.0} />
                              <stop offset="95%" stopColor={colorPalette[entry.name.toLowerCase() as keyof typeof colorPalette]} stopOpacity={0.1} />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={severityData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {severityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#fill${entry.name})`} />
                          ))}
                        </Pie>
                        <Tooltip content={customTooltip} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Vertical Separator for 2-column layout */}
                  {/* <Separator orientation="vertical" className="hidden @xl/main:block" /> */}

                  {/* Protocol Usage */}
                  <div className="flex flex-col align-center">
                    <h3 className="text-sm font-semibold mb-4 text-center" style={{ color: colorPalette.medium }}>
                      Protocol Usage
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <defs>
                          {protocolData.map((entry) => (
                            <linearGradient key={entry.name} id={`fill${entry.name}`} x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor={
                                  entry.name === "TCP"
                                    ? colorPalette.high
                                    : entry.name === "UDP"
                                    ? colorPalette.medium
                                    : colorPalette.low
                                }
                                stopOpacity={1.0}
                              />
                              <stop
                                offset="95%"
                                stopColor={
                                  entry.name === "TCP"
                                    ? colorPalette.high
                                    : entry.name === "UDP"
                                    ? colorPalette.medium
                                    : colorPalette.low
                                }
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={protocolData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {protocolData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#fill${entry.name})`} />
                          ))}
                        </Pie>
                        <Tooltip content={customTooltip} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Horizontal Separator */}
                  <Separator orientation="horizontal" className="col-span-1 @xl/main:col-span-2" />

                  {/* Top Source IPs */}
                  <div className="flex flex-col align-center">
                    <h3 className="text-sm font-semibold mb-4 text-center" style={{ color: colorPalette.low }}>
                      Top Source IPs
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <defs>
                          {sourceIpData.map((entry, idx) => (
                            <linearGradient key={entry.name} id={`fill${entry.name}`} x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor={colorPalette[Object.keys(colorPalette)[idx % 4] as keyof typeof colorPalette]}
                                stopOpacity={1.0}
                              />
                              <stop
                                offset="95%"
                                stopColor={colorPalette[Object.keys(colorPalette)[idx % 4] as keyof typeof colorPalette]}
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={sourceIpData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {sourceIpData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#fill${entry.name})`} />
                          ))}
                        </Pie>
                        <Tooltip content={customTooltip} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Vertical Separator for 2-column layout */}

                  {/* Rule Trigger Frequency */}
                  <div className="flex flex-col align-center">
                    <h3 className="text-sm font-semibold mb-4 text-center" style={{ color: colorPalette.high }}>
                      Rule Trigger Frequency
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <defs>
                          {ruleData.map((entry, idx) => (
                            <linearGradient key={entry.name} id={`fill${entry.name}`} x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor={colorPalette[Object.keys(colorPalette)[idx % 4] as keyof typeof colorPalette]}
                                stopOpacity={1.0}
                              />
                              <stop
                                offset="95%"
                                stopColor={colorPalette[Object.keys(colorPalette)[idx % 4] as keyof typeof colorPalette]}
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <Pie
                          data={ruleData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {ruleData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`url(#fill${entry.name})`} />
                          ))}
                        </Pie>
                        <Tooltip content={customTooltip} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

  );
}