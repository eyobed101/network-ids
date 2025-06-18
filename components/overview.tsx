"use client";

import React from "react";
import { useParams } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, AlertTriangle, FileText, BarChart, Settings, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
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

type Event = {
  id: string;
  timestamp: Date;
  sourceIp: string;
  destIp: string;
  protocol: string;
  packetLength: number;
};

// Mock data mimicking Snort logs
const mockNetworkData = {
  id: "1",
  name: "Network Intrusion Detection",
  description: "Monitoring network traffic for suspicious activities",
  createdAt: new Date("2025-01-15"),
  alerts: [
    {
      id: "1",
      timestamp: new Date("2025-06-18T12:30:00"),
      priority: "high",
      classification: "Attempted Intrusion",
      sourceIp: "192.168.1.100",
      destIp: "10.0.0.50",
      protocol: "TCP",
    },
    {
      id: "2",
      timestamp: new Date("2025-06-18T12:45:00"),
      priority: "medium",
      classification: "Suspicious Packet",
      sourceIp: "172.16.0.10",
      destIp: "10.0.0.50",
      protocol: "UDP",
    },
    {
      id: "3",
      timestamp: new Date("2025-06-18T13:00:00"),
      priority: "low",
      classification: "Port Scan",
      sourceIp: "192.168.1.200",
      destIp: "10.0.0.50",
      protocol: "ICMP",
    },
  ] as Alert[],
  rules: [
    {
      id: "1",
      sid: "1000001",
      action: "alert",
      protocol: "tcp",
      source: "any",
      destination: "$HOME_NET",
      message: "ET SCAN Potential SSH Scan",
    },
    {
      id: "2",
      sid: "1000002",
      action: "drop",
      protocol: "udp",
      source: "any",
      destination: "any",
      message: "ET POLICY Suspicious UDP Traffic",
    },
    {
      id: "3",
      sid: "1000003",
      action: "log",
      protocol: "icmp",
      source: "any",
      destination: "any",
      message: "ET PING Flood Detected",
    },
  ] as Rule[],
  events: [
    {
      id: "1",
      timestamp: new Date("2025-06-18T12:30:05"),
      sourceIp: "192.168.1.100",
      destIp: "10.0.0.50",
      protocol: "TCP",
      packetLength: 1500,
    },
    {
      id: "2",
      timestamp: new Date("2025-06-18T12:45:10"),
      sourceIp: "172.16.0.10",
      destIp: "10.0.0.50",
      protocol: "UDP",
      packetLength: 512,
    },
    {
      id: "3",
      timestamp: new Date("2025-06-18T13:00:15"),
      sourceIp: "192.168.1.200",
      destIp: "10.0.0.50",
      protocol: "ICMP",
      packetLength: 64,
    },
  ] as Event[],
};

// Form schema for adding a new Snort rule
const ruleFormSchema = z.object({
  sid: z.string().min(1, "SID is required"),
  action: z.enum(["alert", "log", "drop"]),
  protocol: z.enum(["tcp", "udp", "icmp"]),
  message: z.string().min(2, "Message must be at least 2 characters"),
});

// Color palette from ChartAreaInteractive
const colorPalette = {
  tcp: "hsl(210, 70%, 50%)", // Blue
  udp: "hsl(120, 70%, 50%)", // Green
  icmp: "hsl(0, 70%, 50%)", // Red
  high: "hsl(0, 70%, 50%)", // Red for high priority
  medium: "hsl(210, 70%, 50%)", // Blue for medium priority
  low: "hsl(120, 70%, 50%)", // Green for low priority
};

export default function Overview() {
  const params = useParams();
  const networkData = mockNetworkData; // In a real app, fetch based on teamId

  // Rule management form
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

  const getPriorityBadge = (priority: Alert["priority"]) => {
    return (
      <Badge
        variant="outline"
        style={{ backgroundColor: `${colorPalette[priority.toLowerCase() as keyof typeof colorPalette]}10` }} // 10% opacity
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

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
      <Card className="@container/card">
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="container mx-auto px-6">
                <Tabs defaultValue="alerts" className="w-full space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="alerts">
                      <AlertTriangle className="h-4 w-4 mr-2" /> Alerts
                    </TabsTrigger>
                    <TabsTrigger value="events">
                      <FileText className="h-4 w-4 mr-2" /> Events
                    </TabsTrigger>
                    <TabsTrigger value="rules">
                      <Settings className="h-4 w-4 mr-2" /> Rules
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                      <BarChart className="h-4 w-4 mr-  2" /> Stats
                    </TabsTrigger>
                  </TabsList>

                  {/* Alerts Tab */}
                  <TabsContent value="alerts" className="space-y-6">
                    <div className="flex justify-between items-center">
                    </div>
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
                        {networkData.alerts.map((alert) => (
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
                  </TabsContent>

                  {/* Events Tab */}
                  <TabsContent value="events" className="space-y-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Source IP</TableHead>
                          <TableHead>Destination IP</TableHead>
                          <TableHead>Protocol</TableHead>
                          <TableHead>Packet Length</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {networkData.events.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>{event.timestamp.toLocaleString()}</TableCell>
                            <TableCell>{event.sourceIp}</TableCell>
                            <TableCell>{event.destIp}</TableCell>
                            <TableCell>{event.protocol}</TableCell>
                            <TableCell>{event.packetLength} bytes</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Rules Tab */}
                  <TabsContent value="rules" className="space-y-6">
                    <div className="flex justify-between items-center">
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
                          <TableHead>Source</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {networkData.rules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>{rule.sid}</TableCell>
                            <TableCell>{getActionBadge(rule.action)}</TableCell>
                            <TableCell>{rule.protocol.toUpperCase()}</TableCell>
                            <TableCell>{rule.source}</TableCell>
                            <TableCell>{rule.destination}</TableCell>
                            <TableCell>{rule.message}</TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteRule(rule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Stats Tab */}
                  <TabsContent value="stats" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Alert Priority Distribution</CardTitle>
                          <CardDescription>By priority level</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Priority</TableHead>
                                <TableHead>Count</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {["high", "medium", "low"].map((priority) => (
                                <TableRow key={priority}>
                                  <TableCell>{priority.charAt(0).toUpperCase() + priority.slice(1)}</TableCell>
                                  <TableCell>
                                    {networkData.alerts.filter((alert) => alert.priority === priority).length}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Protocol Distribution</CardTitle>
                          <CardDescription>Alerts by protocol</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Protocol</TableHead>
                                <TableHead>Count</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {["TCP", "UDP", "ICMP"].map((protocol) => (
                                <TableRow key={protocol}>
                                  <TableCell>{protocol}</TableCell>
                                  <TableCell>
                                    {networkData.alerts.filter((alert) => alert.protocol === protocol).length}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </Card>

  );
}