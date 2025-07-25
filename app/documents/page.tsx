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
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const socket: Socket = io("http://localhost:8000");

// Types
type TrafficLog = {
  id: string;
  timestamp: Date;
  sourceIp: string;
  destIp: string;
  protocol: "tcp" | "udp" | "icmp";
  packetSize: number;
};

type AttackLog = {
  id: string;
  timestamp: Date;
  severity: "critical" | "high" | "medium" | "low";
  classification: string;
  sourceIp: string;
  destIp: string;
  protocol: "tcp" | "udp" | "icmp";
};

type ScheduledReport = {
  id: string;
  name: string;
  type: "traffic" | "attack";
  format: "pdf" | "csv";
  frequency: "daily" | "weekly" | "monthly";
  email: string;
};

// Form schemas
const reportFormSchema = z.object({
  type: z.enum(["traffic", "attack"]),
  format: z.enum(["pdf", "csv"]),
  timeRange: z.enum(["24h", "7d", "30d"]),
});

const scheduleFormSchema = z.object({
  name: z.string().min(1, "Report name is required"),
  type: z.enum(["traffic", "attack"]),
  format: z.enum(["pdf", "csv"]),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  email: z.string().email("Invalid email address"),
});

// Mock data
const initialTrafficLogs: TrafficLog[] = [
  {
    id: "1",
    timestamp: new Date("2025-06-18T12:30:00"),
    sourceIp: "192.168.1.100",
    destIp: "10.0.0.50",
    protocol: "tcp",
    packetSize: 1500,
  },
  {
    id: "2",
    timestamp: new Date("2025-06-18T12:45:00"),
    sourceIp: "172.16.0.10",
    destIp: "10.0.0.50",
    protocol: "udp",
    packetSize: 512,
  },
  {
    id: "3",
    timestamp: new Date("2025-06-18T13:00:00"),
    sourceIp: "192.168.1.200",
    destIp: "10.0.0.50",
    protocol: "icmp",
    packetSize: 64,
  },
];

const initialAttackLogs: AttackLog[] = [
  {
    id: "1",
    timestamp: new Date("2025-06-18T12:30:00"),
    severity: "critical",
    classification: "SQL Injection Attempt",
    sourceIp: "192.168.1.100",
    destIp: "10.0.0.50",
    protocol: "tcp",
  },
  {
    id: "2",
    timestamp: new Date("2025-06-18T12:45:00"),
    severity: "high",
    classification: "DDoS Attack",
    sourceIp: "172.16.0.10",
    destIp: "10.0.0.50",
    protocol: "udp",
  },
  {
    id: "3",
    timestamp: new Date("2025-06-18T13:00:00"),
    severity: "medium",
    classification: "Port Scan",
    sourceIp: "192.168.1.200",
    destIp: "10.0.0.50",
    protocol: "icmp",
  },
];

const initialScheduledReports: ScheduledReport[] = [
  {
    id: "1",
    name: "Daily Traffic Summary",
    type: "traffic",
    format: "pdf",
    frequency: "daily",
    email: "admin@example.com",
  },
  {
    id: "2",
    name: "Weekly Attack Report",
    type: "attack",
    format: "csv",
    frequency: "weekly",
    email: "security@example.com",
  },
];

// Color palette from ChartAreaInteractive
const colorPalette = {
  critical: "hsl(0, 70%, 50%)", // Red
  high: "hsl(210, 70%, 50%)", // Blue
  medium: "hsl(120, 70%, 50%)", // Green
  low: "hsl(270, 70%, 50%)", // Purple
  traffic: "hsl(210, 70%, 50%)", // Blue
  attack: "hsl(0, 0%, 30%)", // Gray (or pick any color you prefer for "attack")
};

