"use client"

import React from "react"
import { useParams } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset } from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Plus, User, Settings, PieChart, Folder, Trash2, MoreVertical } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

// Types
type TeamMember = {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "member" | "viewer"
  joinedAt: Date
  taskStats: {
    total: number
    completed: number
    overdue: number
  }
}

type TeamProject = {
  id: string
  name: string
  description: string
  startDate: Date
  endDate: Date | null
  status: "active" | "completed" | "archived"
  taskCount: number
}

type TeamRole = {
  id: string
  name: string
  permissions: string[]
  memberCount: number
}

// Mock data
const mockTeam = {
  id: "1",
  name: "Development Team",
  description: "Core team responsible for product development",
  createdAt: new Date("2023-01-15"),
  members: [
    {
      id: "1",
      name: "Alex Johnson",
      email: "alex@example.com",
      avatar: "/avatars/01.png",
      role: "admin",
      joinedAt: new Date("2023-01-20"),
      taskStats: {
        total: 12,
        completed: 8,
        overdue: 2
      }
    },
    {
      id: "2",
      name: "Sam Lee",
      email: "sam@example.com",
      avatar: "/avatars/02.png",
      role: "member",
      joinedAt: new Date("2023-02-05"),
      taskStats: {
        total: 8,
        completed: 5,
        overdue: 1
      }
    },
    {
      id: "3",
      name: "Jordan Smith",
      email: "jordan@example.com",
      avatar: "/avatars/03.png",
      role: "member",
      joinedAt: new Date("2023-03-10"),
      taskStats: {
        total: 5,
        completed: 3,
        overdue: 0
      }
    }
  ] as TeamMember[],
  projects: [
    {
      id: "1",
      name: "Website Redesign",
      description: "Complete overhaul of company website",
      startDate: new Date("2023-02-01"),
      endDate: new Date("2023-06-30"),
      status: "active",
      taskCount: 24
    },
    {
      id: "2",
      name: "Mobile App",
      description: "New mobile application development",
      startDate: new Date("2023-03-15"),
      endDate: null,
      status: "active",
      taskCount: 18
    },
    {
      id: "3",
      name: "API Integration",
      description: "Third-party API integrations",
      startDate: new Date("2023-01-10"),
      endDate: new Date("2023-04-30"),
      status: "completed",
      taskCount: 15
    }
  ] as TeamProject[],
  roles: [
    {
      id: "1",
      name: "Administrator",
      permissions: ["manage_team", "manage_members", "manage_projects"],
      memberCount: 1
    },
    {
      id: "2",
      name: "Developer",
      permissions: ["create_tasks", "edit_tasks", "view_projects"],
      memberCount: 2
    },
    {
      id: "3",
      name: "Viewer",
      permissions: ["view_tasks", "view_projects"],
      memberCount: 0
    }
  ] as TeamRole[]
}

// Form schemas
const memberFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"])
})

const roleFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  permissions: z.array(z.string()).min(1, "Select at least one permission")
})

const permissions = [
  { id: "manage_team", label: "Manage Team" },
  { id: "manage_members", label: "Manage Members" },
  { id: "manage_projects", label: "Manage Projects" },
  { id: "create_tasks", label: "Create Tasks" },
  { id: "edit_tasks", label: "Edit Tasks" },
  { id: "view_tasks", label: "View Tasks" },
  { id: "view_projects", label: "View Projects" }
]

