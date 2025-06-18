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
import { Plus, Trash2, Upload, Download } from "lucide-react";
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
type Rule = {
  id: string;
  sid: string;
  action: "alert" | "log" | "drop";
  protocol: "tcp" | "udp" | "icmp";
  source: string;
  destination: string;
  message: string;
  createdAt: Date;
};

type Signature = {
  id: string;
  version: string;
  updatedAt: Date;
  ruleCount: number;
};

type ListEntry = {
  id: string;
  type: "whitelist" | "blacklist";
  value: string; // IP or domain
  addedAt: Date;
};

// Form schemas
const ruleFormSchema = z.object({
  sid: z.string().min(1, "SID is required"),
  action: z.enum(["alert", "log", "drop"]),
  protocol: z.enum(["tcp", "udp", "icmp"]),
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  message: z.string().min(2, "Message must be at least 2 characters"),
});

const listFormSchema = z.object({
  type: z.enum(["whitelist", "blacklist"]),
  value: z.string().min(1, "IP or domain is required"),
});

// Mock data
const initialRules: Rule[] = [
  {
    id: "1",
    sid: "1000001",
    action: "alert",
    protocol: "tcp",
    source: "any",
    destination: "$HOME_NET",
    message: "ET SCAN SQL Injection",
    createdAt: new Date("2025-06-18T10:00:00"),
  },
  {
    id: "2",
    sid: "1000002",
    action: "drop",
    protocol: "udp",
    source: "any",
    destination: "any",
    message: "ET POLICY Anomalous UDP",
    createdAt: new Date("2025-06-18T11:00:00"),
  },
];

const initialSignatures: Signature[] = [
  {
    id: "1",
    version: "2.9.18",
    updatedAt: new Date("2025-06-18T09:00:00"),
    ruleCount: 1500,
  },
  {
    id: "2",
    version: "2.9.17",
    updatedAt: new Date("2025-05-18T09:00:00"),
    ruleCount: 1450,
  },
];

const initialListEntries: ListEntry[] = [
  {
    id: "1",
    type: "blacklist",
    value: "192.168.1.100",
    addedAt: new Date("2025-06-18T08:00:00"),
  },
  {
    id: "2",
    type: "whitelist",
    value: "10.0.0.50",
    addedAt: new Date("2025-06-18T08:30:00"),
  },
];

// Color palette from ChartAreaInteractive
const colorPalette = {
  alert: "hsl(210, 70%, 50%)", // Blue
  drop: "hsl(0, 70%, 50%)", // Red
  log: "hsl(120, 70%, 50%)", // Green
  blacklist: "hsl(270, 70%, 50%)", // Purple
};

