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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, RefreshCw, Download, Upload } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

const socket: Socket = io("http://localhost:8000");

// Types
type UserProfile = {
  id: string;
  username: string;
  email: string;
  role: "admin" | "analyst" | "viewer";
  permissions: string[];
};

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

type NotificationSettings = {
  emailEnabled: boolean;
  smsEnabled: boolean;
  alertThreshold: "critical" | "high" | "medium" | "low";
  emailAddress: string;
  phoneNumber: string;
};

type Rule = {
  id: string;
  sid: string;
  description: string;
  enabled: boolean;
};

type LogRetention = {
  retentionDays: number;
  maxSizeMb: number;
};

type ScheduledReport = {
  id: string;
  name: string;
  type: "traffic" | "attack";
  format: "pdf" | "csv";
  frequency: "daily" | "weekly" | "monthly";
  email: string;
};

type SystemHealth = {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  timestamp: Date;
};

// Form schemas
const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

const sensitivityFormSchema = z.object({
  packetDepth: z.number().min(100, "Packet depth must be at least 100 bytes").max(65535, "Packet depth cannot exceed 65535 bytes"),
  alertSensitivity: z.enum(["low", "medium", "high"]),
});

const ntpFormSchema = z.object({
  primaryServer: z.string().min(1, "Primary NTP server is required").regex(/^([a-zA-Z0-9.-]+)$/, "Invalid server address"),
  secondaryServer: z.string().optional(),
  syncInterval: z.number().min(60, "Sync interval must be at least 56 seconds").max(86400, "Sync interval cannot exceed 24 hours"),
});

const notificationFormSchema = z.object({
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  emailAddress: z.string().email("Invalid email address").optional(),
  phoneNumber: z.string().regex(/^\+?\d{10,15}$/, "Invalid phone number").optional(),
  alertThreshold: z.enum(["critical", "high", "medium", "low"]),
});

const ruleFormSchema = z.object({
  sid: z.string().min(1, "SID is required"),
  description: z.string().min(1, "Description is required"),
  enabled: z.boolean(),
});

const logRetentionFormSchema = z.object({
  retentionDays: z.number().min(1, "Retention must be at least 1 day").max(365, "Retention cannot exceed 365 days"),
  maxSizeMb: z.number().min(100, "Max size must be at least 100 MB").max(10000, "Max size cannot exceed 10000 MB"),
});

const scheduledReportFormSchema = z.object({
  name: z.string().min(1, "Report name is required"),
  type: z.enum(["traffic", "attack"]),
  format: z.enum(["pdf", "csv"]),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  email: z.string().email("Invalid email address"),
});

// Mock data
const initialProfile: UserProfile = {
  id: "1",
  username: "admin1",
  email: "admin@example.com",
  role: "admin",
  permissions: ["manage_users", "configure_rules", "view_logs", "permissions"],
};

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
    ipAddress: "192.168.1.11",
    status: "disabled",
    promiscuous: false,
    lastUpdated: new Date("2025-06-18T12:00:00"),
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

const initialNotifications: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: false,
  alertThreshold: "high",
  emailAddress: "admin@example.com",
  phoneNumber: "",
};

const initialRules: Rule[] = [
  {
    id: "1",
    sid: "1000001",
    description: "SQL Injection Attempt",
    enabled: true,
  },
  {
    id: "2",
    sid: "1000002",
    description: "DDoS Attack Detection",
    enabled: false,
  },
];

const initialLogRetention: LogRetention = {
  retentionDays: 30,
  maxSizeMb: 5000,
};

const initialScheduledReports: ScheduledReport[] = [
  {
    id: "1",
    name: "Daily Traffic Summary",
    type: "traffic",
    format: "pdf",
    frequency: "daily",
    email: "admin@example.com",
  },
];

const initialHealth: SystemHealth = {
  cpuUsage: 45,
  memoryUsage: 60,
  diskUsage: 75,
  timestamp: new Date("2025-06-18T20:52:00"),
};