export default function TeamPage() {
  const params = useParams()
  const teamId = params.id as string
  const team = mockTeam // In a real app, you'd fetch this data based on teamId

  // Member management
  const memberForm = useForm<z.infer<typeof memberFormSchema>>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      email: "",
      role: "member"
    }
  })

  const roleForm = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      permissions: []
    }
  })

  const handleAddMember = (values: z.infer<typeof memberFormSchema>) => {
    toast.success(`Invitation sent to ${values.email} as ${values.role}`)
    memberForm.reset()
  }

  const handleCreateRole = (values: z.infer<typeof roleFormSchema>) => {
    toast.success(`Role ${values.name} created successfully`)
    roleForm.reset()
  }

  const handleRemoveMember = (memberId: string) => {
    toast.success("Member removed from team")
  }

  const handleDeleteRole = (roleId: string) => {
    toast.success("Role deleted successfully")
  }

  const getStatusBadge = (status: TeamProject["status"]) => {
    const variants: Record<
      TeamProject["status"],
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      active: { label: "Active", variant: "default" },
      completed: { label: "Completed", variant: "secondary" },
      archived: { label: "Archived", variant: "outline" }
    }
    const { label, variant } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  const getRoleBadge = (role: TeamMember["role"]) => {
    const variants: Record<
      TeamMember["role"],
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      admin: { label: "Admin", variant: "default" },
      member: { label: "Member", variant: "secondary" },
      viewer: { label: "Viewer", variant: "outline" }
    }
    const { label, variant } = variants[role]
    return <Badge variant={variant}>{label}</Badge>
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
                <div className="mb-8">
                  <h1 className="text-3xl font-bold">{team.name}</h1>
                  <p className="text-muted-foreground">{team.description}</p>
                </div>

                <Tabs defaultValue="members" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="members">
                      <User className="h-4 w-4 mr-2" /> Members
                    </TabsTrigger>
                    <TabsTrigger value="projects">
                      <Folder className="h-4 w-4 mr-2" /> Projects
                    </TabsTrigger>
                    <TabsTrigger value="roles">
                      <Settings className="h-4 w-4 mr-2" /> Roles
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                      <PieChart className="h-4 w-4 mr-2" /> Stats
                    </TabsTrigger>
                  </TabsList>

                  {/* Members Tab */}
                  <TabsContent value="members" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Team Members</h2>
                      <Form {...memberForm}>
                        <form
                          onSubmit={memberForm.handleSubmit(handleAddMember)}
                          className="flex gap-4"
                        >
                          <FormField
                            control={memberForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={memberForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="w-32">
                                      <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit">
                            <Plus className="h-4 w-4 mr-2" /> Add
                          </Button>
                        </form>
                      </Form>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Tasks</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback>
                                    {member.name.split(" ").map((n) => n[0]).join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{member.name}</div>
                                  <div className="text-sm text-muted-foreground">{member.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getRoleBadge(member.role)}</TableCell>
                            <TableCell>
                              {member.joinedAt.toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Badge variant="outline">
                                  {member.taskStats.completed}/{member.taskStats.total} done
                                </Badge>
                                {member.taskStats.overdue > 0 && (
                                  <Badge variant="destructive">
                                    {member.taskStats.overdue} overdue
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id)}
                                disabled={member.role === "admin"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>

                  {/* Projects Tab */}
                  <TabsContent value="projects" className="space-y-6">
                    <h2 className="text-xl font-semibold">Team Projects</h2>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {team.projects.map((project) => (
                        <Card key={project.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{project.name}</CardTitle>
                                <CardDescription>{project.description}</CardDescription>
                              </div>
                              {getStatusBadge(project.status)}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Start Date</span>
                                <span>{project.startDate.toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">End Date</span>
                                <span>
                                  {project.endDate ? project.endDate.toLocaleDateString() : "Ongoing"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Tasks</span>
                                <span>{project.taskCount}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button variant="outline" className="w-full">
                              View Project
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Roles Tab */}
                  <TabsContent value="roles" className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Team Roles</h2>
                      <Form {...roleForm}>
                        <form
                          onSubmit={roleForm.handleSubmit(handleCreateRole)}
                          className="flex gap-4"
                        >
                          <FormField
                            control={roleForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Role name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit">
                            <Plus className="h-4 w-4 mr-2" /> Create Role
                          </Button>
                        </form>
                      </Form>
                    </div>

                    <Accordion type="multiple" className="w-full">
                      {team.roles.map((role) => (
                        <AccordionItem key={role.id} value={role.id}>
                          <AccordionTrigger>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{role.name}</span>
                              <Badge variant="outline">{role.memberCount} members</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Permissions</h4>
                                <div className="flex flex-wrap gap-2">
                                  {role.permissions.map((perm) => {
                                    const permission = permissions.find((p) => p.id === perm)
                                    return (
                                      <Badge key={perm} variant="secondary">
                                        {permission?.label || perm}
                                      </Badge>
                                    )
                                  })}
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteRole(role.id)}
                                  disabled={role.memberCount > 0}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </TabsContent>

                  {/* Stats Tab */}
                  <TabsContent value="stats" className="space-y-6">
                    <h2 className="text-xl font-semibold">Team Statistics</h2>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                        <CardHeader>
                          <CardTitle>Task Completion</CardTitle>
                          <CardDescription>By team member</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Member</TableHead>
                                <TableHead>Completed</TableHead>
                                <TableHead>Completion Rate</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {team.members.map((member) => (
                                <TableRow key={member.id}>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={member.avatar} />
                                        <AvatarFallback>
                                          {member.name.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{member.name}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {member.taskStats.completed}/{member.taskStats.total}
                                  </TableCell>
                                  <TableCell>
                                    {Math.round(
                                      (member.taskStats.completed / member.taskStats.total) * 100
                                    )}%
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Project Distribution</CardTitle>
                          <CardDescription>Tasks by project</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Project</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tasks</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {team.projects.map((project) => (
                                <TableRow key={project.id}>
                                  <TableCell>{project.name}</TableCell>
                                  <TableCell>{getStatusBadge(project.status)}</TableCell>
                                  <TableCell>{project.taskCount}</TableCell>
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
      </SidebarInset>
    </SidebarProvider>
  )
}