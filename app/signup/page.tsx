'use client'
import Link from "next/link"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
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
import { signIn } from "next-auth/react"

const BASEURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export default function SignupPage() {
  const router = useRouter()
  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
  })
  const [errors, setErrors] = useState({
    password: "",
  })

  const [loading, setLoading] = useState(false)

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters"
    }
    if (password.length > 32) {
      return "Password must be no more than 32 characters"
    }
    if (!/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number or special character"
    }
    return ""
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setUser({ ...user, password: newPassword })
    setErrors({ ...errors, password: validatePassword(newPassword) })
  }

  const onSignup = async () => {
    const passwordError = validatePassword(user.password)
    if (passwordError) {
      setErrors({ ...errors, password: passwordError })
      return
    }

    try {
      setLoading(true)
      
      // First register the user
      const registerResponse = await fetch(`${BASEURL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })

      const registerData = await registerResponse.json()

      if (registerResponse.ok) {
        toast.success("Account created successfully!")
        
        // Automatically sign in the user after registration
        const signInResponse = await signIn('credentials', {
          redirect: false,
          email: user.email,
          password: user.password,
          callbackUrl: '/dashboard'
        })

        if (signInResponse?.error) {
          toast.error("Account created! Please sign in.")
          router.push('/login')
        } else {
          toast.success("Welcome! You're now signed in.")
          router.push('/dashboard')
        }
      } else {
        throw new Error(registerData.error || "Registration failed")
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = user.username.length > 0 && 
                     user.email.length > 0 && 
                     user.password.length >= 8 &&
                     !errors.password

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <CardTitle className="text-2xl font-bold text-primary-foreground">
            Create Account
          </CardTitle>
          <CardDescription className="text-primary-foreground/80 mt-1">
            Join our community today
          </CardDescription>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Your unique name"
                value={user.username}
                onChange={(e) => setUser({...user, username: e.target.value})}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={user.email}
                onChange={(e) => setUser({...user, email: e.target.value})}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters with uppercase, lowercase, and number/special char"
                value={user.password}
                onChange={handlePasswordChange}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                <p>Password requirements:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li className={user.password.length >= 8 ? "text-green-500" : ""}>
                    8-32 characters
                  </li>
                  <li className={/[A-Z]/.test(user.password) ? "text-green-500" : ""}>
                    At least one uppercase letter
                  </li>
                  <li className={/[a-z]/.test(user.password) ? "text-green-500" : ""}>
                    At least one lowercase letter
                  </li>
                  <li className={/((?=.*\d)|(?=.*\W+))/.test(user.password) ? "text-green-500" : ""}>
                    At least one number or special character
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            disabled={!isFormValid || loading}
            onClick={onSignup}
            className="w-full h-11 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Create Account"
            )}
          </Button>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <div className="w-full text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
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