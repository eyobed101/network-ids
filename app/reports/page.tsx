"use client"

import React, { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Download, Calendar as CalendarIcon, Filter, User, Folder, Users } from "lucide-react"
import { format } from "date-fns"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Enums matching your schema
enum ReportType {
  TEAM = "TEAM",
  PROJECT = "PROJECT",
  USER = "USER"
}

enum ReportStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
}

// Types matching your entities
type User = {
  id: string
  name: string
  email: string
  avatar?: string
}

type Project = {
  id: string
  name: string
}

type Report = {
  id: string
  type: ReportType
  status: ReportStatus
  filters: Record<string, any> | null
  data: any
  project: Project | null
  generatedBy: User
  createdAt: Date
  generatedAt: Date | null
}

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: "/avatars/01.png"
  },
  {
    id: "2",
    name: "Sam Lee",
    email: "sam@example.com",
    avatar: "/avatars/02.png"
  }
]

const mockProjects: Project[] = [
  { id: "1", name: "Website Redesign" },
  { id: "2", name: "Mobile App" }
]

const mockReports: Report[] = [
  {
    id: "1",
    type: ReportType.PROJECT,
    status: ReportStatus.COMPLETED,
    filters: { projectId: "1", range: "weekly" },
    data: {},
    project: mockProjects[0],
    generatedBy: mockUsers[0],
    createdAt: new Date("2023-11-01"),
    generatedAt: new Date("2023-11-01")
  },
  {
    id: "2",
    type: ReportType.TEAM,
    status: ReportStatus.COMPLETED,
    filters: { teamId: "1", range: "monthly" },
    data: {},
    project: null,
    generatedBy: mockUsers[1],
    createdAt: new Date("2023-10-15"),
    generatedAt: new Date("2023-10-15")
  },
  {
    id: "3",
    type: ReportType.USER,
    status: ReportStatus.PENDING,
    filters: { userId: "1", range: "custom", start: "2023-10-01", end: "2023-10-31" },
    data: null,
    project: null,
    generatedBy: mockUsers[0],
    createdAt: new Date("2023-11-05"),
    generatedAt: null
  }
]

// Form schema
const reportFormSchema = z.object({
  reportType: z.enum(["TEAM", "PROJECT", "USER"]),
  entityId: z.string().min(1, "Please select an entity"),
  timeRange: z.enum(["weekly", "monthly", "custom"]),
  customStart: z.string().optional(),
  customEnd: z.string().optional()
})

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [timeRangeFilter, setTimeRangeFilter] = useState<"weekly" | "monthly" | "custom">("weekly")
  const [selectedEntityType, setSelectedEntityType] = useState<ReportType | null>(null)

  const form = useForm<z.infer<typeof reportFormSchema>>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: "PROJECT",
      timeRange: "weekly"
    }
  })

  const handleGenerateReport = (values: z.infer<typeof reportFormSchema>) => {
    toast.success("Report generation started")
    setIsDialogOpen(false)
    form.reset()
  }

  const handleDownloadReport = (reportId: string) => {
    toast.success("Downloading report...")
  }

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, { label: string; variant: "secondary" | "default" | "destructive" | "outline" }> = {
      [ReportStatus.PENDING]: { label: "Pending", variant: "secondary" },
      [ReportStatus.COMPLETED]: { label: "Completed", variant: "default" },
      [ReportStatus.FAILED]: { label: "Failed", variant: "destructive" }
    }
    const { label, variant } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  const getTypeBadge = (type: ReportType) => {
    const variants: Record<ReportType, { label: string; variant: "secondary" | "default" | "destructive" | "outline"; icon: React.ReactNode }> = {
      [ReportType.TEAM]: { label: "Team", variant: "secondary", icon: <Users className="h-3 w-3 mr-1" /> },
      [ReportType.PROJECT]: { label: "Project", variant: "secondary", icon: <Folder className="h-3 w-3 mr-1" /> },
      [ReportType.USER]: { label: "User", variant: "secondary", icon: <User className="h-3 w-3 mr-1" /> }
    }
    const { label, variant, icon } = variants[type]
    return (
      <Badge variant={variant}>
        {icon}
        {label}
      </Badge>
    )
  }

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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Reports</h1>
                  <div className="flex gap-4">
                    <Select
                      value={timeRangeFilter}
                      onValueChange={(value: "weekly" | "monthly" | "custom") => setTimeRangeFilter(value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Filter by time range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" /> Generate Report
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Generate New Report</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(handleGenerateReport)} className="space-y-4">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <Label>Report Type</Label>
                              <Select
                                onValueChange={(value) => {
                                  setSelectedEntityType(value as ReportType)
                                  form.setValue("reportType", value as any)
                                }}
                                defaultValue={form.watch("reportType")}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select report type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PROJECT">Project Report</SelectItem>
                                  <SelectItem value="TEAM">Team Report</SelectItem>
                                  <SelectItem value="USER">User Report</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {selectedEntityType && (
                              <div className="space-y-2">
                                <Label>
                                  {selectedEntityType === ReportType.PROJECT && "Select Project"}
                                  {selectedEntityType === ReportType.TEAM && "Select Team"}
                                  {selectedEntityType === ReportType.USER && "Select User"}
                                </Label>
                                <Select
                                  onValueChange={(value) => form.setValue("entityId", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Select ${selectedEntityType.toLowerCase()}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {selectedEntityType === ReportType.PROJECT &&
                                      mockProjects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                          {project.name}
                                        </SelectItem>
                                      ))}
                                    {selectedEntityType === ReportType.USER &&
                                      mockUsers.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                          {user.name}
                                        </SelectItem>
                                      ))}
                                    {selectedEntityType === ReportType.TEAM && (
                                      <SelectItem value="1">Development Team</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            <div className="space-y-2">
                              <Label>Time Range</Label>
                              <Select
                                onValueChange={(value) => {
                                  form.setValue("timeRange", value as any)
                                  if (value !== "custom") {
                                    form.resetField("customStart")
                                    form.resetField("customEnd")
                                  }
                                }}
                                defaultValue={form.watch("timeRange")}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="weekly">Last Week</SelectItem>
                                  <SelectItem value="monthly">Last Month</SelectItem>
                                  <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {form.watch("timeRange") === "custom" && (
                              <div className="space-y-2">
                                <Label>Date Range</Label>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <Label htmlFor="start-date">Start Date</Label>
                                    <Input
                                      id="start-date"
                                      type="date"
                                      {...form.register("customStart")}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor="end-date">End Date</Label>
                                    <Input
                                      id="end-date"
                                      type="date"
                                      {...form.register("customEnd")}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button type="submit">Generate Report</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Historical Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Entity</TableHead>
                            <TableHead>Generated By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockReports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell>{getTypeBadge(report.type)}</TableCell>
                              <TableCell>
                                {report.type === ReportType.PROJECT && report.project?.name}
                                {report.type === ReportType.USER && "User Report"}
                                {report.type === ReportType.TEAM && "Team Report"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={report.generatedBy.avatar} />
                                    <AvatarFallback>
                                      {report.generatedBy.name.split(" ").map((n) => n[0]).join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{report.generatedBy.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {format(report.createdAt, "MMM dd, yyyy")}
                              </TableCell>
                              <TableCell>{getStatusBadge(report.status)}</TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadReport(report.id)}
                                  disabled={report.status !== ReportStatus.COMPLETED}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="text-sm text-muted-foreground">
                        Showing {mockReports.length} reports
                      </div>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}