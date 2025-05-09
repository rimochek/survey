"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { supabase } from "@/lib/supabase"

import WebApp from "@twa-dev/sdk"

const questions = [
  {
    id: 1,
    question: "What's new will you bring to this event?",
  },
  {
    id: 2,
    question: "Your own wishes",
  },
]

interface UserData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code: string
  is_premium?: boolean
}

export default function Survey() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})

  useEffect(() => {
    if (typeof window !== "undefined" && WebApp.initDataUnsafe?.user) {
      setUserData(WebApp.initDataUnsafe.user as UserData)
    }
  }, [])

  const handleFinish = async () => {
    const { data, error } = await supabase.from("survey-responses").insert([
      {
        id: userData?.id,
        answers: answers,
      },
    ])
    if (error) {
      console.error("Error saving:", error)
    } else {
      console.log("Saved!", data)
    }
  }

  const [step, setStep] = useState<number>(0)

  const nextStep = () => {
    setStep((prev) => prev + 1)
    if (step > questions.length) handleFinish()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-2xl font-semibold mb-6">
              Welcome to the Support Feedback!
            </h1>
            <Button onClick={nextStep}>Start</Button>
          </motion.div>
        )}

        {step > 0 && step <= questions.length && (
          <motion.div
            key={`question-${step}`}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl bg-white rounded-xl shadow p-6"
          >
            <p className="text-lg mb-4">{questions[step - 1].question}</p>
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
              {step === questions.length ? "Finish" : "Next"}
            </Button>
          </motion.div>
        )}

        {step > questions.length && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-2xl font-semibold mb-6">
              Thanks for answer! Wait till admin approves you
            </h1>
            <h1 className="text-2xl font-semibold mb-6">
              {userData?.first_name}
              {userData?.id}
              {userData?.username}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
