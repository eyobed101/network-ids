'use client'
import { useState } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const verifyEmail = async () => {
    try {
      setLoading(true)
      await axios.post('/api/users/forgotpassword', {email})
      toast.success("Password reset instructions sent!", {
        icon: '✉️',
        style: {
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          color: '#0c4a6e',
        }
      })
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <CardTitle className="text-2xl font-bold text-primary-foreground">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-primary-foreground/80 mt-1">
            Enter your email to receive reset instructions
          </CardDescription>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            
            <Button
              disabled={!email || loading}
              onClick={verifyEmail}
              className="w-full h-11 transition-all hover:scale-[1.02]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="p-6 pt-0">
          <div className="w-full text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link 
              href='/login'
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </div>
          

        </CardFooter>
      </Card>
    </div>
  )
}