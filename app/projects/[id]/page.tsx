"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TaskCreationModal } from "../TaskModal"
import { SubtaskCreationModal } from "../SubTaskModal"

// Types
type UserRole = "OWNER" | "TEAM_LEADER" | "MEMBER"
type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED"

interface User {
  id: string
  name: string
  avatar?: string
  role: UserRole
}

interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  assignees: string[] // user IDs
  teamLeader?: string // user ID
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
}

interface Subtask {
  id: string
  title: string
  description: string
  status: TaskStatus
  assignee?: string // user ID
  createdAt: string
  updatedAt: string
}

interface ProjectUpdate {
  id: string
  date: string
  title: string
  description: string
  author: User
  comments: Comment[]
}

interface Comment {
  id: string
  content: string
  author: User
  createdAt: string
}

interface Project {
  id: string
  title: string
  description: string
  deadline: string
  progress: number
  members: User[]
  tasks: Task[]
  updates: ProjectUpdate[]
}

// Sample data with roles
const currentUser: User = {
  id: "user-1",
  name: "Alex Johnson",
  avatar: "/avatars/alex.png",
  role: "OWNER" // Change this to test different roles
}

const project: Project = {
  id: "project-1",
  title: "Website Redesign",
  description: "Complete overhaul of company website with modern design system",
  deadline: "2023-12-15",
  progress: 65,
  members: [
    { id: "user-1", name: "Alex Johnson", avatar: "/avatars/alex.png", role: "OWNER" },
    { id: "user-2", name: "Sam Lee", avatar: "/avatars/sam.png", role: "TEAM_LEADER" },
    { id: "user-3", name: "Taylor Smith", avatar: "/avatars/taylor.png", role: "MEMBER" },
    { id: "user-4", name: "Jordan Chen", role: "MEMBER" },
  ],
  tasks: [
    {
      id: "task-1",
      title: "Create wireframes",
      description: "Design wireframes for all key pages",
      status: "COMPLETED",
      assignees: ["user-1", "user-2"],
      teamLeader: "user-2",
      subtasks: [
        {
          id: "subtask-1",
          title: "Homepage wireframe",
          description: "",
          status: "COMPLETED",
          assignee: "user-1",
          createdAt: "2023-10-01",
          updatedAt: "2023-10-05"
        },
        {
          id: "subtask-2",
          title: "Product page wireframe",
          description: "",
          status: "COMPLETED",
          assignee: "user-2",
          createdAt: "2023-10-01",
          updatedAt: "2023-10-08"
        }
      ],
      createdAt: "2023-10-01",
      updatedAt: "2023-10-08"
    },
    {
      id: "task-2",
      title: "Develop component library",
      description: "Create reusable React components",
      status: "IN_PROGRESS",
      assignees: ["user-2", "user-3"],
      teamLeader: "user-2",
      subtasks: [
        {
          id: "subtask-3",
          title: "Button components",
          description: "",
          status: "COMPLETED",
          assignee: "user-3",
          createdAt: "2023-10-10",
          updatedAt: "2023-10-12"
        },
        {
          id: "subtask-4",
          title: "Navigation components",
          description: "",
          status: "IN_PROGRESS",
          assignee: "user-2",
          createdAt: "2023-10-10",
          updatedAt: "2023-10-15"
        }
      ],
      createdAt: "2023-10-10",
      updatedAt: "2023-10-15"
    },
    {
      id: "task-3",
      title: "Content migration",
      description: "Migrate all existing content to new CMS",
      status: "NOT_STARTED",
      assignees: ["user-4"],
      createdAt: "2023-10-15",
      updatedAt: "2023-10-15",
      subtasks: []
    }
  ],
  updates: [
    {
      id: "update-1",
      date: "2023-11-01",
      title: "Project Kickoff",
      description: "Initial meeting with stakeholders to align on requirements",
      author: { id: "user-1", name: "Alex Johnson", role: "OWNER" },
      comments: []
    },
    {
      id: "update-2",
      date: "2023-11-08",
      title: "Wireframes Approved",
      description: "Client signed off on initial wireframe concepts",
      author: { id: "user-2", name: "Sam Lee", role: "TEAM_LEADER" },
      comments: [
        {
          id: "comment-1",
          content: "Great work on the wireframes!",
          author: { id: "user-3", name: "Taylor Smith", role: "MEMBER" },
          createdAt: "2023-11-09"
        }
      ]
    }
  ]
}

