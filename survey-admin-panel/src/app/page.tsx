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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { supabase } from "@/lib/supabase"
import Header from "@/components/Header"
import { Theme, Question } from "@/components/Topic-Editor"

export default function Home() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [responses, setResponses] = useState<any[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    const token = localStorage.getItem("admin_token")

    if (token !== process.env.NEXT_PUBLIC_ADMIN_TOKEN) {
      router.push("/login")
    } else {
      setAuthorized(true)
    }

    const fetchThemes = async () => {
      const { data, error } = await supabase.from("topics").select("id, name")

      if (error) {
        console.error("Error fetching responses:", error)
      } else {
        setThemes(data)
      }
    }

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("topics-questions")
        .select("id, topic_id, question")

      if (error) {
        console.error("Error fetching responses:", error)
      } else {
        setQuestions(data)
      }
    }

    const fetchResponses = async () => {
      const { data, error } = await supabase
        .from("survey-responses")
        .select("*")

      if (error) {
        console.error("Error fetching responses:", error)
      } else {
        setResponses(data)
        console.log(data)
      }
    }

    fetchThemes()
    fetchQuestions()
    fetchResponses()
  }, [router])

  if (!authorized) return null

  return (
    <div>
      <Header />
      <div className="w-full overflow-x-auto px-2 md:px-6 lg:px-12 py-4">
        {themes.length !== 0 ? (
          <Tabs defaultValue={themes[0].name}>
            <TabsList>
              {themes.map((theme) => (
                <TabsTrigger value={theme.name} key={theme.id}>
                  {theme.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {themes.map((theme) => (
              <TabsContent key={theme.id} value={theme.name}>
                <Table>
                  <TableCaption>A list of your recent invoices.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">ID</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Username</TableHead>
                      {questions
                        .filter((question) => question.topic_id === theme.id)
                        .map((question) => (
                          <TableHead key={question.id}>
                            {question.question}
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses
                      .filter((response) => response.topic_id === theme.id)
                      .map((res) => (
                        <TableRow key={res.id}>
                          <TableCell className="font-medium">
                            {res.id}
                          </TableCell>
                          <TableCell>{res.created_at}</TableCell>
                          <TableCell>{res.username}</TableCell>
                          {Object.entries(res.answers).map(
                            ([questionID, answer]) => (
                              <TableCell key={questionID}>
                                {answer.answer}
                              </TableCell>
                            )
                          )}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <h1>loading...</h1>
        )}
      </div>
    </div>
  )
}
