"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [responses, setResponses] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem("admin_token")

    if (token !== process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      router.push("/login")
    } else {
      setAuthorized(true)
    }

    const fetchResponses = async () => {
      const { data, error } = await supabase
        .from("survey-responses")
        .select("*")

      if (error) {
        console.error("Error fetching responses:", error)
      } else {
        setResponses(data)
      }
      console.log(data)
    }

    fetchResponses()
  }, [router])

  const handleUpdateStatus = async (
    id: number,
    newStatus: "Accepted" | "Rejected"
  ) => {
    const { error } = await supabase
      .from("survey-responses")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      console.error("Status update error:", error)
      alert("Failed to update status")
      return
    }

    await fetch(`${process.env.NEXT_PUBLIC_BOT_NOTIFY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telegram_id: id,
        approved: newStatus,
      }),
    })

    setResponses((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
    )
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/login")
  }

  if (!authorized) return null

  return (
    <div>
      <div className="w-full p-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
      <div className="w-full overflow-x-auto px-2 md:px-6 lg:px-12 py-4">
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>What will he bring?</TableHead>
              <TableHead>Wishes</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {responses.map((res) => (
              <TableRow key={res.id}>
                <TableCell className="font-medium">{res.id}</TableCell>
                <TableCell>{res.created_at}</TableCell>
                <TableCell>{res.username}</TableCell>
                <TableCell>{res.answers[0].answer}</TableCell>
                <TableCell>{res.answers[1].answer}</TableCell>
                <TableCell>
                  {res.status ?? (
                    <div>
                      <Button
                        className="bg-green-500 mr-2"
                        onClick={() => handleUpdateStatus(res.id, "Accepted")}
                      >
                        Accept
                      </Button>
                      <Button
                        className="bg-red-500"
                        onClick={() => handleUpdateStatus(res.id, "Rejected")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