// LaTeX template for PDF reports
const generateLatexReport = (type: "traffic" | "attack", data: any[]) => {
  // Escape LaTeX special characters
  const escapeLatex = (str: string) => str
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/{/g, "\\{")
    .replace(/}/g, "\\}")
    .replace(/~/g, "\\textasciitilde")
    .replace(/\^/g, "\\textasciicircum")
    .replace(/\\/g, "\\textbackslash")
    .replace(/,/g, "\\,");

  return `
\\documentclass{article}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}
\\usepackage{booktabs}
\\usepackage{noto}
\\title{Network ${type.charAt(0).toUpperCase() + type.slice(1)} Report}
\\author{Generated by IDS Dashboard}
\\date{${new Date().toLocaleDateString()}}
\\begin{document}
\\maketitle
\\section{${type.charAt(0).toUpperCase() + type.slice(1)} Logs}
\\begin{table}[h]
\\centering
\\begin{tabular}{lllp{5cm}ll}
\\toprule
Timestamp & Source IP & Dest. IP & ${type === "attack" ? "Severity & Classification" : "Protocol"} & ${type === "attack" ? "" : "Packet Size"} \\\\
\\midrule
${data
  .map((item) => {
    const timestamp = escapeLatex(item.timestamp.toLocaleString());
    const sourceIp = escapeLatex(item.sourceIp);
    const destIp = escapeLatex(item.destIp);
    if (type === "attack") {
      return `${timestamp} & ${sourceIp} & ${destIp} & ${escapeLatex(item.severity)} & ${escapeLatex(item.classification)} & ${escapeLatex(item.protocol)} \\\\`;
    } else {
      return `${timestamp} & ${sourceIp} & ${destIp} & ${escapeLatex(item.protocol)} & ${item.packetSize} bytes & \\\\`;
    }
  })
  .join("\n")}
\\bottomrule
\\end{tabular}
\\caption{${type.charAt(0).toUpperCase() + type.slice(1)} Log Data}
\\end{table}
\\end{document}
`;
};

