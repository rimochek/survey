"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      localStorage.setItem("admin_token", password)
      router.push("/")
    } else {
      alert("Wrong password")
    }
  }
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="flex items-center gap-2 self-center font-medium">
          Survey admin panel
        </h1>
        <Input
          type="password"
          placeholder="enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleLogin}>Login</Button>
      </div>
    </div>
  )
}
