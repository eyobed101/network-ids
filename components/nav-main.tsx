"use client"

import { IconCirclePlusFilled, IconMail, type Icon, IconX, IconArrowRight } from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
}) {
  const pathname = usePathname()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    {
      title: "Welcome to Our Collaboration Platform",
      description: "Our platform helps teams work together seamlessly with real-time collaboration, task management, and file sharing."
    },
    {
      title: "Key Features",
      description: "Enjoy features like project boards, team chat, document collaboration, and automated workflows."
    },
    {
      title: "Get Started",
      description: "Create your first project or invite team members to begin collaborating right away!"
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsPopupOpen(false)
      setCurrentStep(1)
    }
  }

  const handleSkip = () => {
    setIsPopupOpen(false)
    setCurrentStep(1)
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent className="flex flex-col gap-2">
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                onClick={() => setIsPopupOpen(true)}
              >
                <IconCirclePlusFilled />
                <span>Quick Create</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}
                  asChild
                  isActive={pathname === item.url}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{steps[currentStep - 1].title}</DialogTitle>
            <DialogDescription>
              {steps[currentStep - 1].description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center gap-2 py-4">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-2 w-2 rounded-full ${currentStep === index + 1 ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              variant="ghost" 
              onClick={handleSkip}
              className="gap-1"
            >
              <IconX size={16} />
              Skip
            </Button>
            <Button 
              onClick={handleNext}
              className="gap-1"
            >
              {currentStep === steps.length ? 'Get Started' : 'Next'}
              <IconArrowRight size={16} />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}