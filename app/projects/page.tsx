"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
  IconLayoutKanban,
  IconCalendar,
  IconTable,
  IconList,
  IconTemplate,
  IconUser,
  IconSearch,
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconInfoCircle,
  IconSettings,
  IconTag,
  IconUsers,
  IconCalendarDue,
  IconChartPie,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { z } from "zod"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"
import api from "@/lib/api"

// ... (keep all your existing imports)

// Update the Project interface to match your entity
interface Project {
  id: string
  name: string
  description: string
  type: string // <-- Added this line
  status: string
  priority: string
  healthScore: number
  progress: number
  viewType: string
  budget?: number | null
  tags?: string[] | null
  isPublic: boolean
  startDate?: Date | null
  endDate?: Date | null
  dueDate?: string | null // <-- Added dueDate property
  createdAt: Date
  updatedAt: Date
  owner: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatarUrl?: string | null
  }
  members: Array<{
    id: string
    user: {
      id: string
      username: string
      firstName: string
      lastName: string
      avatarUrl?: string | null
    }
    role: string
  }>
  team: string
  assignees: Array<{
    id: string
    name: string
    avatar?: string
    role: string
  }>
}




// Enhanced project schema with more detailed fields
// const projectSchema = z.object({
//   id: z.string(),
//   name: z.string().min(3, "Name must be at least 3 characters"),
//   description: z.string().optional(),
//   type: z.enum(["development", "design", "marketing", "operations", "research"]),
//   status: z.enum(["planning", "active", "on-hold", "completed", "archived"]),
//   priority: z.enum(["low", "medium", "high", "critical"]),
//   startDate: z.string(),
//   dueDate: z.string(),
//   team: z.string(),
//   healthScore: z.number().min(0).max(100),
//   progress: z.number().min(0).max(100),
//   budget: z.number().min(0).optional(),
//   viewType: z.enum(["list", "board", "calendar", "table"]),
//   assignees: z.array(z.object({
//     id: z.string(),
//     name: z.string(),
//     avatar: z.string().optional(),
//     role: z.enum(["lead", "member", "contributor"]),
//   })),
//   tags: z.array(z.string()).optional(),
//   isPublic: z.boolean().default(false),
//   createdAt: z.string().optional(),
//   updatedAt: z.string().optional(),
// })

// // Sample data with enhanced fields
// const projectsData: Project[] = [
//   {
//     id: "proj-1",
//     name: "Website Redesign",
//     description: "Complete redesign of company website with new branding",
//     type: "design",
//     status: "active",
//     priority: "high",
//     startDate: "2023-11-01",
//     dueDate: "2023-12-15",
//     team: "Design Team",
//     healthScore: 75,
//     progress: 65,
//     budget: 15000,
//     viewType: "board",
//     assignees: [
//       { id: "user-1", name: "Alex Johnson", avatar: "/avatars/01.png", role: "lead" },
//       { id: "user-2", name: "Sam Lee", avatar: "/avatars/02.png", role: "member" }
//     ],
//     tags: ["design", "branding"],
//     isPublic: false,
//     createdAt: "2023-10-15",
//     updatedAt: "2023-11-10"
//   },
//   {
//     id: "proj-2",
//     name: "Mobile App Development",
//     description: "Build new mobile application for iOS and Android",
//     type: "development",
//     status: "active",
//     priority: "critical",
//     startDate: "2023-10-01",
//     dueDate: "2023-11-30",
//     team: "Dev Team",
//     healthScore: 90,
//     progress: 85,
//     budget: 50000,
//     viewType: "board",
//     assignees: [
//       { id: "user-3", name: "Taylor Swift", avatar: "/avatars/03.png", role: "lead" },
//       { id: "user-4", name: "Jamie Smith", avatar: "/avatars/04.png", role: "member" }
//     ],
//     tags: ["mobile", "react-native"],
//     isPublic: true,
//     createdAt: "2023-09-20",
//     updatedAt: "2023-11-15"
//   },
//   {
//     id: "proj-3",
//     name: "Marketing Campaign Q1",
//     description: "Launch new marketing campaign for Q1 products",
//     type: "marketing",
//     status: "planning",
//     priority: "medium",
//     startDate: "2024-01-01",
//     dueDate: "2024-01-20",
//     team: "Marketing",
//     healthScore: 30,
//     progress: 10,
//     budget: 20000,
//     viewType: "list",
//     assignees: [
//       { id: "user-5", name: "Pat Brown", avatar: "/avatars/05.png", role: "lead" }
//     ],
//     tags: ["marketing", "campaign"],
//     isPublic: false,
//     createdAt: "2023-11-01",
//     updatedAt: "2023-11-05"
//   },
// ]

