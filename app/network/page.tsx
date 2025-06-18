
"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import * as echarts from "echarts";
import CytoscapeComponent from "react-cytoscapejs";
import { AlertCircle, Activity, Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";
import { SiteHeader } from "@/components/site-header";

interface AlertData { id: string; message: string; severity: "low" | "medium" | "high"; timestamp: string }
interface TrafficData { value: number; timestamp: number }
interface NetworkNode { id: string; label: string; type: "device" | "attacker" }
interface NetworkEdge { source: string; target: string; weight: number }

const socket: Socket = io("http://localhost:8000");

export default function Dashboard() {
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
    const [networkData, setNetworkData] = useState<{ nodes: NetworkNode[]; edges: NetworkEdge[] }>({ nodes: [], edges: [] });
    const chartRef = useRef<echarts.ECharts | null>(null);
    const trafficChartDivRef = useRef<HTMLDivElement>(null);

    // Initialize ECharts
    useEffect(() => {
        if (trafficChartDivRef.current && !chartRef.current) {
            chartRef.current = echarts.init(trafficChartDivRef.current, null, { renderer: "canvas" });
            chartRef.current.setOption({
                tooltip: { trigger: "axis" },
                xAxis: { type: "time", splitLine: { show: false } },
                yAxis: { type: "value", name: "Traffic (Mbps)" },
                series: [{ type: "line", data: [], showSymbol: false, smooth: true }],
                grid: { left: "10%", right: "5%", bottom: "15%" },
            });
        }

        return () => {
            if (chartRef.current) {
                chartRef.current.dispose();
                chartRef.current = null;
            }
        };
    }, []);

    // Handle WebSocket events
    useEffect(() => {
        socket.on("alert", (data: AlertData) => {
            setAlerts((prev) => [data, ...prev.slice(0, 9)]);
        });

        socket.on("traffic", (data: TrafficData) => {
            setTrafficData((prev) => {
                const newData = [...prev, data].slice(-60); // Keep last 60 points
                if (chartRef.current) {
                    chartRef.current.setOption({
                        series: [{ data: newData.map((d) => [d.timestamp, d.value]) }],
                    });
                }
                return newData;
            });
        });

        socket.on("network", (data: { nodes: NetworkNode[]; edges: NetworkEdge[] }) => {
            setNetworkData(data);
        });

        return () => {
            socket.off("alert");
            socket.off("traffic");
            socket.off("network");
        };
    }, []);

    // Cytoscape elements
    const cyElements = [
        ...networkData.nodes.map((node) => ({ data: { id: node.id, label: node.label, type: node.type } })),
        ...networkData.edges.map((edge) => ({ data: { source: edge.source, target: edge.target, weight: edge.weight } })),
    ];

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
                    
                    <div className="container mx-auto p-6 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900"></h3>
                            <Badge variant="outline" className="text-green-600 border-green-600 ">
                                <Activity className="h-4 w-4 mr-1" /> Online
                            </Badge>
                        </div>

                        <Tabs defaultValue="overview" className="space-y-6">
                            <TabsList className="grid w-full max-w-md grid-cols-3">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="alerts">Alerts</TabsTrigger>
                                <TabsTrigger value="topology">Topology</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Alerts Overview */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                                                Recent Alerts
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ScrollArea className="h-[300px]">
                                                {alerts.length === 0 ? (
                                                    <p className="text-gray-500">No alerts</p>
                                                ) : (
                                                    alerts.map((alert) => (
                                                        <Alert
                                                            key={alert.id}
                                                            variant={alert.severity === "high" ? "destructive" : alert.severity === "medium" ? "default" : undefined}
                                                            className="mb-2"
                                                        >
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertTitle>{alert.severity.toUpperCase()} Alert</AlertTitle>
                                                            <AlertDescription>
                                                                {alert.message} <br />
                                                                <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</span>
                                                            </AlertDescription>
                                                        </Alert>
                                                    ))
                                                )}
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>

                                    {/* Traffic Chart */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center">
                                                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                                                Network Traffic
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div ref={trafficChartDivRef} className="h-[300px] w-full" />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Network Topology */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Network className="h-5 w-5 mr-2 text-purple-500" />
                                            Attack Topology
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CytoscapeComponent
                                            elements={cyElements}
                                            style={{ width: "100%", height: "400px" }}
                                            layout={{ name: "cose", animate: true }}
                                            stylesheet={[
                                                {
                                                    selector: "node",
                                                    style: {
                                                        label: "data(label)",
                                                        backgroundColor: (ele: any) => (ele.data("type") === "attacker" ? "#ef4444" : "#3b82f6"),
                                                        color: "#fff",
                                                        textValign: "center",
                                                        textHalign: "center",
                                                        width: 30,
                                                        height: 30,
                                                    },
                                                },
                                                {
                                                    selector: "edge",
                                                    style: {
                                                        width: "data(weight)",
                                                        lineColor: "#d1d5db",
                                                        curveStyle: "bezier",
                                                    },
                                                },
                                            ]}
                                            cy={(cy: import("cytoscape").Core) => {
                                                cy.on("tap", "node", (evt) => {
                                                    alert(`Node: ${evt.target.data("label")}`);
                                                });
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Alerts Tab */}
                            <TabsContent value="alerts">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>All Alerts</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-[600px]">
                                            {alerts.length === 0 ? (
                                                <p className="text-gray-500">No alerts</p>
                                            ) : (
                                                alerts.map((alert) => (
                                                    <Alert
                                                        key={alert.id}
                                                        variant={alert.severity === "high" ? "destructive" : alert.severity === "medium" ? "default" : undefined}
                                                        className="mb-2"
                                                    >
                                                        <AlertCircle className="h-4 w-4" />
                                                        <AlertTitle>{alert.severity.toUpperCase()} Alert</AlertTitle>
                                                        <AlertDescription>
                                                            {alert.message} <br />
                                                            <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</span>
                                                        </AlertDescription>
                                                    </Alert>
                                                ))
                                            )}
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Topology Tab */}
                            <TabsContent value="topology">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Full Network Topology</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <CytoscapeComponent
                                            elements={cyElements}
                                            style={{ width: "100%", height: "600px" }}
                                            layout={{ name: "cose", animate: true }}
                                            stylesheet={[
                                                {
                                                    selector: "node",
                                                    style: {
                                                        label: "data(label)",
                                                        backgroundColor: (ele: any) => (ele.data("type") === "attacker" ? "#ef4444" : "#3b82f6"),
                                                        color: "#fff",
                                                        textValign: "center",
                                                        textHalign: "center",
                                                        width: 40,
                                                        height: 40,
                                                    },
                                                },
                                                {
                                                    selector: "edge",
                                                    style: {
                                                        width: "data(weight)",
                                                        lineColor: "#d1d5db",
                                                        curveStyle: "bezier",
                                                    },
                                                },
                                            ]}
                                            cy={(cy: import("cytoscape").Core) => {
                                                cy.on("tap", "node", (evt) => {
                                                    alert(`Node: ${evt.target.data("label")}`);
                                                });
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </SidebarInset>
            </SidebarProvider>
    );
}
