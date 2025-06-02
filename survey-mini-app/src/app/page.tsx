"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { supabase } from "@/lib/supabase"

import WebApp from "@twa-dev/sdk"

interface UserData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code: string
  is_premium?: boolean
}

export type Theme = {
  id: number | null
  name: string
  isNew?: boolean
}

export type Question = {
  id: number | null
  topic_id: number | null
  question: string
  isNew?: boolean
  isUpdated?: boolean
}

export default function Survey() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [themes, setThemes] = useState<Theme[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedTheme, setSelectedTheme] = useState<Theme>()
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [isAlreadySubmitted, setAlreadySubmitted] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window !== "undefined" && WebApp.initDataUnsafe?.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData)
    }
    const checkIfSubmitted = async () => {
      if (!userData?.id) return

      const { data: existing, error: checkError } = await supabase
        .from("survey-responses")
        .select("id")
        .eq("id", userData.id)
        .maybeSingle()

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Check error:", checkError)
        return
      }
      if (existing) {
        setAlreadySubmitted(true)
      }
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

    fetchThemes()
    fetchQuestions()
    checkIfSubmitted()
  }, [userData])

  const handleFinish = async () => {
    const answersArray = Object.entries(answers).map(
      ([questionId, answer]) => ({
        questionId: Number(questionId),
        answer,
      })
    )
    const { data, error } = await supabase.from("survey-responses").insert([
      {
        username: userData?.id,
        answers: answersArray,
        topic_id: selectedTheme?.id,
      },
    ])
    if (error) {
      console.error("Error saving:", error)
    } else {
      console.log("Saved!", data)
    }
  }

  const [step, setStep] = useState<number>(0)

  const selectTheme = (theme: Theme) => {
    setSelectedTheme(theme)
    setSelectedQuestions(
      questions.filter((question) => question.topic_id === theme.id)
    )
    nextStep()
  }

  const nextStep = () => {
    if (step === selectedQuestions.length) {
      handleFinish()
      setStep((prev) => prev + 1)
    } else {
      setStep((prev) => prev + 1)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <AnimatePresence mode="wait">
        {step === 0 && !isAlreadySubmitted && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-2xl font-semibold mb-1">
              Welcome to the Support Feedback!
            </h1>
            <p className="mb-6 text-xl">Click on the liked theme to choose</p>
            <div className="flex flex-col items-center justify-center">
              {themes.map((theme) => (
                <Button
                  key={theme.id}
                  onClick={() => selectTheme(theme)}
                  className="w-60 h-30 text-2xl mb-2"
                >
                  {theme.name}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedTheme && step > 0 && step <= selectedQuestions.length && (
          <motion.div
            key={`question-${step}`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl bg-white rounded-xl shadow p-6"
          >
            <p className="text-lg mb-4">
              {selectedQuestions[step - 1].question}
            </p>
            <Input
              value={answers[step] || ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [step]: e.target.value,
                }))
              }
              placeholder="Your answer..."
            />
            <p className="text-lg mb-4">{}</p>
            <Button onClick={nextStep} className="mt-4">
              {step === selectedQuestions.length ? "Finish" : "Next"}
            </Button>
          </motion.div>
        )}

        {step > selectedQuestions.length && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-2xl font-semibold mb-6">
              Thanks for answer! Your feedback is really worthy
            </h1>
            <h1 className="text-2xl font-semibold mb-6">
              {userData?.first_name}
              {userData?.id}
              {userData?.username}
            </h1>
          </motion.div>
        )}

        {isAlreadySubmitted && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-2xl font-semibold mb-6">
              You already sent this form. Wait for response
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