// Health score indicator component
function HealthIndicator({ score }: { score: number }) {
  let color = "bg-red-500"
  if (score >= 75) color = "bg-green-500"
  else if (score >= 50) color = "bg-yellow-500"

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <span className="text-sm">{score}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        {score >= 75 ? "On track" : score >= 50 ? "Needs attention" : "At risk"}
      </TooltipContent>
    </Tooltip>
  )
}

// Assignees avatars component
function Assignees({ assignees }: { assignees: { id: string; name: string; avatar?: string }[] }) {
  return (
    <div className="flex -space-x-2">
      {assignees.map((assignee) => (
        <Tooltip key={assignee.id}>
          <TooltipTrigger>
            <Avatar className="border-2 border-background size-7">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{assignee.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// type Project = z.infer<typeof projectSchema>;

// Accepts any shape as long as it matches the columns used in the table
type TableProject = {
  id: string;
  name: string;
  description: string;
  type: string;
  status: "planning" | "active" | "on-hold" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "critical";
  startDate: string;
  dueDate: string;
  team: string;
  healthScore: number;
  progress: number;
  budget: number;
  viewType: "list" | "board" | "calendar" | "table";
  assignees: Array<{ id: string; name: string; avatar?: string; role: string }>;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
};

interface ProjectsTableProps {
  projects: TableProject[];
  onViewDetails: (projectId: string) => void;
  onEditProject: (project: TableProject) => void;
  onDeleteProject: (projectId: string) => void;
  onDuplicateProject: (project: TableProject) => void;
  onSwitchView: (projectId: string, viewType: TableProject["viewType"]) => void;
  onCreateTemplate: (project: TableProject) => void;
  onQuickAssign: (projectId: string, userId: string) => void;
  userRole: "owner" | "manager" | "member";
  onAddProject: () => void;
}

function DraggableRow({ row }: { row: Row<TableProject> }) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({ id: row.original.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? "var(--muted)" : undefined,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-state={row.getIsSelected() && "selected"}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function ProjectsTable({
  projects,
  onViewDetails,
  onEditProject,
  onDeleteProject,
  onDuplicateProject,
  onSwitchView,
  onCreateTemplate,
  onQuickAssign,
  userRole,
  onAddProject,
}: ProjectsTableProps) {
  const [data, setData] = React.useState(() => projects)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState(userRole === "member" ? "myWork" : "all")

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )




  // Filter data based on active tab
  const filteredData = React.useMemo(() => {
    let result = [...data]

    if (activeTab === "myWork") {
      result = result.filter(project =>
        project.assignees.some(a => a.id === "user-1") // Replace with current user ID
      )
    } else if (activeTab === "active") {
      result = result.filter(project => project.status === "active")
    } else if (activeTab === "completed") {
      result = result.filter(project => project.status === "completed")
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query) ||
        project.team.toLowerCase().includes(query) ||
        project.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        project.assignees.some(a => a.name.toLowerCase().includes(query))
      )
    }

    return result
  }, [data, activeTab, searchQuery])

  const columns: ColumnDef<TableProject>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Project",
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          {row.original.name}
          {row.original.isPublic && (
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          )}
          {row.original.viewType === "list" && <IconList className="size-3 text-muted-foreground" />}
          {row.original.viewType === "board" && <IconLayoutKanban className="size-3 text-muted-foreground" />}
          {row.original.viewType === "calendar" && <IconCalendar className="size-3 text-muted-foreground" />}
          {row.original.viewType === "table" && <IconTable className="size-3 text-muted-foreground" />}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusMap = {
          planning: { label: "Planning", color: "bg-gray-500" },
          active: { label: "Active", color: "bg-blue-500" },
          "on-hold": { label: "On Hold", color: "bg-yellow-500" },
          completed: { label: "Completed", color: "bg-green-500" },
          archived: { label: "Archived", color: "bg-purple-500" },
        }
        const status = statusMap[row.original.status]

        return (
          <div className="flex items-center gap-2">
            <span className={`size-2 rounded-full ${status.color}`} />
            <span className="text-sm">{status.label}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priorityMap = {
          low: { label: "Low", color: "bg-green-500" },
          medium: { label: "Medium", color: "bg-yellow-500" },
          high: { label: "High", color: "bg-orange-500" },
          critical: { label: "Critical", color: "bg-red-500" },
        }
        const priority = priorityMap[row.original.priority]

        return (
          <Badge variant="outline" className="gap-1">
            <span className={`size-2 rounded-full ${priority.color}`} />
            {priority.label}
          </Badge>
        )
      },
    },
    {
      accessorKey: "healthScore",
      header: "Health",
      cell: ({ row }) => <HealthIndicator score={row.original.healthScore} />,
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.dueDate ? format(new Date(row.original.dueDate), "MMM dd, yyyy") : ""}
          {new Date(row.original.dueDate) < new Date() && row.original.status !== "completed" && (
            <Tooltip>
              <TooltipTrigger>
                <IconAlertCircle className="size-4 text-red-500" />
              </TooltipTrigger>
              <TooltipContent>Overdue</TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      accessorKey: "team",
      header: "Team",
      cell: ({ row }) => row.original.team,
    },
    {
      accessorKey: "assignees",
      header: "Assignees",
      cell: ({ row }) => <Assignees assignees={row.original.assignees} />,
    },
    {
      accessorKey: "progress",
      header: "Progress",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 w-24">
          <Progress value={row.original.progress} className="h-2" />
          <span className="text-xs text-muted-foreground">{row.original.progress}%</span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              size="icon"
            >
              <IconDotsVertical />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onViewDetails(row.original.id)}>
              View Details
            </DropdownMenuItem>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Switch View</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onSwitchView(row.original.id, "list")}>
                  <IconList className="mr-2 size-4" /> List
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSwitchView(row.original.id, "board")}>
                  <IconLayoutKanban className="mr-2 size-4" /> Board
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSwitchView(row.original.id, "calendar")}>
                  <IconCalendar className="mr-2 size-4" /> Calendar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSwitchView(row.original.id, "table")}>
                  <IconTable className="mr-2 size-4" /> Table
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {userRole !== "member" && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Quick Assign</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {row.original.assignees.map(assignee => (
                    <DropdownMenuItem
                      key={assignee.id}
                      onClick={() => onQuickAssign(row.original.id, assignee.id)}
                    >
                      {assignee.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}

            <DropdownMenuItem onClick={() => onEditProject(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicateProject(row.original)}>
              Duplicate
            </DropdownMenuItem>

            {userRole === "owner" && (
              <DropdownMenuItem onClick={() => onCreateTemplate(row.original)}>
                <IconTemplate className="mr-2 size-4" /> Save as Template
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDeleteProject(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4">
        {/* Global search and filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search projects (#project-A or @user)..."
              className="h-10 pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

        </div>

        {/* View tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="myWork">My Work</TabsTrigger>
            {userRole !== "member" && (
              <>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </>
            )}
          </TabsList>
        </Tabs>
      </div>

      {/* Table controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <IconLayoutColumns className="mr-2 size-3" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main table */}
      <div className="overflow-hidden rounded-lg border">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} project(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectFormDialog({
  project,
  onOpenChange,
  onSubmit,
}: {
  project?: Project | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Project>) => void;
}) {
  const [activeTab, setActiveTab] = React.useState("details")
  const [formData, setFormData] = React.useState<Partial<Project>>(
    project || {
      name: "",
      description: "",
      type: "development",
      status: "planning",
      priority: "medium",
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      team: "",
      healthScore: 50,
      progress: 0,
      viewType: "list",
      assignees: [],
      tags: [],
      isPublic: false,
    }
  )

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>
          {project ? "Edit Project" : "Create New Project"}
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">
              <IconInfoCircle className="mr-2 size-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="settings">
              <IconSettings className="mr-2 size-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="team">
              <IconUsers className="mr-2 size-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <IconTag className="mr-2 size-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter project name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Project Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Enter project description"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate instanceof Date ? format(formData.startDate, "yyyy-MM-dd") : (formData.startDate ?? "")}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate ?? ""}
                  onChange={(e) => handleChange("dueDate", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="viewType">Default View</Label>
                <Select
                  value={formData.viewType}
                  onValueChange={(value) => handleChange("viewType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="board">Board</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="healthScore">Initial Health Score</Label>
                <Input
                  id="healthScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.healthScore}
                  onChange={(e) => handleChange("healthScore", parseInt(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="team" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team">Team</Label>
                <Input
                  id="team"
                  value={formData.team}
                  onChange={(e) => handleChange("team", e.target.value)}
                  placeholder="Enter team name"
                />
              </div>

              <div className="space-y-2">
                <Label>Assignees</Label>
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src="/avatars/01.png" />
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  <Avatar className="size-8">
                    <AvatarImage src="/avatars/02.png" />
                    <AvatarFallback>SL</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="size-8">
                    <IconPlus className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags?.join(", ")}
                  onChange={(e) => handleChange("tags", e.target.value.split(", "))}
                  placeholder="Enter tags, separated by commas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  value={formData.budget ?? ""}
                  onChange={(e) => handleChange("budget", e.target.value === "" ? null : parseInt(e.target.value))}
                  placeholder="Enter budget amount"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleChange("isPublic", checked)}
                />
                <Label htmlFor="isPublic">Make project public</Label>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit}>
          {project ? "Save Changes" : "Create Project"}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}

export default function ProjectsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProject, setCurrentProject] = React.useState<Project | null>(null)
  const [userRole, setUserRole] = React.useState<"owner" | "manager" | "member">("owner")


  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/projects')

        console.log('Fetched projects:', response.data)

        if (response.status < 200 || response.status >= 300) {
          throw new Error('Failed to fetch projects')
        }

        const data = response.data.data
        setProjects(data)
      } catch (error) {
        toast.error('Error loading projects')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchProjects()
    }
  }, [session])


  const tableProjects = projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description,
    type: "development", // You may want to add this to your model
    status: project.status as "planning" | "active" | "on-hold" | "completed" | "archived",
    priority: project.priority.toLowerCase() as "low" | "medium" | "high" | "critical",
    startDate: project.startDate ? format(new Date(project.startDate), 'yyyy-MM-dd') : '',
    dueDate: project.dueDate ? format(new Date(project.dueDate), 'yyyy-MM-dd') : '',
    team: project.owner?.firstName + ' ' + project.owner?.lastName,
    healthScore: project.healthScore,
    progress: project.progress,
    budget: project.budget || 0,
    viewType: project.viewType.toLowerCase() as "list" | "board" | "calendar" | "table",
    assignees: [
      {
        id: project.owner?.id,
        name: `${project.owner?.firstName} ${project.owner?.lastName}`,
        avatar: project.owner?.avatarUrl || undefined,
        role: "lead"
      },
      ...project.members?.map(member => ({
        id: member.user.id,
        name: `${member.user.firstName} ${member.user.lastName}`,
        avatar: member.user.avatarUrl || undefined,
        role: member.role.toLowerCase() as "lead" | "member" | "contributor"
      }))
    ],
    tags: project.tags || [],
    isPublic: project.isPublic,
    createdAt: format(new Date(project.createdAt), 'yyyy-MM-dd'),
    updatedAt: format(new Date(project.updatedAt), 'yyyy-MM-dd')
  }))

   // Handle project creation
  const handleSubmitProject = async (data: Partial<Project>) => {
  try {
    const method = currentProject ? 'put' : 'post';
    const url = currentProject ? `/projects/${currentProject.id}` : '/projects';

    console.log("data", data)
    const response = await api[method](url, data);

    const result = response.data;
    
    if (currentProject) {
      setProjects(prev => prev.map(p => p.id === currentProject.id ? result : p));
      toast.success("Project updated successfully");
    } else {
      setProjects(prev => [...prev, result]);
      toast.success("Project created successfully");
    }
  } catch (error) {

    console.log(error)
    toast.error(
      typeof error === "object" && error !== null && "response" in error && (error as any).response?.data?.message
        ? (error as any).response.data.message
        : error && typeof error === "object" && "message" in error
        ? (error as any).message
        : (currentProject ? 'Failed to update project' : 'Failed to create project')
    );
  } finally {
    setIsDialogOpen(false);
  }
};

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await api.delete(`/projects/${projectId}`)

      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to delete project')
      }

      setProjects(prev => prev.filter(p => p.id !== projectId))
      toast.success("Project deleted successfully")
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        toast.error((error as { message?: string }).message || "Delete failed")
      } else {
        toast.error("Delete failed")
      }
    }
  }


  const handleViewDetails = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleEditProject = (project: Project) => {
    setCurrentProject(project)
    setIsDialogOpen(true)
  }

const handleAddProject = () => {
  setCurrentProject(null)
  setIsDialogOpen(true)
}

  const handleDuplicateProject = (project: TableProject) => {
    // Convert TableProject to Project with minimal required fields for duplication
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: `${project.name} (Copy)`,
      description: project.description,
      type: project.type, // Added type
      status: project.status,
      priority: project.priority,
      healthScore: project.healthScore,
      progress: 0,
      viewType: project.viewType,
      budget: project.budget,
      tags: project.tags,
      isPublic: project.isPublic,
      startDate: project.startDate ? new Date(project.startDate) : undefined,
      endDate: project.dueDate ? new Date(project.dueDate) : undefined,
      dueDate: project.dueDate, // Optional, if needed
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: {
        id: project.assignees[0]?.id || "",
        username: "",
        firstName: project.assignees[0]?.name?.split(" ")[0] || "",
        lastName: project.assignees[0]?.name?.split(" ")[1] || "",
        avatarUrl: project.assignees[0]?.avatar || null,
      },
      members: project.assignees.slice(1).map(a => ({
        id: a.id,
        user: {
          id: a.id,
          username: "",
          firstName: a.name?.split(" ")[0] || "",
          lastName: a.name?.split(" ")[1] || "",
          avatarUrl: a.avatar || null,
        },
        role: a.role,
      })),
      team: project.team, // Added team
      assignees: project.assignees.map(a => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar,
        role: a.role,
      })), // Added assignees
    }
    setProjects(prev => [...prev, newProject])
    toast.success("Project duplicated successfully")
  }

  const handleSwitchView = (projectId: string, viewType: Project["viewType"]) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, viewType } : p
    ))
    toast.success(`View switched to ${viewType}`)
  }

  const handleCreateTemplate = (project: TableProject) => {
    toast.success(`Template created from "${project.name}"`)
  }

  const handleQuickAssign = (projectId: string, userId: string) => {
    toast.success(`User assigned to project`)
  }

  

   if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin" />
      </div>
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
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold md:text-2xl">Projects Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage all your projects in one place
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={userRole} onValueChange={(v: "owner" | "manager" | "member") => setUserRole(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddProject}>
                    <IconPlus className="mr-2 size-3" />
                    New Project
                  </Button>
                </DialogTrigger>
                {isDialogOpen && (
                  <ProjectFormDialog
                    project={currentProject}
                    onOpenChange={setIsDialogOpen}
                    onSubmit={handleSubmitProject}
                  />
                )}
              </Dialog>
            </div>
          </div>

          <ProjectsTable 
            projects={tableProjects}
            onViewDetails={handleViewDetails}
            onEditProject={(project) => {
              setCurrentProject(projects.find(p => p.id === project.id) || null)
              setIsDialogOpen(true)
            }}
            onDeleteProject={handleDeleteProject}
            onDuplicateProject={handleDuplicateProject}
            onSwitchView={handleSwitchView}
            onCreateTemplate={handleCreateTemplate}
            onQuickAssign={handleQuickAssign}
            userRole={userRole}
            onAddProject={() => {
              setCurrentProject(null)
              setIsDialogOpen(true)
            }}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}