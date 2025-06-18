"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { toast } from "sonner"
import { formatDate } from "date-fns"


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
    timeline: string
  }) => void
}

export function TaskCreationModal({ members, onCreateTask }: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [teamLeader, setTeamLeader] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [timeline, setTimeline] = useState<string>("")


  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Task title is required')
      return
    }
    if (!timeline) {
      toast.error('Please select a timeline for the task')
      return
    }

    onCreateTask({
      title,
      description,
      assignees: selectedAssignees,
      teamLeader: teamLeader || undefined,
      timeline: timeline 
    })
    
    // Reset form
    setTitle('')
    setDescription('')
    setSelectedAssignees([])
    setTeamLeader('')
    setTimeline('')
    setOpen(false)
  }

  const toggleAssignee = (memberId: string) => {
    setSelectedAssignees(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Assign Team Members</Label>
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <Checkbox
                    id={`assignee-${member.id}`}
                    checked={selectedAssignees.includes(member.id)}
                    onCheckedChange={() => toggleAssignee(member.id)}
                  />
                  <Label htmlFor={`assignee-${member.id}`} className="flex items-center gap-2 flex-1">
                    <Avatar className="size-6">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} />
                      ) : (
                        <AvatarFallback>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span>{member.name}</span>
                    <span className="text-muted-foreground text-xs">
                      ({member.role === 'TEAM_LEADER' ? 'Team Leader' : 'Member'})
                    </span>
                  </Label>
                  
                  {selectedAssignees.includes(member.id) && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`leader-${member.id}`}
                        checked={teamLeader === member.id}
                        onCheckedChange={(checked) => 
                          setTeamLeader(checked ? member.id : '')
                        }
                        disabled={member.role !== 'TEAM_LEADER'}
                      />
                      <Label 
                        htmlFor={`leader-${member.id}`} 
                        className={`text-xs ${member.role !== 'TEAM_LEADER' ? 'text-muted-foreground' : ''}`}
                      >
                        Set as Task Leader
                      </Label>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline / Due Date*</Label>
            <Input
              id="timeline"
              type="date"
              value={timeline}
              onChange={e => setTimeline(e.target.value)}
              min={formatDate(new Date(), "yyyy-MM-dd")}
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}