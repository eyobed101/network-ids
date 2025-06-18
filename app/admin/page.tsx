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
import { Plus, Trash2, RefreshCw } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";

const socket: Socket = io("http://localhost:8000");

// Types
type User = {
  id: string;
  username: string;
  role: "admin" | "analyst" | "viewer";
  permissions: string[];
  lastLogin: Date;
};

type AuditLog = {
  id: string;
  timestamp: Date;
  admin: string;
  action: string;
  details: string;
};

type SoftwareUpdate = {
  id: string;
  version: string;
  releaseDate: Date;
  status: "installed" | "available";
};

type SystemHealth = {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  timestamp: Date;
};

// Form schemas
const userFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  role: z.enum(["admin", "analyst", "viewer"]),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

// Mock data
const initialUsers: User[] = [
  {
    id: "1",
    username: "admin1",
    role: "admin",
    permissions: ["manage_users", "configure_rules", "view_logs"],
    lastLogin: new Date("2025-06-18T20:30:00"),
  },
  {
    id: "2",
    username: "analyst1",
    role: "analyst",
    permissions: ["view_logs", "generate_reports"],
    lastLogin: new Date("2025-06-18T20:00:00"),
  },
];

const initialAuditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: new Date("2025-06-18T20:30:00"),
    admin: "admin1",
    action: "User Created",
    details: "Created user 'analyst1' with role Analyst",
  },
  {
    id: "2",
    timestamp: new Date("2025-06-18T20:45:00"),
    admin: "admin1",
    action: "Rule Updated",
    details: "Modified Snort rule SID:1000001",
  },
];

const initialUpdates: SoftwareUpdate[] = [
  {
    id: "1",
    version: "3.2.1",
    releaseDate: new Date("2025-06-18"),
    status: "installed",
  },
  {
    id: "2",
    version: "3.2.2",
    releaseDate: new Date("2025-06-20"),
    status: "available",
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
  analyst: "hsl(120, 70%, 50%)", // Green
  viewer: "hsl(270, 70%, 50%)", // Purple
  critical: "hsl(0, 70%, 50%)", // Red
};

export default function SystemAdministration() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [updates, setUpdates] = useState<SoftwareUpdate[]>(initialUpdates);
  const [health, setHealth] = useState<SystemHealth>(initialHealth);

  // WebSocket for real-time system health updates
  useEffect(() => {
    socket.on("health_update", (data: SystemHealth) => {
      setHealth({ ...data, timestamp: new Date() });
    });

    socket.on("audit_log", (data: AuditLog) => {
      setAuditLogs((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 logs
    });

    return () => {
      socket.off("health_update");
      socket.off("audit_log");
    };
  }, []);

  // User form
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      role: "viewer",
      permissions: ["view_logs"],
    },
  });

  const handleAddUser = (values: z.infer<typeof userFormSchema>) => {
    const newUser: User = {
      id: Math.random().toString(),
      ...values,
      lastLogin: new Date(),
    };
    setUsers((prev) => [...prev, newUser]);
    setAuditLogs((prev) => [
      {
        id: Math.random().toString(),
        timestamp: new Date(),
        admin: "admin1", // Mock current admin
        action: "User Created",
        details: `Created user '${values.username}' with role ${values.role}`,
      },
      ...prev,
    ]);
    toast.success(`User ${values.username} added successfully`);
    userForm.reset();
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    setAuditLogs((prev) => [
      {
        id: Math.random().toString(),
        timestamp: new Date(),
        admin: "admin1",
        action: "User Deleted",
        details: `Deleted user ID ${userId}`,
      },
      ...prev,
    ]);
    toast.success("User deleted successfully");
  };

  const handleApplyUpdate = (updateId: string) => {
    setUpdates((prev) =>
      prev.map((update) =>
        update.id === updateId ? { ...update, status: "installed" } : update
      )
    );
    setAuditLogs((prev) => [
      {
        id: Math.random().toString(),
        timestamp: new Date(),
        admin: "admin1",
        action: "Software Updated",
        details: `Applied update to version ${updates.find((u) => u.id === updateId)?.version}`,
      },
      ...prev,
    ]);
    toast.success("Software update applied successfully");
  };

  const getRoleBadge = (role: User["role"]) => (
    <Badge
      variant="outline"
      style={{ backgroundColor: `${colorPalette[role.toLowerCase() as keyof typeof colorPalette]}10` }}
    >
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );

  const getHealthColor = (value: number) => {
    if (value > 80) return colorPalette.critical;
    if (value > 60) return colorPalette.viewer;
    return colorPalette.analyst;
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
            {/* User Management (Roles & Permissions) */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle style={{ color: colorPalette.admin }}>User Management</CardTitle>
                  <CardDescription>Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(handleAddUser)} className="space-y-4 mb-4">
                      <FormField
                        control={userForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., analyst2" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="analyst">Analyst</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="permissions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Permissions</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange([...field.value, value].filter((v, i, a) => a.indexOf(v) === i))
                              }
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Add permission" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="manage_users">Manage Users</SelectItem>
                                <SelectItem value="configure_rules">Configure Rules</SelectItem>
                                <SelectItem value="view_logs">View Logs</SelectItem>
                                <SelectItem value="generate_reports">Generate Reports</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {field.value.map((perm) => (
                                <Badge
                                  key={perm}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    field.onChange(field.value.filter((p) => p !== perm))
                                  }
                                >
                                  {perm.replace("_", " ")}
                                  <span className="ml-1">×</span>
                                </Badge>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" /> Add User
                      </Button>
                    </form>
                  </Form>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{user.permissions.join(", ")}</TableCell>
                          <TableCell>{user.lastLogin.toLocaleString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
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

            {/* Audit Logs (Admin Actions) */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>Track administrative actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{ backgroundColor: `${colorPalette.admin}10` }}
                            >
                              {log.admin}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.details}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            {/* Software Updates */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Software Updates</CardTitle>
                  <CardDescription>Manage Snort software updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Release Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {updates.map((update) => (
                        <TableRow key={update.id}>
                          <TableCell>{update.version}</TableCell>
                          <TableCell>{update.releaseDate.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor:
                                  update.status === "installed"
                                    ? `${colorPalette.analyst}10`
                                    : `${colorPalette.viewer}10`,
                              }}
                            >
                              {update.status.charAt(0).toUpperCase() + update.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {update.status === "available" && (
                              <Button
                                size="sm"
                                onClick={() => handleApplyUpdate(update.id)}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" /> Apply Update
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            {/* System Health (CPU, Memory, Disk Usage) */}
            <section>
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
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}