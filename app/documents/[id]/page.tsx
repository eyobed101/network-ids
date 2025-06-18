"use client";

import { File, Folder, Download, Upload, Edit, Users, Lock, Plus, Search, MoreVertical, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";

type Permission = 'read' | 'write' | 'admin'
type ResourceType = 'file' | 'folder'

interface User {
    id: string
    name: string
    email: string
    avatar?: string
}

interface Resource {
    id: string
    name: string
    type: ResourceType
    owner: User
    createdAt: Date
    updatedAt: Date
    size?: number
    permissions: {
        userId: string
        permission: Permission
    }[]
    parentId?: string
}

const mockUsers: User[] = [
    { id: '1', name: 'You', email: 'you@example.com', avatar: '/avatars/you.jpg' },
    { id: '2', name: 'John Doe', email: 'john@example.com', avatar: '/avatars/john.jpg' },
    { id: '3', name: 'Jane Smith', email: 'jane@example.com' },
]

const mockResources: Resource[] = [
    {
        id: 'doc1',
        name: 'Project Documentation',
        type: 'folder',
        owner: mockUsers[0],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-05-20'),
        permissions: [
            { userId: '1', permission: 'admin' },
            { userId: '2', permission: 'write' },
            { userId: '3', permission: 'read' },
        ]
    },
    {
        id: 'spec1',
        name: 'Technical Spec.pdf',
        type: 'file',
        owner: mockUsers[0],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-05-18'),
        size: 2456789,
        parentId: 'doc1',
        permissions: [
            { userId: '1', permission: 'admin' },
            { userId: '2', permission: 'write' },
        ]
    },
    {
        id: 'assets1',
        name: 'Marketing Assets',
        type: 'folder',
        owner: mockUsers[1],
        createdAt: new Date('2024-03-05'),
        updatedAt: new Date('2024-05-15'),
        parentId: 'doc1',
        permissions: [
            { userId: '1', permission: 'write' },
            { userId: '2', permission: 'admin' },
        ]
    },
]

export default function DocumentRepositoryPage({ params }: { params: { id: string } }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentFolder, setCurrentFolder] = useState<Resource | null>(null)
    const [selectedUsers, setSelectedUsers] = useState<string[]>([])
    const [newResourceName, setNewResourceName] = useState('')
    const [newResourceType, setNewResourceType] = useState<ResourceType | undefined>('file')
    const [currentUser] = useState<User>(mockUsers[0])

    // Find the current repository
    const repository = mockResources.find(r => r.id === params.id)

    // Get resources in current folder
    const getResourcesInFolder = () => {
        if (!currentFolder) {
            return mockResources.filter(r => r.parentId === params.id)
        }
        return mockResources.filter(r => r.parentId === currentFolder.id)
    }

    const resources = getResourcesInFolder()

    const filteredResources = resources.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const canEdit = (resource: Resource) => {
        const permission = resource.permissions.find(p => p.userId === currentUser.id)
        return permission?.permission === 'write' || permission?.permission === 'admin'
    }

    const isOwner = (resource: Resource) => {
        return resource.owner.id === currentUser.id
    }

    const createNewResource = () => {
        if (!newResourceName.trim()) return

        if (!newResourceType) return

        const newResource: Resource = {
            id: `${newResourceType}-${Date.now()}`,
            name: newResourceName,
            type: newResourceType,
            owner: currentUser,
            createdAt: new Date(),
            updatedAt: new Date(),
            parentId: currentFolder ? currentFolder.id : params.id,
            permissions: [
                { userId: currentUser.id, permission: 'admin' },
                ...selectedUsers.map(userId => ({ userId, permission: 'read' as Permission }))
            ]
        }

        // In a real app, you would add this to your state management
        console.log("Created new resource:", newResource)
        setNewResourceName('')
        setSelectedUsers([])
    }

    const navigateToFolder = (folder: Resource) => {
        setCurrentFolder(folder)
    }

    const navigateUp = () => {
        if (!currentFolder) return
        const parent = mockResources.find(r => r.id === currentFolder.parentId)
        setCurrentFolder(parent || null)
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
                <div className="container mx-auto p-6 space-y-6">
                    {/* Breadcrumb Navigation */}
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/documents">Repositories</BreadcrumbLink>
                        </BreadcrumbItem>
                        {currentFolder && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={`/documents/${params.id}`}>
                                        {repository?.name}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink>{currentFolder.name}</BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        )}
                    </Breadcrumb>

                    {/* Header with search and actions */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {currentFolder ? currentFolder.name : repository?.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {currentFolder
                                    ? `Inside ${repository?.name}`
                                    : "Repository"}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search in this folder..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setNewResourceType('file')}>
                                        <File className="mr-2 h-4 w-4" />
                                        New File
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setNewResourceType('folder')}>
                                        <Folder className="mr-2 h-4 w-4" />
                                        New Folder
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Create New Resource Dialog */}
                    {newResourceType && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>
                                    Create New {newResourceType === 'file' ? 'File' : 'Folder'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={newResourceName}
                                        onChange={(e) => setNewResourceName(e.target.value)}
                                        placeholder={`Enter ${newResourceType} name`}
                                    />
                                </div>

                                <div>
                                    <Label>Share With</Label>
                                    <div className="space-y-2 mt-2">
                                        {mockUsers.filter(u => u.id !== currentUser.id).map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        {user.avatar && <AvatarImage src={user.avatar} />}
                                                        <AvatarFallback>
                                                            {user.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={selectedUsers.includes(user.id)}
                                                    onCheckedChange={(checked) => {
                                                        setSelectedUsers(checked
                                                            ? [...selectedUsers, user.id]
                                                            : selectedUsers.filter(id => id !== user.id))
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setNewResourceType(undefined)}>
                                    Cancel
                                </Button>
                                <Button onClick={createNewResource}>
                                    Create
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Resources Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Contents</CardTitle>
                                {currentFolder && (
                                    <Button variant="ghost" onClick={navigateUp}>
                                        Back to Parent
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[300px]">Name</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Last Modified</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Access</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredResources.map((resource) => (
                                        <TableRow key={resource.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    {resource.type === 'folder' ? (
                                                        <Folder className="h-5 w-5 text-primary" />
                                                    ) : (
                                                        <File className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                    {resource.type === 'folder' ? (
                                                        <Button
                                                            variant="link"
                                                            className="p-0 h-auto"
                                                            onClick={() => navigateToFolder(resource)}
                                                        >
                                                            {resource.name}
                                                        </Button>
                                                    ) : (
                                                        <span>{resource.name}</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        {resource.owner.avatar && <AvatarImage src={resource.owner.avatar} />}
                                                        <AvatarFallback>
                                                            {resource.owner.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{resource.owner.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(resource.updatedAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                {resource.size ? `${(resource.size / 1024 / 1024).toFixed(2)} MB` : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={isOwner(resource) ? 'default' : 'outline'}>
                                                    {isOwner(resource) ? 'Owner' : 'Member'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon">
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    {canEdit(resource) && (
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Upload className="mr-2 h-4 w-4" />
                                                                    Upload New Version
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Rename
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Users className="mr-2 h-4 w-4" />
                                                                    Manage Access
                                                                </DropdownMenuItem>
                                                                {isOwner(resource) && (
                                                                    <DropdownMenuItem className="text-destructive">
                                                                        <Lock className="mr-2 h-4 w-4" />
                                                                        Remove
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Repository Details Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Repository Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label>General Information</Label>
                                <div className="space-y-4 mt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Created</span>
                                        <span>{repository?.createdAt.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Last Updated</span>
                                        <span>{repository?.updatedAt.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Total Items</span>
                                        <span>{resources.length}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label>Access Management</Label>
                                <div className="space-y-2 mt-2">
                                    {repository?.permissions.map(perm => {
                                        const user = mockUsers.find(u => u.id === perm.userId)
                                        if (!user) return null
                                        return (
                                            <div key={perm.userId} className="flex items-center justify-between p-2 border rounded">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        {user.avatar && <AvatarImage src={user.avatar} />}
                                                        <AvatarFallback>
                                                            {user.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                                <Badge variant={perm.permission === 'admin' ? 'default' : 'outline'}>
                                                    {perm.permission}
                                                </Badge>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}