export default function LogsReports() {
  const [trafficLogs, setTrafficLogs] = useState<TrafficLog[]>(initialTrafficLogs);
  const [attackLogs, setAttackLogs] = useState<AttackLog[]>(initialAttackLogs);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(initialScheduledReports);

  // WebSocket for real-time log updates
  useEffect(() => {
    socket.on("traffic_log", (data: TrafficLog) => {
      setTrafficLogs((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 logs
    });
    socket.on("attack_log", (data: AttackLog) => {
      setAttackLogs((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 logs
    });

    return () => {
      socket.off("traffic_log");
      socket.off("attack_log");
    };
  }, []);

  // Report form
  const reportForm = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      type: "traffic",
      format: "pdf",
      timeRange: "24h",
    },
  });

  // Schedule form
  const scheduleForm = useForm<z.infer<typeof scheduleFormSchema>>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: "",
      type: "traffic",
      format: "pdf",
      frequency: "daily",
      email: "",
    },
  });

  const handleGenerateReport = (values: z.infer<typeof reportFormSchema>) => {
    const data = values.type === "traffic" ? trafficLogs : attackLogs;
    // Filter data based on time range
    const referenceDate = new Date("2025-06-18T20:34:00"); // Current date/time: 08:34 PM EAT, June 18, 2025
    let startDate = new Date(referenceDate);
    if (values.timeRange === "24h") {
      startDate.setHours(startDate.getHours() - 24);
    } else if (values.timeRange === "7d") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (values.timeRange === "30d") {
      startDate.setDate(startDate.getDate() - 30);
    }
    const filteredData = data.filter((item) => new Date(item.timestamp) >= startDate);

    if (values.format === "pdf") {
      const latexContent = generateLatexReport(values.type, filteredData);
      // Simulate PDF generation (in a real app, this would trigger a download via a backend endpoint)
      console.log("LaTeX Content:", latexContent); // For debugging; in production, send to backend for latexmk
      toast.success(`Generating ${values.type} report as PDF`);
    } else {
      // Simulate CSV generation
      const csvContent = filteredData
        .map((item) => {
          if (values.type === "attack") {
            const attackItem = item as AttackLog;
            return `${attackItem.timestamp.toISOString()},${attackItem.sourceIp},${attackItem.destIp},${attackItem.severity},${attackItem.classification},${attackItem.protocol}`;
          } else {
            const trafficItem = item as TrafficLog;
            return `${trafficItem.timestamp.toISOString()},${trafficItem.sourceIp},${trafficItem.destIp},${trafficItem.protocol},${trafficItem.packetSize}`;
          }
        })
        .join("\n");
      console.log("CSV Content:", csvContent); // For debugging; in production, trigger download
      toast.success(`Generating ${values.type} report as CSV`);
    }
  };

  const handleScheduleReport = (values: z.infer<typeof scheduleFormSchema>) => {
    setScheduledReports((prev) => [
      {
        id: Math.random().toString(),
        ...values,
      },
      ...prev,
    ]);
    toast.success(`Report "${values.name}" scheduled successfully`);
    scheduleForm.reset();
  };

  const handleDeleteScheduledReport = (reportId: string) => {
    setScheduledReports((prev) => prev.filter((report) => report.id !== reportId));
    toast.success("Scheduled report deleted successfully");
  };

  const getSeverityBadge = (severity: AttackLog["severity"]) => (
    <Badge
      variant="outline"
      style={{ backgroundColor: `${colorPalette[severity.toLowerCase() as keyof typeof colorPalette]}10` }}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </Badge>
  );

  const getProtocolBadge = (protocol: TrafficLog["protocol"]) => (
    <Badge
      variant="outline"
      style={{ backgroundColor: `${colorPalette.traffic}10` }}
    >
      {protocol.toUpperCase()}
    </Badge>
  );

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
            {/* Traffic Logs */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: colorPalette.traffic }}>Traffic Logs</CardTitle>
                  <CardDescription>Network traffic activity logs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Source IP</TableHead>
                        <TableHead>Destination IP</TableHead>
                        <TableHead>Protocol</TableHead>
                        <TableHead>Packet Size</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trafficLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                          <TableCell>{log.sourceIp}</TableCell>
                          <TableCell>{log.destIp}</TableCell>
                          <TableCell>{getProtocolBadge(log.protocol)}</TableCell>
                          <TableCell>{log.packetSize} bytes</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            {/* Attack Logs */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Attack Logs</CardTitle>
                  <CardDescription>Security alerts and attack attempts</CardDescription>
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
                      {attackLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                          <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                          <TableCell>{log.classification}</TableCell>
                          <TableCell>{log.sourceIp}</TableCell>
                          <TableCell>{log.destIp}</TableCell>
                          <TableCell>{log.protocol.toUpperCase()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            {/* Generate Custom Reports */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Generate Custom Reports</CardTitle>
                  <CardDescription>Create reports in PDF or CSV format</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...reportForm}>
                    <form onSubmit={reportForm.handleSubmit(handleGenerateReport)} className="space-y-4">
                      <FormField
                        control={reportForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Log Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select log type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="traffic">Traffic</SelectItem>
                                <SelectItem value="attack">Attack</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={reportForm.control}
                        name="format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Format</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={reportForm.control}
                        name="timeRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Range</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="24h">Last 24 hours</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="30d">Last 30 days</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" /> Generate Report
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </section>

            {/* Scheduled Report Generation */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Report Generation</CardTitle>
                  <CardDescription>Configure automated report delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...scheduleForm}>
                    <form onSubmit={scheduleForm.handleSubmit(handleScheduleReport)} className="space-y-4 mb-4">
                      <FormField
                        control={scheduleForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Daily Traffic Report" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Log Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select log type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="traffic">Traffic</SelectItem>
                                <SelectItem value="attack">Attack</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
                        name="format"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Format</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select format" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="csv">CSV</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
                        name="frequency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={scheduleForm.control}
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
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" /> Schedule Report
                      </Button>
                    </form>
                  </Form>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Format</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduledReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>{report.name}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{ backgroundColor: `${colorPalette[report.type]}10` }}
                            >
                              {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.format.toUpperCase()}</TableCell>
                          <TableCell>{report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}</TableCell>
                          <TableCell>{report.email}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteScheduledReport(report.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
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