export default function ActionsConfiguration() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [signatures, setSignatures] = useState<Signature[]>(initialSignatures);
  const [listEntries, setListEntries] = useState<ListEntry[]>(initialListEntries);

  // WebSocket for real-time rule updates
  useEffect(() => {
    socket.on("rule_update", (data: Rule) => {
      setRules((prev) => [data, ...prev].slice(0, 100)); // Keep last 100 rules
    });

    return () => {
      socket.off("rule_update");
    };
  }, []);

  // Rule form
  const ruleForm = useForm<z.infer<typeof ruleFormSchema>>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      sid: "",
      action: "alert",
      protocol: "tcp",
      source: "any",
      destination: "any",
      message: "",
    },
  });

  // List form
  const listForm = useForm<z.infer<typeof listFormSchema>>({
    resolver: zodResolver(listFormSchema),
    defaultValues: {
      type: "blacklist",
      value: "",
    },
  });

  const handleCreateRule = (values: z.infer<typeof ruleFormSchema>) => {
    toast.success(`Rule ${values.sid} created successfully`);
    setRules((prev) => [
      {
        id: Math.random().toString(),
        ...values,
        createdAt: new Date(),
      },
      ...prev,
    ]);
    ruleForm.reset();
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    toast.success("Rule deleted successfully");
  };

  const handleImportRules = () => {
    toast.success("Rules imported successfully");
  };

  const handleExportRules = () => {
    toast.success("Rules exported successfully");
  };

  const handleUpdateSignatures = () => {
    setSignatures((prev) => [
      {
        id: Math.random().toString(),
        version: `2.9.${parseInt(prev[0].version.split(".")[2]) + 1}`,
        updatedAt: new Date(),
        ruleCount: prev[0].ruleCount + 50,
      },
      ...prev,
    ]);
    toast.success("Signatures updated successfully");
  };

  const handleAddListEntry = (values: z.infer<typeof listFormSchema>) => {
    setListEntries((prev) => [
      {
        id: Math.random().toString(),
        ...values,
        addedAt: new Date(),
      },
      ...prev,
    ]);
    toast.success(`${values.type.charAt(0).toUpperCase() + values.type.slice(1)} entry added`);
    listForm.reset();
  };

  const handleRemoveListEntry = (entryId: string) => {
    setListEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    toast.success("Entry removed successfully");
  };

  const getActionBadge = (action: Rule["action"]) => (
    <Badge
      variant="outline"
      style={{ backgroundColor: `${colorPalette[action.toLowerCase() as keyof typeof colorPalette]}10` }}
    >
      {action.charAt(0).toUpperCase() + action.slice(1)}
    </Badge>
  );

  const getListTypeBadge = (type: ListEntry["type"]) => (
    <Badge
      variant="outline"
      style={{ backgroundColor: type === "blacklist" ? `${colorPalette.blacklist}10` : undefined }}
    >
      {type.charAt(0).toUpperCase() + type.slice(1)}
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
            {/* Rules & Signatures */}
            <section>

              <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Rules</CardTitle>
                    <CardDescription>Active detection rules</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{rules.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Active Signatures</CardTitle>
                    <CardDescription>Current signature set</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">{signatures[0]?.ruleCount || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Blocked IPs</CardTitle>
                    <CardDescription>Blacklisted IPs/domains</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold">
                      {listEntries.filter((entry) => entry.type === "blacklist").length}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Manage Detection Rules (Import/Export) */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Manage Detection Rules</CardTitle>
                  <CardDescription>Import or export Snort rule sets</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end gap-4 mb-4">
                    <Button variant="outline" onClick={handleImportRules}>
                      <Upload className="h-4 w-4 mr-2" /> Import Rules
                    </Button>
                    <Button variant="outline" onClick={handleExportRules}>
                      <Download className="h-4 w-4 mr-2" /> Export Rules
                    </Button>
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
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>{rule.sid}</TableCell>
                          <TableCell>{getActionBadge(rule.action)}</TableCell>
                          <TableCell>{rule.protocol.toUpperCase()}</TableCell>
                          <TableCell>{rule.source}</TableCell>
                          <TableCell>{rule.destination}</TableCell>
                          <TableCell>{rule.message}</TableCell>
                          <TableCell>{rule.createdAt.toLocaleDateString()}</TableCell>
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
                </CardContent>
              </Card>
            </section>

            {/* Custom Rule Creation */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Custom Rule Creation</CardTitle>
                  <CardDescription>Create custom Snort detection rules</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...ruleForm}>
                    <form onSubmit={ruleForm.handleSubmit(handleCreateRule)} className="space-y-4">
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
                        name="action"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Action</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action" />
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
                            <FormLabel>Protocol</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select protocol" />
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
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., any or 192.168.1.0/24" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ruleForm.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Destination</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., any or $HOME_NET" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ruleForm.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., ET SCAN SQL Injection" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" /> Create Rule
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </section>

            {/* Update Threat Signatures */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Update Threat Signatures</CardTitle>
                  <CardDescription>Manage signature updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p>Current Version: {signatures[0]?.version || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">
                        Last Updated: {signatures[0]?.updatedAt.toLocaleDateString() || "N/A"}
                      </p>
                    </div>
                    <Button onClick={handleUpdateSignatures}>
                      Update Signatures
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Rule Count</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {signatures.map((signature) => (
                        <TableRow key={signature.id}>
                          <TableCell>
                            <Badge
                              variant="outline"
                              style={{ backgroundColor: `${colorPalette.alert}10` }}
                            >
                              {signature.version}
                            </Badge>
                          </TableCell>
                          <TableCell>{signature.ruleCount}</TableCell>
                          <TableCell>{signature.updatedAt.toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </section>

            {/* Whitelist/Blacklist IPs/Domains */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Whitelist/Blacklist IPs/Domains</CardTitle>
                  <CardDescription>Manage network access control</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...listForm}>
                    <form onSubmit={listForm.handleSubmit(handleAddListEntry)} className="flex gap-4 mb-4">
                      <FormField
                        control={listForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="whitelist">Whitelist</SelectItem>
                                <SelectItem value="blacklist">Blacklist</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={listForm.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="IP or domain (e.g., 192.168.1.100)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">
                        <Plus className="h-4 w-4 mr-2" /> Add Entry
                      </Button>
                    </form>
                  </Form>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Added</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{getListTypeBadge(entry.type)}</TableCell>
                          <TableCell>{entry.value}</TableCell>
                          <TableCell>{entry.addedAt.toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveListEntry(entry.id)}
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