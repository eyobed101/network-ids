"use client"

import React, { useState } from "react"
import { useParams } from "next/navigation"
// import { LineChart, PieChart } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, LineChart, Pie, PieChart, XAxis } from "recharts"

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarIcon, Filter, Users, Folder, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { useIsMobile } from "@/hooks/use-mobile"

// Utility function for conditional classNames
function cn(...classes: (string | undefined | false | null)[]) {
    return classes.filter(Boolean).join(" ");
}

// Types matching your analytics service
type TeamMemberContribution = {
    userId: string
    userName: string
    avatarUrl?: string
    hoursLogged: number
    tasksCompleted: number
    contributionPercentage: number
}

type BurndownChartData = {
    date: string
    ideal: number
    actual: number
    tasksRemaining: number
}

type TeamPerformanceMetrics = {
    teamVelocity: number
    burndown: BurndownChartData[]
    individualContributions: TeamMemberContribution[]
    completionRates: {
        total: number
        completed: number
        percentage: number
    }
}

// Mock data based on your analytics service
const mockTeamPerformance: TeamPerformanceMetrics = {
    teamVelocity: 1.2,
    burndown: [
        { date: "2023-11-01", ideal: 2, actual: 1, tasksRemaining: 9 },
        { date: "2023-11-02", ideal: 4, actual: 3, tasksRemaining: 7 },
        { date: "2023-11-03", ideal: 6, actual: 5, tasksRemaining: 5 },
        { date: "2023-11-04", ideal: 8, actual: 6, tasksRemaining: 4 },
        { date: "2023-11-05", ideal: 10, actual: 8, tasksRemaining: 2 },
        { date: "2023-11-06", ideal: 10, actual: 10, tasksRemaining: 0 },
    ],
    individualContributions: [
        {
            userId: "1",
            userName: "Alex Johnson",
            avatarUrl: "/avatars/01.png",
            hoursLogged: 32.5,
            tasksCompleted: 8,
            contributionPercentage: 45
        },
        {
            userId: "2",
            userName: "Sam Lee",
            avatarUrl: "/avatars/02.png",
            hoursLogged: 24.0,
            tasksCompleted: 5,
            contributionPercentage: 33
        },
        {
            userId: "3",
            userName: "Jordan Smith",
            avatarUrl: "/avatars/03.png",
            hoursLogged: 15.5,
            tasksCompleted: 3,
            contributionPercentage: 22
        }
    ],
    completionRates: {
        total: 16,
        completed: 10,
        percentage: 62.5
    }
}

const mockProjects = [
    { id: "1", name: "Website Redesign" },
    { id: "2", name: "Mobile App" }
]

const mockTeams = [
    { id: "1", name: "Development Team" },
    { id: "2", name: "Design Team" }
]

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    desktop: {
        label: "Desktop",
        color: "var(--primary)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--primary)",
    },
} satisfies ChartConfig

