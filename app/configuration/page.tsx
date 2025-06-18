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
import { Download, Upload, Plus } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

const socket: Socket = io("http://localhost:8000");

// Types
type NetworkInterface = {
  id: string;
  name: string;
  status: "enabled" | "disabled";
  promiscuous: boolean;
  ipAddress: string;
  lastUpdated: Date;
};

type SensitivitySettings = {
  packetDepth: number;
  alertSensitivity: "low" | "medium" | "high";
};

type NtpSettings = {
  primaryServer: string;
  secondaryServer: string;
  syncInterval: number;
};

// Form schemas
const sensitivityFormSchema = z.object({
  packetDepth: z.number().min(100, "Packet depth must be at least 100 bytes").max(65535, "Packet depth cannot exceed 65535 bytes"),
  alertSensitivity: z.enum(["low", "medium", "high"]),
});

const ntpFormSchema = z.object({
  primaryServer: z.string().min(1, "Primary NTP server is required").regex(/^([a-zA-Z0-9.-]+)$/, "Invalid server address"),
  secondaryServer: z.string().optional(),
  syncInterval: z.number().min(60, "Sync interval must be at least 60 seconds").max(86400, "Sync interval cannot exceed 24 hours"),
});

// Mock data
const initialInterfaces: NetworkInterface[] = [
  {
    id: "1",
    name: "eth0",
    status: "enabled",
    promiscuous: true,
    ipAddress: "192.168.1.10",
    lastUpdated: new Date("2025-06-18T20:30:00"),
  },
  {
    id: "2",
    name: "eth1",
    status: "disabled",
    promiscuous: false,
    ipAddress: "192.168.1.11",
    lastUpdated: new Date("2025-06-18T20:00:00"),
  },
];

const initialSensitivity: SensitivitySettings = {
  packetDepth: 1500,
  alertSensitivity: "medium",
};

const initialNtp: NtpSettings = {
  primaryServer: "pool.ntp.org",
  secondaryServer: "time.google.com",
  syncInterval: 3600,
};

// Color palette from ChartAreaInteractive
const colorPalette = {
  enabled: "hsl(120, 70%, 50%)", // Green
  disabled: "hsl(0, 70%, 50%)", // Red
  high: "hsl(210, 70%, 50%)", // Blue
  low: "hsl(270, 70%, 50%)", // Purple
};