interface Member {
  id: string
  name: string
  avatar?: string
  role: 'MEMBER' | 'TEAM_LEADER'
}

interface TaskModalProps {
  members: Member[]
  onCreateTask: (task: {
    title: string
    description: string
    assignees: string[]
    teamLeader?: string
    timeline?: string
  }) => void
}

export default function ProjectOverviewPage() {
  const [newTaskTitle, setNewTaskTitle] = React.useState("")
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("")
  const [newComment, setNewComment] = React.useState("")
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null)
  const [activeUpdateId, setActiveUpdateId] = React.useState<string | null>(null)
  const [newTeamMemberEmail, setNewTeamMemberEmail] = React.useState("")
  const [newTeamMemberRole, setNewTeamMemberRole] = React.useState<UserRole>("MEMBER")
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [selectedAssignees, setSelectedAssignees] = React.useState<string[]>([])
  const [teamLeader, setTeamLeader] = React.useState<string>('')
  const [open, setOpen] = React.useState(false)

  // Define onCreateTask function
  const onCreateTask = (task: {
    title: string
    description: string
    assignees: string[]
    teamLeader?: string
  }) => {
    // In a real app, you would add to state or make an API call
    toast.success(`Task "${task.title}" created`)
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Task title is required')
      return
    }

    onCreateTask({
      title,
      description,
      assignees: selectedAssignees,
      teamLeader: teamLeader || undefined
    })

    // Reset form
    setTitle('')
    setDescription('')
    setSelectedAssignees([])
    setTeamLeader('')
    setOpen(false)
  }

  const toggleAssignee = (memberId: string) => {
    setSelectedAssignees(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  // Check if current user is assigned to a task
  const isAssignedToTask = (task: Task) => {
    return task.assignees.includes(currentUser.id)
  }

  // Check if current user is team leader of a task
  const isTeamLeaderOfTask = (task: Task) => {
    return task.teamLeader === currentUser.id
  }

  // Check if current user can edit a task
  const canEditTask = (task: Task) => {
    return currentUser.role === "OWNER" ||
      (currentUser.role === "TEAM_LEADER" && isTeamLeaderOfTask(task))
  }

  // Check if current user can edit a subtask
  const canEditSubtask = (subtask: Subtask) => {
    return currentUser.role === "OWNER" ||
      (currentUser.role === "TEAM_LEADER" && subtask.assignee === currentUser.id)
  }

  // Filter tasks based on user role
  const filteredTasks = currentUser.role === "MEMBER"
    ? project.tasks.filter(task => isAssignedToTask(task))
    : project.tasks

  // Create new task
  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: "",
      status: "NOT_STARTED",
      assignees: [],
      subtasks: [], // Ensure subtasks is always present
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In a real app, you would add to state or make an API call
    toast.success(`Task "${newTaskTitle}" created`)
    setNewTaskTitle("")
  }

  // Create new subtask
  const handleCreateSubtask = () => {
    if (!activeTaskId || !newSubtaskTitle.trim()) return

    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle,
      description: "",
      status: "NOT_STARTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // In a real app, you would add to state or make an API call
    toast.success(`Subtask "${newSubtaskTitle}" created`)
    setNewSubtaskTitle("")
    setActiveTaskId(null)
  }

  // Add team member
  const handleAddTeamMember = () => {
    if (!newTeamMemberEmail.trim()) return

    // In a real app, you would add to state or make an API call
    toast.success(`Invitation sent to ${newTeamMemberEmail} as ${newTeamMemberRole}`)
    setNewTeamMemberEmail("")
    setNewTeamMemberRole("MEMBER")
  }

  // Add comment to update
  const handleAddComment = () => {
    if (!activeUpdateId || !newComment.trim()) return

    // In a real app, you would add to state or make an API call
    toast.success("Comment added")
    setNewComment("")
    setActiveUpdateId(null)
  }

  // Update task status
  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    // In a real app, you would update state or make an API call
    toast.success(`Task status updated to ${status}`)
  }

  // Update subtask status
  const handleUpdateSubtaskStatus = (taskId: string, subtaskId: string, status: TaskStatus) => {
    // In a real app, you would update state or make an API call
    toast.success(`Subtask status updated to ${status}`)
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

              {/* Project Overview Card */}
              <Card className="@container/card mx-6 p-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-bold">{project.title}</h1>
                        <Badge variant="outline" className="mt-2">
                          {currentUser.role}
                        </Badge>
                      </div>
                      {currentUser.role === "OWNER" && (
                        <Button variant="outline">Project Settings</Button>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-2">{project.description}</p>

                    <div className="mt-6">
                      <h3 className="font-medium mb-2">Project Progress</h3>
                      <Progress value={project.progress} className="h-2" />
                      <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                        <span>{project.progress}% complete</span>
                        <span>Deadline: {project.deadline}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-l pl-6">
                    <h3 className="font-medium mb-3">Upcoming Deadline</h3>
                    <Calendar
                      mode="single"
                      selected={new Date(project.deadline)}
                      className="rounded-md border"
                    />
                  </div>
                </div>
              </Card>

              {/* Main Content Tabs */}
              <Tabs defaultValue="tasks" className="@container/card mx-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="team">Team</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                {/* Tasks Tab */}
                <TabsContent value="tasks">
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Tasks</h2>
                      {(currentUser.role === "OWNER" || currentUser.role === "TEAM_LEADER") && (
                        // <Dialog>
                        //   <DialogTrigger asChild>
                        //     <Button size="sm">Add Task</Button>
                        //   </DialogTrigger>
                        //   <DialogContent>
                        //     <DialogHeader>
                        //       <DialogTitle>Create New Task</DialogTitle>
                        //     </DialogHeader>
                        //     <div className="grid gap-4 py-4">
                        //       <Input 
                        //         placeholder="Task title" 
                        //         value={newTaskTitle}
                        //         onChange={(e) => setNewTaskTitle(e.target.value)}
                        //       />
                        //       <Button onClick={handleCreateTask}>Create Task</Button>
                        //     </div>
                        //   </DialogContent>
                        // </Dialog>
                        <TaskCreationModal
                          members={project.members.filter(
                            (m): m is Member => m.role === "TEAM_LEADER" || m.role === "MEMBER"
                          )}
                          onCreateTask={(newTaskTitle) => {
                            // Handle task creation logic here
                            console.log('New task:', newTaskTitle)
                          }}
                        />
                      )}
                    </div>

                    <div className="space-y-4">
                      {filteredTasks.map(task => (
                        <Card key={task.id} className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            </div>
                            <Select
                              value={task.status}
                              onValueChange={(value: TaskStatus) => handleUpdateTaskStatus(task.id, value)}
                              disabled={!isAssignedToTask(task) && !canEditTask(task)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="BLOCKED">Blocked</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Assignees */}
                          <div className="mt-3 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Assigned to:</span>
                            <div className="flex -space-x-2">
                              {task.assignees.map(userId => {
                                const user = project.members.find(m => m.id === userId)
                                return user ? (
                                  <Tooltip key={userId}>
                                    <TooltipTrigger>
                                      <Avatar className="border-2 border-background size-7">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {user.name}{task.teamLeader === userId && " (Team Leader)"}
                                    </TooltipContent>
                                  </Tooltip>
                                ) : null
                              })}
                            </div>
                            {canEditTask(task) && (
                              <Button variant="ghost" size="sm" className="ml-2">
                                Manage Assignees
                              </Button>
                            )}
                          </div>

                          {/* Subtasks */}
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-sm font-medium">Subtasks</h4>
                              {(canEditTask(task) || isTeamLeaderOfTask(task)) && (
                                // <Dialog>
                                //   <DialogTrigger asChild>
                                //     <Button
                                //       variant="ghost"
                                //       size="sm"
                                //       onClick={() => setActiveTaskId(task.id)}
                                //     >
                                //       Add Subtask
                                //     </Button>
                                //   </DialogTrigger>
                                //   <DialogContent>
                                //     <DialogHeader>
                                //       <DialogTitle>Create New Subtask</DialogTitle>
                                //     </DialogHeader>
                                //     <div className="grid gap-4 py-4">
                                //       <Input
                                //         placeholder="Subtask title"
                                //         value={newSubtaskTitle}
                                //         onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                //       />
                                //       <Button onClick={handleCreateSubtask}>Create Subtask</Button>
                                //     </div>
                                //   </DialogContent>
                                // </Dialog>
                                <SubtaskCreationModal
                                  members={project.members.filter(
                                    (m): m is Member => m.role === "TEAM_LEADER" || m.role === "MEMBER"
                                  )}
                                  taskMembers={task.assignees} // Pass IDs of task members
                                  onCreateSubtask={(subtask) => {
                                    // Handle subtask creation
                                    console.log('New subtask:', subtask)
                                  }}
                                // Optional custom trigger:
                                // trigger={<Button variant="ghost">+ Add Subtask</Button>}
                                />
                              )}
                            </div>

                            {task.subtasks.length > 0 ? (
                              <div className="space-y-2">
                                {task.subtasks.map(subtask => (
                                  <div key={subtask.id} className="flex items-center gap-3 p-2 border rounded">
                                    <Checkbox
                                      checked={subtask.status === "COMPLETED"}
                                      onCheckedChange={(checked) => {
                                        handleUpdateSubtaskStatus(
                                          task.id,
                                          subtask.id,
                                          checked ? "COMPLETED" : "NOT_STARTED"
                                        )
                                      }}
                                      disabled={!canEditSubtask(subtask) && subtask.assignee !== currentUser.id}
                                    />
                                    <div className="flex-1">
                                      <p className={subtask.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}>
                                        {subtask.title}
                                      </p>
                                      {subtask.assignee && (
                                        <div className="flex items-center gap-1 mt-1">
                                          <Avatar className="size-4">
                                            <AvatarImage src={
                                              project.members.find(m => m.id === subtask.assignee)?.avatar
                                            } />
                                            <AvatarFallback>
                                              {project.members.find(m => m.id === subtask.assignee)?.name.charAt(0)}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-xs text-muted-foreground">
                                            {project.members.find(m => m.id === subtask.assignee)?.name}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <Select
                                      value={subtask.status}
                                      onValueChange={(value: TaskStatus) =>
                                        handleUpdateSubtaskStatus(task.id, subtask.id, value)
                                      }
                                      disabled={!canEditSubtask(subtask) && subtask.assignee !== currentUser.id}
                                    >
                                      <SelectTrigger className="w-28 h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No subtasks yet</p>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team">
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">Team Members</h2>
                      {currentUser.role === "OWNER" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">Add Member</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Team Member</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <Input
                                placeholder="Email address"
                                value={newTeamMemberEmail}
                                onChange={(e) => setNewTeamMemberEmail(e.target.value)}
                              />
                              <Select
                                value={newTeamMemberRole}
                                onValueChange={(value: UserRole) => setNewTeamMemberRole(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MEMBER">Member</SelectItem>
                                  <SelectItem value="TEAM_LEADER">Team Leader</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button onClick={handleAddTeamMember}>Send Invitation</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      {project.members.map((member) => (
                        <Card key={member.id} className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-10">
                              {member.avatar ? (
                                <AvatarImage src={member.avatar} alt={member.name} />
                              ) : (
                                <AvatarFallback>
                                  {member.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">{member.role.toLowerCase().replace('_', ' ')}</p>
                            </div>
                          </div>
                          {currentUser.role === "OWNER" && member.role !== "OWNER" && (
                            <div className="mt-3 flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                Edit
                              </Button>
                              <Button variant="destructive" size="sm" className="flex-1">
                                Remove
                              </Button>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline">
                  <Card className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Project Updates</h2>

                    <ScrollArea className="h-[400px]">
                      <div className="space-y-4">
                        {project.updates.map((update) => (
                          <Card key={update.id} className="p-4">
                            <div className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <Avatar className="size-8">
                                  <AvatarImage src={update.author.avatar} />
                                  <AvatarFallback>{update.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium">{update.title}</h3>
                                  <Badge variant="outline">
                                    {update.date}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {update.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Posted by {update.author.name}
                                </p>

                                {/* Comments */}
                                {update.comments.length > 0 && (
                                  <div className="mt-4 space-y-3">
                                    {update.comments.map(comment => (
                                      <div key={comment.id} className="flex gap-3 pl-4 border-l-2">
                                        <Avatar className="size-6 mt-1">
                                          <AvatarImage src={comment.author.avatar} />
                                          <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="text-sm font-medium">{comment.author.name}</p>
                                          <p className="text-sm">{comment.content}</p>
                                          <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Add comment */}
                                <div className="mt-4 flex gap-2">
                                  <Input
                                    placeholder="Add a comment..."
                                    value={activeUpdateId === update.id ? newComment : ""}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onFocus={() => setActiveUpdateId(update.id)}
                                  />
                                  {activeUpdateId === update.id && (
                                    <Button
                                      size="sm"
                                      onClick={handleAddComment}
                                      disabled={!newComment.trim()}
                                    >
                                      Post
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}