"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";



export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
  try {
    setLoading(true);

    const callbackUrl = searchParams?.get('callbackUrl') || '/';


    const res = await signIn("credentials", {
      redirect: false, // Prevent automatic redirects
      email: user.email,
      password: user.password,
      callbackUrl // Update to your dashboard URL

    });

    console.log("Login response:", res);

    if (res?.error) {
      toast.error("Email or Password is incorrect");
    } else {
      toast.success("Login successful");
      window.location.href = "/dashboard";

    }
  } catch (error: any) {
    toast.error(error.message || "Email or Password is incorrect");
  } finally {
    setLoading(false);
  }
};

  

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-0 shadow-lg rounded-xl overflow-hidden">
        <div className="bg-primary p-6 text-center">
          <CardTitle className="text-2xl font-bold text-primary-foreground">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-primary-foreground/80 mt-1">
            Sign in to continue your journey
          </CardDescription>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div>
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <Link
                  href="/forgotpassword"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="mt-1 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
          </div>

          <Button
            disabled={!user.email || !user.password || loading}
            onClick={onLogin}
            className="w-full h-11 transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <div className="w-full text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Create account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
