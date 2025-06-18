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
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "date-fns"



interface Member {
  id: string
  name: string
  avatar?: string
  role: 'MEMBER' | 'TEAM_LEADER'
}

interface SubtaskModalProps {
  members: Member[]
  taskMembers: string[]
  onCreateSubtask: (subtask: {
    title: string
    description: string
    assignee?: string
    timeline: string
  }) => void
  trigger?: React.ReactNode
}

export function SubtaskCreationModal({ 
  members, 
  taskMembers,
  onCreateSubtask,
  trigger 
}: SubtaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState<string | undefined>(undefined)
  const [open, setOpen] = useState(false)
    const [timeline, setTimeline] = useState<string>("")


  // Filter members to only those assigned to the parent task
  const availableMembers = members.filter(member => 
    taskMembers.includes(member.id)
  )

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Subtask title is required')
      return
    }

    if (!timeline) {
      toast.error('Please select a timeline for the task')
      return
    }

    onCreateSubtask({
      title,
      description,
      assignee, 
      timeline
    })
    
    setTitle('')
    setDescription('')
    setAssignee(undefined)
    setOpen(false)
    setTimeline('')

  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm" variant="outline">Add Subtask</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Subtask</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subtask-title">Subtask Title*</Label>
            <Input
              id="subtask-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter subtask title"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subtask-description">Description</Label>
            <Textarea
              id="subtask-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter subtask description"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select 
              value={assignee ?? "unassigned"}
              onValueChange={(value) => setAssignee(value === "unassigned" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee">
                  {assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-5">
                        <AvatarImage src={members.find(m => m.id === assignee)?.avatar} />
                        <AvatarFallback>
                          {members.find(m => m.id === assignee)?.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{members.find(m => m.id === assignee)?.name}</span>
                    </div>
                  ) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableMembers.length > 0 ? (
                  <>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {availableMembers.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-5">
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt={member.name} />
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
                        </div>
                      </SelectItem>
                    ))}
                  </>
                ) : (
                  <SelectItem disabled value="no-members">
                    No available members
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
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
              Create Subtask
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}