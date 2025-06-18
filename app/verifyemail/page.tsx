'use client'
import axios from "axios"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Button } from '@/components/ui/button'
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [countdown, setCountdown] = useState(5)

  const verifyUserEmail = async () => {
    try {
      setLoading(true)
      await axios.post('/api/users/verifyemail', { token })
      setVerified(true)
      toast.success("Your email has been verified successfully!")
    } catch (error: any) {
      setError(true)
      toast.error(error.response?.data?.error || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Extract token from URL
    const urlToken = new URLSearchParams(window.location.search).get("token")
    setToken(urlToken || "")
  }, [])

  useEffect(() => {
    if (token) {
      verifyUserEmail()
    } else {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (verified || error) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push("/login")
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [verified, error, router])

  const getStatusContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <CardDescription className="text-center">
            Verifying your email address...
          </CardDescription>
        </div>
      )
    }
    
    if (verified) {
      return (
        <div className="space-y-4">
          <div className="flex justify-center text-green-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="text-center">Verification Successful!</CardTitle>
          <CardDescription className="text-center">
            Your email has been verified. You can now access all features.
          </CardDescription>
        </div>
      )
    }
    
    if (error || !token) {
      return (
        <div className="space-y-4">
          <div className="flex justify-center text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <CardTitle className="text-center">
            {token ? "Verification Failed" : "Invalid Token"}
          </CardTitle>
          <CardDescription className="text-center">
            {token 
              ? "The verification link is invalid or has expired." 
              : "Missing verification token in URL."
            }
          </CardDescription>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <CardTitle className="text-2xl font-bold text-primary-foreground">
            Email Verification
          </CardTitle>
          <CardDescription className="text-primary-foreground/80 mt-1">
            {verified ? "Account Activated" : "Confirming your account"}
          </CardDescription>
        </div>
        
        <CardContent className="p-6 space-y-6">
          {getStatusContent()}
        </CardContent>
        
        <CardFooter className="p-6 pt-0 flex flex-col space-y-4">
          {(verified || error || !token) && (
            <Button 
              onClick={() => router.push("/login")}
              className="w-full transition-all hover:scale-[1.02]"
            >
              Go to Login
            </Button>
          )}
          
          {(verified || error) && (
            <div className="text-sm text-muted-foreground">
              Redirecting in {countdown} second{countdown !== 1 ? 's' : ''}...
            </div>
          )}
          
          {!token && !loading && (
            <div className="w-full text-center text-sm text-muted-foreground">
              Need a new verification link?{" "}
              <Link 
                href='/signup'
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign up again
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}