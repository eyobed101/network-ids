'use client'
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function PasswordReset() {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showToken, setShowToken] = useState(false)

  const changePassword = async () => {
    try {
      setLoading(true)
      const response = await axios.post('/api/users/passwordreset/', {token, password})
      toast.success("Password changed successfully!", {
        icon: '🔒',
        style: {
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
        }
      })
      router.push("/login")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Password reset failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get("token")
    setToken(urlToken || "")
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <CardTitle className="text-2xl font-bold text-primary-foreground">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-primary-foreground/80 mt-1">
            Create a new secure password
          </CardDescription>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-foreground">New Password</Label>
              <Input 
                type="password" 
                placeholder="Enter a strong password" 
                value={password} 
                id="password" 
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Token status: 
                <span className={`ml-2 ${token ? 'text-green-600' : 'text-amber-600'}`}>
                  {token ? 'Valid' : 'Missing'}
                </span>
              </div>
              
              <HoverCard>
                <HoverCardTrigger>
                  <Button 
                    variant="link" 
                    className="text-primary text-sm p-0 h-auto"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? 'Hide Token' : 'Show Token'}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-full max-w-xs break-words text-sm">
                  {token ? `${token}` : "No token found in URL"}
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
          
          <Button
            disabled={!password || !token || loading}
            onClick={changePassword}
            className="w-full h-11 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Update Password"
            )}
          </Button>
        </CardContent>
        
        <CardFooter className="p-6 pt-0">
          <div className="w-full text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Button 
              variant="link" 
              className="text-primary text-sm p-0 h-auto"
              onClick={() => router.push("/login")}
            >
              Sign in
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}