export default function AnalyticsPage() {
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
        from: new Date("2023-11-01"),
        to: new Date("2023-11-06")
    })

    const [selectedProject, setSelectedProject] = useState<string>("all")
    const [selectedTeam, setSelectedTeam] = useState<string>("all")
    const isMobile = useIsMobile()
    const [timeRange, setTimeRange] = React.useState("90d")

    React.useEffect(() => {
        if (isMobile) {
            setTimeRange("7d")
        }
    }, [isMobile])



    // Filter data based on selections
    const filteredData = {
        ...mockTeamPerformance,
        burndown: mockTeamPerformance.burndown.filter(entry => {
            const entryDate = new Date(entry.date)
            return (
                (!dateRange.from || entryDate >= dateRange.from) &&
                (!dateRange.to || entryDate <= dateRange.to)
            )
        }),
        individualContributions: mockTeamPerformance.individualContributions
    }

    // If you want to sum a property from an array, specify the correct array and property.
    // For example, to sum 'contributionPercentage' from 'individualContributions':
    const totalVisitors = React.useMemo(() => {
        return filteredData.individualContributions.reduce((acc, curr) => acc + curr.contributionPercentage, 0)
    }, [filteredData.individualContributions])


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
                                <div className="flex flex-col gap-6">
                                    {/* Filters */}
                                    {/* Filters */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Filter className="h-5 w-5" />
                                                <span>Analytics Filters</span>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Date Range Picker */}
                                                <div className="space-y-2">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant={"outline"}
                                                                className={cn(
                                                                    "w-full justify-start text-left font-normal",
                                                                    !dateRange && "text-muted-foreground"
                                                                )}
                                                            >
                                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                                {dateRange?.from && dateRange?.to ? (
                                                                    `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                                                                ) : (
                                                                    <span>Pick a date</span>
                                                                )}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0">
                                                            <Calendar
                                                                mode="range"
                                                                selected={dateRange}
                                                                onSelect={(range) => {
                                                                    if (range?.from && range?.to) {
                                                                        setDateRange({ from: range.from, to: range.to });
                                                                    }
                                                                }}
                                                                initialFocus
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>

                                                {/* Team Selector */}
                                                <div className="space-x-2 flex items-center">
                                                    <Label>Team</Label>
                                                    <Select
                                                        value={selectedTeam}
                                                        onValueChange={setSelectedTeam}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select team" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Teams</SelectItem>
                                                            {mockTeams.map((team) => (
                                                                <SelectItem key={team.id} value={team.id}>
                                                                    {team.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Project Selector */}
                                                <div className="space-x-2 flex items-center">
                                                    <Label>Project</Label>
                                                    <Select
                                                        value={selectedProject}
                                                        onValueChange={setSelectedProject}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select project" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all">All Projects</SelectItem>
                                                            {mockProjects.map((project) => (
                                                                <SelectItem key={project.id} value={project.id}>
                                                                    {project.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Task Completion Over Time */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5" /> Task Completion Over Time
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-80">
                                                
                                                <ChartContainer
                                                    config={chartConfig}
                                                    className="aspect-auto h-[250px] w-full"
                                                >
                                                    <AreaChart data={filteredData.burndown}>
                                                        <defs>
                                                            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                                                <stop
                                                                    offset="5%"
                                                                    stopColor="var(--color-desktop)"
                                                                    stopOpacity={1.0}
                                                                />
                                                                <stop
                                                                    offset="95%"
                                                                    stopColor="var(--color-desktop)"
                                                                    stopOpacity={0.1}
                                                                />
                                                            </linearGradient>
                                                            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                                                <stop
                                                                    offset="5%"
                                                                    stopColor="var(--color-mobile)"
                                                                    stopOpacity={0.8}
                                                                />
                                                                <stop
                                                                    offset="95%"
                                                                    stopColor="var(--color-mobile)"
                                                                    stopOpacity={0.1}
                                                                />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid vertical={false} />
                                                        <XAxis
                                                            dataKey="date"
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickMargin={8}
                                                            minTickGap={32}
                                                            tickFormatter={(value) => {
                                                                const date = new Date(value)
                                                                return date.toLocaleDateString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })
                                                            }}
                                                        />
                                                        <ChartTooltip
                                                            cursor={false}
                                                            defaultIndex={isMobile ? -1 : 10}
                                                            content={
                                                                <ChartTooltipContent
                                                                    labelFormatter={(value) => {
                                                                        return new Date(value).toLocaleDateString("en-US", {
                                                                            month: "short",
                                                                            day: "numeric",
                                                                        })
                                                                    }}
                                                                    indicator="dot"
                                                                />
                                                            }
                                                        />
                                                        <Area
                                                            dataKey="mobile"
                                                            type="natural"
                                                            fill="url(#fillMobile)"
                                                            stroke="var(--color-mobile)"
                                                            stackId="a"
                                                        />
                                                        <Area
                                                            dataKey="desktop"
                                                            type="natural"
                                                            fill="url(#fillDesktop)"
                                                            stroke="var(--color-desktop)"
                                                            stackId="a"
                                                        />
                                                    </AreaChart>
                                                </ChartContainer>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full bg-blue-500" />
                                                <span className="text-sm">Tasks Remaining: {filteredData.completionRates.total - filteredData.completionRates.completed}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full bg-green-500" />
                                                <span className="text-sm">Tasks Completed: {filteredData.completionRates.completed}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-yellow-500" />
                                                <span className="text-sm">Team Velocity: {filteredData.teamVelocity} tasks/day</span>
                                            </div>
                                        </CardFooter>
                                    </Card>

                                    {/* Member Contribution Breakdown */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" /> Member Contribution Breakdown
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="h-80">
                                                    {/* <PieChart
                                                        data={filteredData.individualContributions.map(member => ({
                                                            name: member.userName,
                                                            value: member.contributionPercentage
                                                        }))}
                                                        colors={['#3b82f6', '#6366f1', '#8b5cf6']}
                                                        tooltipFormatter={(value, name) => [
                                                            `${value}% of total hours`,
                                                            name
                                                        ]}
                                                    /> */}
                                                  
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="font-medium">Detailed Breakdown</h3>
                                                    <div className="space-y-2">
                                                        {filteredData.individualContributions.map(member => (
                                                            <div key={member.userId} className="flex items-center justify-between p-2 border rounded">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative">
                                                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                                            {member.avatarUrl ? (
                                                                                <img
                                                                                    src={member.avatarUrl}
                                                                                    alt={member.userName}
                                                                                    className="h-full w-full rounded-full"
                                                                                />
                                                                            ) : (
                                                                                <span className="text-sm font-medium">
                                                                                    {member.userName.split(' ').map(n => n[0]).join('')}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                                                                    {member.contributionPercentage}%
                                                                                </div>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                Contribution percentage
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium">{member.userName}</div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {member.tasksCompleted} tasks
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm font-medium">
                                                                    {member.hoursLogged}h
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Project Velocity */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Folder className="h-5 w-5" /> Project Velocity
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-80">

                                                <ChartContainer
                                                    config={chartConfig}
                                                    className="aspect-auto h-[250px] w-full"
                                                >
                                                    <AreaChart data={filteredData.burndown}>
                                                        <defs>
                                                            <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                                                <stop
                                                                    offset="5%"
                                                                    stopColor="var(--color-desktop)"
                                                                    stopOpacity={1.0}
                                                                />
                                                                <stop
                                                                    offset="95%"
                                                                    stopColor="var(--color-desktop)"
                                                                    stopOpacity={0.1}
                                                                />
                                                            </linearGradient>
                                                            <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                                                <stop
                                                                    offset="5%"
                                                                    stopColor="var(--color-mobile)"
                                                                    stopOpacity={0.8}
                                                                />
                                                                <stop
                                                                    offset="95%"
                                                                    stopColor="var(--color-mobile)"
                                                                    stopOpacity={0.1}
                                                                />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid vertical={false} />
                                                        <XAxis
                                                            dataKey="date"
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickMargin={8}
                                                            minTickGap={32}
                                                            tickFormatter={(value) => {
                                                                const date = new Date(value)
                                                                return date.toLocaleDateString("en-US", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })
                                                            }}
                                                        />
                                                        <ChartTooltip
                                                            cursor={false}
                                                            defaultIndex={isMobile ? -1 : 10}
                                                            content={
                                                                <ChartTooltipContent
                                                                    labelFormatter={(value) => {
                                                                        return new Date(value).toLocaleDateString("en-US", {
                                                                            month: "short",
                                                                            day: "numeric",
                                                                        })
                                                                    }}
                                                                    indicator="dot"
                                                                />
                                                            }
                                                        />
                                                        <Area
                                                            dataKey="mobile"
                                                            type="natural"
                                                            fill="url(#fillMobile)"
                                                            stroke="var(--color-mobile)"
                                                            stackId="a"
                                                        />
                                                        <Area
                                                            dataKey="desktop"
                                                            type="natural"
                                                            fill="url(#fillDesktop)"
                                                            stroke="var(--color-desktop)"
                                                            stackId="a"
                                                        />
                                                    </AreaChart>
                                                </ChartContainer>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex flex-wrap gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full bg-blue-500" />
                                                <span className="text-sm">Actual Completion: {filteredData.completionRates.completed} tasks</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 rounded-full bg-gray-400" />
                                                <span className="text-sm">Ideal Completion: {Math.round(filteredData.completionRates.total * 0.8)} tasks</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {filteredData.completionRates.percentage >= 80 ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                        <span className="text-sm">On track ({filteredData.completionRates.percentage}%)</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                        <span className="text-sm">Behind schedule ({filteredData.completionRates.percentage}%)</span>
                                                    </>
                                                )}
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