export default function NetworkSystemSettings() {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>(initialInterfaces);
  const [sensitivity, setSensitivity] = useState<SensitivitySettings>(initialSensitivity);
  const [ntp, setNtp] = useState<NtpSettings>(initialNtp);

  // WebSocket for real-time interface status updates
  useEffect(() => {
    socket.on("interface_update", (data: NetworkInterface) => {
      setInterfaces((prev) =>
        prev.map((intf) => (intf.id === data.id ? { ...data, lastUpdated: new Date() } : intf))
      );
    });

    return () => {
      socket.off("interface_update");
    };
  }, []);

  // Sensitivity form
  const sensitivityForm = useForm<z.infer<typeof sensitivityFormSchema>>({
    resolver: zodResolver(sensitivityFormSchema),
    defaultValues: {
      packetDepth: sensitivity.packetDepth,
      alertSensitivity: sensitivity.alertSensitivity,
    },
  });

  // NTP form
  const ntpForm = useForm<z.infer<typeof ntpFormSchema>>({
    resolver: zodResolver(ntpFormSchema),
    defaultValues: {
      primaryServer: ntp.primaryServer,
      secondaryServer: ntp.secondaryServer,
      syncInterval: ntp.syncInterval,
    },
  });

  const handleToggleInterface = (id: string, field: "status" | "promiscuous") => {
    setInterfaces((prev) =>
      prev.map((intf) =>
        intf.id === id
          ? {
              ...intf,
              [field]: field === "status" ? (intf.status === "enabled" ? "disabled" : "enabled") : !intf.promiscuous,
              lastUpdated: new Date(),
            }
          : intf
      )
    );
    toast.success(`Interface ${field} updated`);
  };

  const handleSaveSensitivity = (values: z.infer<typeof sensitivityFormSchema>) => {
    setSensitivity(values);
    toast.success("Detection sensitivity settings saved");
  };

  const handleSaveNtp = (values: z.infer<typeof ntpFormSchema>) => {
    setNtp({
      ...values,
      secondaryServer: values.secondaryServer ?? "",
    });
    toast.success("NTP settings saved");
  };

  const handleBackupSettings = () => {
    // Simulate backup (in production, this would generate a config file)
    const backupData = {
      interfaces,
      sensitivity,
      ntp,
    };
    console.log("Backup Data:", JSON.stringify(backupData, null, 2));
    toast.success("Settings backed up successfully");
  };

  const handleRestoreSettings = () => {
    // Simulate restore (in production, this would process an uploaded file)
    toast.success("Settings restored successfully");
  };

  const getStatusBadge = (status: NetworkInterface["status"]) => (
    <Badge
      variant="outline"
      style={{ backgroundColor: `${colorPalette[status.toLowerCase() as keyof typeof colorPalette]}10` }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
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
            {/* Network Interface Settings */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: colorPalette.enabled }}>Network Interface Settings</CardTitle>
                  <CardDescription>Manage network interfaces for traffic monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Promiscuous Mode</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Last Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interfaces.map((intf) => (
                        <TableRow key={intf.id}>
                          <TableCell>{intf.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(intf.status)}
                              <Switch
                                checked={intf.status === "enabled"}
                                onCheckedChange={() => handleToggleInterface(intf.id, "status")}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={intf.promiscuous}
                              onCheckedChange={() => handleToggleInterface(intf.id, "promiscuous")}
                            />
                          </TableCell>
                          <TableCell>{intf.ipAddress}</TableCell>
                          <TableCell>{intf.lastUpdated.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            {/* Detection Sensitivity Tuning */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Detection Sensitivity Tuning</CardTitle>
                  <CardDescription>Adjust Snort detection parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...sensitivityForm}>
                    <form onSubmit={sensitivityForm.handleSubmit(handleSaveSensitivity)} className="space-y-4">
                      <FormField
                        control={sensitivityForm.control}
                        name="packetDepth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Packet Inspection Depth (bytes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="1500"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={sensitivityForm.control}
                        name="alertSensitivity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Alert Sensitivity</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select sensitivity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">
                                  <Badge
                                    variant="outline"
                                    style={{ backgroundColor: `${colorPalette.low}10` }}
                                  >
                                    Low
                                  </Badge>
                                </SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">
                                  <Badge
                                    variant="outline"
                                    style={{ backgroundColor: `${colorPalette.high}10` }}
                                  >
                                    High
                                  </Badge>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" /> Save Sensitivity Settings
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </section>

            {/* Time Synchronization (NTP) */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Time Synchronization (NTP)</CardTitle>
                  <CardDescription>Configure NTP servers for accurate logging</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...ntpForm}>
                    <form onSubmit={ntpForm.handleSubmit(handleSaveNtp)} className="space-y-4">
                      <FormField
                        control={ntpForm.control}
                        name="primaryServer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary NTP Server</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., pool.ntp.org" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ntpForm.control}
                        name="secondaryServer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secondary NTP Server (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., time.google.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ntpForm.control}
                        name="syncInterval"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sync Interval (seconds)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="3600"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" /> Save NTP Settings
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </section>

            {/* Backup & Restore Settings */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Backup & Restore Settings</CardTitle>
                  <CardDescription>Manage Snort configuration backups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={handleBackupSettings}>
                      <Download className="h-4 w-4 mr-2" /> Backup Settings
                    </Button>
                    <Button variant="outline" onClick={handleRestoreSettings}>
                      <Upload className="h-4 w-4 mr-2" /> Restore Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}