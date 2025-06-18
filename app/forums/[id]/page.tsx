// app/forums/[id]/page.tsx
"use client"

import { useState } from "react"
import {
    MessageSquare,
    Users,
    ChevronLeft,
    Plus,
    MessageCircleReply,
    Clock,
    Pin,
    MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"

type ForumRole = 'member' | 'moderator' | 'admin'

interface User {
    id: string
    name: string
    email: string
    avatar?: string
}

interface ForumPost {
    id: string
    content: string
    author: User
    createdAt: Date
    updatedAt: Date
    parentId?: string
    replies: ForumPost[]
    pinned?: boolean
}

interface ForumThread {
    id: string
    title: string
    author: User
    createdAt: Date
    updatedAt: Date
    pinned?: boolean
    locked?: boolean
    postCount: number
    initialPost: ForumPost
}

const mockUsers: User[] = [
    { id: '1', name: 'You', email: 'you@example.com', avatar: '/avatars/you.jpg' },
    { id: '2', name: 'John Doe', email: 'john@example.com', avatar: '/avatars/john.jpg' },
    { id: '3', name: 'Jane Smith', email: 'jane@example.com' },
]

const mockThreads: ForumThread[] = [
    {
        id: 'thread1',
        title: 'New Feature Proposal: Dark Mode',
        author: mockUsers[1],
        createdAt: new Date('2024-05-10'),
        updatedAt: new Date('2024-05-18'),
        pinned: true,
        postCount: 7,
        initialPost: {
            id: 'post1',
            content: 'I propose we add a dark mode option to our application. Many users have requested this feature and it would improve accessibility.',
            author: mockUsers[1],
            createdAt: new Date('2024-05-10'),
            updatedAt: new Date('2024-05-10'),
            replies: [
                {
                    id: 'post2',
                    content: 'Great idea! I can help with the implementation.',
                    author: mockUsers[2],
                    createdAt: new Date('2024-05-11'),
                    updatedAt: new Date('2024-05-11'),
                    parentId: 'post1',
                    replies: []
                }
            ]
        }
    },
    {
        id: 'thread2',
        title: 'Bug Report: Login Page Issue',
        author: mockUsers[0],
        createdAt: new Date('2024-05-15'),
        updatedAt: new Date('2024-05-17'),
        postCount: 3,
        initialPost: {
            id: 'post3',
            content: 'Users are reporting that the login page fails on Safari browsers. Error occurs when submitting the form.',
            author: mockUsers[0],
            createdAt: new Date('2024-05-15'),
            updatedAt: new Date('2024-05-15'),
            replies: []
        }
    }
]

export default function ForumDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [newThreadOpen, setNewThreadOpen] = useState(false)
    const [newThread, setNewThread] = useState({
        title: '',
        content: ''
    })
    const [replyingTo, setReplyingTo] = useState<string | null>(null)
    const [replyContent, setReplyContent] = useState('')

    // In a real app, you would fetch the forum details based on params.id
    const forum = {
        id: params.id,
        title: 'Product Development',
        description: 'Discussion about our product roadmap and features',
        members: [
            { userId: '1', role: 'admin' },
            { userId: '2', role: 'moderator' },
            { userId: '3', role: 'member' },
        ]
    }

    const createNewThread = () => {
        if (!newThread.title.trim() || !newThread.content.trim()) return

        const createdThread: ForumThread = {
            id: `thread-${Date.now()}`,
            title: newThread.title,
            author: mockUsers[0], // Current user
            createdAt: new Date(),
            updatedAt: new Date(),
            postCount: 1,
            initialPost: {
                id: `post-${Date.now()}`,
                content: newThread.content,
                author: mockUsers[0],
                createdAt: new Date(),
                updatedAt: new Date(),
                replies: []
            }
        }

        // In a real app, you would add this to your state management
        console.log("Created new thread:", createdThread)
        setNewThread({ title: '', content: '' })
        setNewThreadOpen(false)
    }

    const addReply = () => {
        if (!replyContent.trim() || !replyingTo) return

        // In a real app, you would add this to your state management
        console.log("Added reply to", replyingTo, ":", replyContent)
        setReplyContent('')
        setReplyingTo(null)
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
                <div className="container mx-auto p-4 space-y-6">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="mb-4"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Forums
                    </Button>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{forum.title}</h1>
                            <p className="text-muted-foreground">{forum.description}</p>
                        </div>
                        <Button onClick={() => setNewThreadOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Thread
                        </Button>
                    </div>

                    {/* New Thread Dialog */}
                    {newThreadOpen && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Thread</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Title</Label>
                                    <Input
                                        value={newThread.title}
                                        onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                                        placeholder="Thread title"
                                    />
                                </div>
                                <div>
                                    <Label>Content</Label>
                                    <Textarea
                                        value={newThread.content}
                                        onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                                        placeholder="Your message"
                                        rows={5}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setNewThreadOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={createNewThread}>
                                    Post Thread
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Pinned Threads */}
                    {mockThreads.filter(t => t.pinned).length > 0 && (
                        <div className="space-y-2">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Pin className="h-4 w-4" />
                                Pinned Threads
                            </h2>
                            <div className="space-y-4">
                                {mockThreads.filter(t => t.pinned).map(thread => (
                                    <ThreadCard
                                        key={thread.id}
                                        thread={thread}
                                        onReply={setReplyingTo}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Threads */}
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold">
                            {mockThreads.filter(t => !t.pinned).length} Threads
                        </h2>
                        <div className="space-y-4">
                            {mockThreads.filter(t => !t.pinned).map(thread => (
                                <ThreadCard
                                    key={thread.id}
                                    thread={thread}
                                    onReply={setReplyingTo}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Reply Dialog */}
                    {replyingTo && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Post Reply</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    placeholder="Your reply"
                                    rows={3}
                                />
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setReplyingTo(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={addReply}>
                                    Post Reply
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

function ThreadCard({ thread, onReply }: {
    thread: ForumThread,
    onReply: (postId: string) => void
}) {
    const [expanded, setExpanded] = useState(false)

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">
                        {thread.pinned && <Pin className="inline h-4 w-4 text-primary mr-2" />}
                        {thread.title}
                    </CardTitle>
                    <Badge variant="outline">
                        {thread.postCount} {thread.postCount === 1 ? 'reply' : 'replies'}
                    </Badge>
                </div>
                <CardDescription className="pt-1">
                    Started by {thread.author.name} • {thread.createdAt.toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="py-2">
                <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 mt-1">
                        {thread.initialPost.author.avatar && <AvatarImage src={thread.initialPost.author.avatar} />}
                        <AvatarFallback>
                            {thread.initialPost.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="text-sm text-muted-foreground">
                            {thread.initialPost.createdAt.toLocaleDateString()}
                        </div>
                        <p className="mt-1">{thread.initialPost.content}</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => onReply(thread.initialPost.id)}
                        >
                            <MessageCircleReply className="mr-2 h-4 w-4" />
                            Reply
                        </Button>
                    </div>
                </div>

                {expanded && thread.initialPost.replies.length > 0 && (
                    <div className="mt-4 pl-12 space-y-4 border-l-2 border-muted">
                        {thread.initialPost.replies.map(reply => (
                            <div key={reply.id} className="flex items-start gap-3">
                                <Avatar className="h-8 w-8 mt-1">
                                    {reply.author.avatar && <AvatarImage src={reply.author.avatar} />}
                                    <AvatarFallback>
                                        {reply.author.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="text-sm text-muted-foreground">
                                        {reply.author.name} • {reply.createdAt.toLocaleDateString()}
                                    </div>
                                    <p className="mt-1">{reply.content}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="mt-2"
                                        onClick={() => onReply(reply.id)}
                                    >
                                        <MessageCircleReply className="mr-2 h-4 w-4" />
                                        Reply
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {thread.initialPost.replies.length > 0 && (
                    <Button
                        variant="link"
                        size="sm"
                        className="mt-2 pl-12"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Hide replies' : `Show ${thread.initialPost.replies.length} replies`}
                    </Button>
                )}
            </CardContent>
            <CardFooter className="flex justify-between pt-3">
                <div className="text-sm text-muted-foreground">
                    Last updated {thread.updatedAt.toLocaleDateString()}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'Collapse' : 'Expand'}
                </Button>
            </CardFooter>
        </Card>
    )
}