// Color palette from ChartAreaInteractive
const colorPalette = {
  admin: "hsl(210, 70%, 50%)", // Blue
  enabled: "hsl(120, 70%, 50%)", // Green
  critical: "hsl(0, 70%, 50%)", // Red
  low: "hsl(270, 70%, 50%)", // Purple
};

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>(initialInterfaces);
  const [sensitivity, setSensitivity] = useState<SensitivitySettings>(initialSensitivity);
  const [ntp, setNtp] = useState<NtpSettings>(initialNtp);
  const [notifications, setNotifications] = useState<NotificationSettings>(initialNotifications);
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [logRetention, setLogRetention] = useState<LogRetention>(initialLogRetention);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(initialScheduledReports);
  const [health, setHealth] = useState<SystemHealth>(initialHealth);

  // WebSocket for real-time updates
  useEffect(() => {
    socket.on("interface_update", (data: NetworkInterface) => {
      setInterfaces((prev) =>
        prev.map((intf) => (intf.id === data.id ? { ...data, lastUpdated: new Date() } : intf))
      );
    });
    socket.on("health_update", (data: SystemHealth) => {
      setHealth({ ...data, timestamp: new Date() });
    });

    return () => {
      socket.off("interface_update");
      socket.off("health_update");
    };
  }, []);

  // Form instances
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile.username,
      email: profile.email,
      password: "",
    },
  });

  const sensitivityForm = useForm<z.infer<typeof sensitivityFormSchema>>({
    resolver: zodResolver(sensitivityFormSchema),
    defaultValues: {
      packetDepth: sensitivity.packetDepth,
      alertSensitivity: sensitivity.alertSensitivity,
    },
  });

  const ntpForm = useForm<z.infer<typeof ntpFormSchema>>({
    resolver: zodResolver(ntpFormSchema),
    defaultValues: {
      primaryServer: ntp.primaryServer,
      secondaryServer: ntp.secondaryServer,
      syncInterval: ntp.syncInterval,
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailEnabled: notifications.emailEnabled,
      smsEnabled: notifications.smsEnabled,
      emailAddress: notifications.emailAddress,
      phoneNumber: notifications.phoneNumber,
      alertThreshold: notifications.alertThreshold,
    },
  });

  const ruleForm = useForm<z.infer<typeof ruleFormSchema>>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      sid: "",
      description: "",
      enabled: true,
    },
  });

  const logRetentionForm = useForm<z.infer<typeof logRetentionFormSchema>>({
    resolver: zodResolver(logRetentionFormSchema),
    defaultValues: {
      retentionDays: logRetention.retentionDays,
      maxSizeMb: logRetention.maxSizeMb,
    },
  });

  const scheduledReportForm = useForm<z.infer<typeof scheduledReportFormSchema>>({
    resolver: zodResolver(scheduledReportFormSchema),
    defaultValues: {
      name: "",
      type: "traffic",
      format: "pdf",
      frequency: "daily",
      email: "",
    },
  });

  // Handlers
  const handleSaveProfile = (values: z.infer<typeof profileFormSchema>) => {
    setProfile({ ...profile, username: values.username, email: values.email });
    if (values.password) {
      // In production, hash and update password
      toast.success("Password updated");
    }
    toast.success("Profile updated successfully");
  };

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

  const handleSaveNotifications = (values: z.infer<typeof notificationFormSchema>) => {
    setNotifications({
      ...values,
      emailAddress: values.emailAddress ?? "",
      phoneNumber: values.phoneNumber ?? "",
    });
    toast.success("Notification settings saved");
  };

  const handleAddRule = (values: z.infer<typeof ruleFormSchema>) => {
    setRules((prev) => [
      {
        id: Math.random().toString(),
        sid: values.sid,
        description: values.description,
        enabled: values.enabled,
      },
      ...prev,
    ]);
    toast.success(`Rule ${values.sid} added successfully`);
    ruleForm.reset();
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((rule) => (rule.id === id ? { ...rule, enabled: !rule.enabled } : rule))
    );
    toast.success("Rule status updated");
  };

  const handleSaveLogRetention = (values: z.infer<typeof logRetentionFormSchema>) => {
    setLogRetention(values);
    toast.success("Log retention settings saved");
  };

  const handleScheduleReport = (values: z.infer<typeof scheduledReportFormSchema>) => {
    setScheduledReports((prev) => [
      {
        id: Math.random().toString(),
        ...values,
      },
      ...prev,
    ]);
    toast.success(`Report "${values.name}" scheduled successfully`);
    scheduledReportForm.reset();
  };

  const handleDeleteScheduledReport = (reportId: string) => {
    setScheduledReports((prev) => prev.filter((report) => report.id !== reportId));
    toast.success("Scheduled report deleted successfully");
  };

  const handleBackupSettings = () => {
    const backupData = {
      profile,
      interfaces,
      sensitivity,
      ntp,
      notifications,
      rules,
      logRetention,
      scheduledReports,
    };
    console.log("Backup Data:", JSON.stringify(backupData, null, 2));
    toast.success("Settings backed up successfully");
  };

  const handleRestoreSettings = () => {
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

  const getHealthColor = (value: number) => {
    if (value > 80) return colorPalette.critical;
    if (value > 60) return colorPalette.low;
    return colorPalette.enabled;
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
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 @xl/main:grid-cols-7">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                <TabsTrigger value="rules">Rules</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              {/* Profile Management */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colorPalette.admin }}>Profile Settings</CardTitle>
                    <CardDescription>Manage your user profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., admin1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., admin@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password (leave blank to keep current)</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="New password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div>
                          <FormLabel>Role</FormLabel>
                          <p className="text-sm text-muted-foreground">{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
                        </div>
                        <div>
                          <FormLabel>Permissions</FormLabel>
                          <p className="text-sm text-muted-foreground">{profile.permissions.join(", ")}</p>
                        </div>
                        <Button type="submit">
                          <Plus className="h-4 w-4 mr-2" /> Save Profile
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Monitoring & Detection */}
              <TabsContent value="monitoring">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ color: colorPalette.enabled }}>Monitoring & Detection</CardTitle>
                    <CardDescription>Configure packet capture and analysis</CardDescription>
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
                                    <Badge variant="outline" style={{ backgroundColor: `${colorPalette.low}10` }}>
                                      Low
                                    </Badge>
                                  </SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
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
              </TabsContent>

              {/* Alerts & Notifications */}
              <TabsContent value="alerts">
                <Card>
                  <CardHeader>
                    <CardTitle>Alerts & Notifications</CardTitle>
                    <CardDescription>Configure notification channels and thresholds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(handleSaveNotifications)} className="space-y-4">
                        <FormField
                          control={notificationForm.control}
                          name="emailEnabled"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel>Email Notifications</FormLabel>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={(checked) => field.onChange(checked)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {notificationForm.watch("emailEnabled") && (
                          <FormField
                            control={notificationForm.control}
                            name="emailAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., admin@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={notificationForm.control}
                          name="smsEnabled"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel>SMS Notifications</FormLabel>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {notificationForm.watch("smsEnabled") && (
                          <FormField
                            control={notificationForm.control}
                            name="phoneNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., +1234567890" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={notificationForm.control}
                          name="alertThreshold"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Alert Threshold</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select threshold" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="critical">
                                    <Badge variant="outline" style={{ backgroundColor: `${colorPalette.critical}10` }}>
                                      Critical
                                    </Badge>
                                  </SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit">
                          <Plus className="h-4 w-4 mr-2" /> Save Notification Settings
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rules & Configuration */}
              <TabsContent value="rules">
                <Card>
                  <CardHeader>
                    <CardTitle>Rules & Configuration</CardTitle>
                    <CardDescription>Manage Snort rules and signatures</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...ruleForm}>
                      <form onSubmit={ruleForm.handleSubmit(handleAddRule)} className="space-y-4 mb-4">
                        <FormField
                          control={ruleForm.control}
                          name="sid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SID</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 1000001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={ruleForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., SQL Injection Attempt" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={ruleForm.control}
                          name="enabled"
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                              <FormLabel>Enabled</FormLabel>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SID</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>{rule.sid}</TableCell>
                            <TableCell>{rule.description}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                style={{ backgroundColor: `${colorPalette[rule.enabled ? "enabled" : "critical"]}10` }}
                              >
                                {rule.enabled ? "Enabled" : "Disabled"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={rule.enabled}
                                onCheckedChange={() => handleToggleRule(rule.id)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Logs & Reports */}
              <TabsContent value="logs">
                <Card>
                  <CardHeader>
                    <CardTitle>Logs & Reports</CardTitle>
                    <CardDescription>Configure log retention and report schedules</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...logRetentionForm}>
                      <form onSubmit={logRetentionForm.handleSubmit(handleSaveLogRetention)} className="space-y-4 mb-8">
                        <FormField
                          control={logRetentionForm.control}
                          name="retentionDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Log Retention (days)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="30"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={logRetentionForm.control}
                          name="maxSizeMb"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Log Size (MB)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="5000"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit">
                          <Plus className="h-4 w-4 mr-2" /> Save Log Retention
                        </Button>
                      </form>
                    </Form>
                    <Form {...scheduledReportForm}>
                      <form onSubmit={scheduledReportForm.handleSubmit(handleScheduleReport)} className="space-y-4 mb-4">
                        <FormField
                          control={scheduledReportForm.control}
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
                          control={scheduledReportForm.control}
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
                          control={scheduledReportForm.control}
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
                          control={scheduledReportForm.control}
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
                          control={scheduledReportForm.control}
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
                                style={{ backgroundColor: `${colorPalette.enabled}10` }}
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
              </TabsContent>

              {/* Network Interface Settings */}
              <TabsContent value="network">
                <Card>
                  <CardHeader>
                    <CardTitle>Network & System Settings</CardTitle>
                    <CardDescription>Configure network interfaces and system settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {/* Network Interfaces */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Network Interfaces</h3>
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
                      </div>

                      {/* NTP Settings */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Time Synchronization (NTP)</h3>
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
                      </div>

                      {/* Backup & Restore */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Backup & Restore</h3>
                        <div className="flex gap-4">
                          <Button variant="outline" onClick={handleBackupSettings}>
                            <Download className="h-4 w-4 mr-2" /> Backup Settings
                          </Button>
                          <Button variant="outline" onClick={handleRestoreSettings}>
                            <Upload className="h-4 w-4 mr-2" /> Restore Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* System Administration */}
              <TabsContent value="system">
                <Card>
                  <CardHeader>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Monitor system resource usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span>CPU Usage</span>
                          <Badge
                            variant="outline"
                            style={{ backgroundColor: `${getHealthColor(health.cpuUsage)}10` }}
                          >
                            {health.cpuUsage}%
                          </Badge>
                        </div>
                        <Progress
                          value={health.cpuUsage}
                          className="h-2"
                          style={{ backgroundColor: getHealthColor(health.cpuUsage) }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span>Memory Usage</span>
                          <Badge
                            variant="outline"
                            style={{ backgroundColor: `${getHealthColor(health.memoryUsage)}10` }}
                          >
                            {health.memoryUsage}%
                          </Badge>
                        </div>
                        <Progress
                          value={health.memoryUsage}
                          className="h-2"
                          style={{ backgroundColor: getHealthColor(health.memoryUsage) }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span>Disk Usage</span>
                          <Badge
                            variant="outline"
                            style={{ backgroundColor: `${getHealthColor(health.diskUsage)}10` }}
                          >
                            {health.diskUsage}%
                          </Badge>
                        </div>
                        <Progress
                          value={health.diskUsage}
                          className="h-2"
                          style={{ backgroundColor: getHealthColor(health.diskUsage) }}
                        />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Last updated: {health.timestamp.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}