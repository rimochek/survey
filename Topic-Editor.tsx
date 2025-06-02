import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

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
}

export type ToastType = "success" | "error" | "loading" | null

export default function TopicEditor() {
  const [themes, setThemes] = useState<Theme[]>([])
  const [deletedThemeIds, setDeletedThemeIds] = useState<number[]>([])
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [newTheme, setNewTheme] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [toastType, setToastType] = useState<ToastType>(null)

  useEffect(() => {
    const fetchThemes = async () => {
      const { data, error } = await supabase.from("topics").select("id, name")

      if (error) {
        console.error("Error fetching responses:", error)
      } else {
        setThemes(data)
      }
      console.log(data)
    }

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("topics-questions")
        .select("id, topic_id, question")

      if (error) {
        console.error("Error fetching questions:", error)
      } else {
        setQuestions(data)
      }
      console.log(data)
    }

    fetchThemes()
    fetchQuestions()
  }, [])

  const showToast = (message: string, type: ToastType = "success") => {
    setToastMessage(message)
    setToastType(type)

    setTimeout(() => {
      setToastMessage(null)
      setToastType(null)
    }, 3000)
  }

  const handleAddTheme = () => {
    const trimmed = newTheme.trim()
    if (!trimmed || themes.some((t) => t.name === trimmed)) return

    const tempTheme: Theme = {
      id: null,
      name: trimmed,
      isNew: true,
    }

    setThemes([tempTheme, ...themes])
    setQuestions({ ...questions, [trimmed]: [""] })
    setNewTheme("")
    console.log(themes)
  }

  const handleRemoveTheme = (index: number) => {
    const themeToRemove = themes[index]

    if (themeToRemove.id !== null) {
      setDeletedThemeIds((prev) => [...prev, themeToRemove.id!])
    }

    setThemes((prev) => prev.filter((_, i) => i !== index))
    setQuestions((prev) => prev.filter((q) => q.topic_id !== themeToRemove.id))
  }

  const handleAddQuestion = (topic_index: number) => {
    const topic_id = themes[topic_index].id
    const newQuestion: Question = {
      id: null,
      topic_id,
      question: "",
      isNew: true,
    }

    setQuestions((prev) => [...prev, newQuestion])
  }

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateQuestion = (index: number, value: string) => {
    console.log(index)
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, question: value } : q))
    )
  }

  const handleChangeTheme = (
    id: number,
    field: keyof Theme,
    value: string | boolean
  ) => {
    setThemes((prevThemes) =>
      prevThemes.map((theme, i) =>
        i === id ? { ...theme, [field]: value, isNew: true } : theme
      )
    )
  }

  const handleSendTheme = async () => {
    showToast("Saving changes...", "loading")

    const newThemes = themes.filter((t) => t.isNew && !t.id)
    const changedThemes = themes.filter((t) => t.isNew && t.id)
    const existingThemes = themes.filter((t) => !t.isNew)
    let saveError = false

    if (newThemes.length > 0) {
      const { data, error } = await supabase
        .from("topics")
        .insert(newThemes.map((t) => ({ name: t.name })))
        .select("id, name")

      if (error) {
        showToast("Failed to save new topics", "error")
        console.error(error)
        saveError = true
      } else if (data) {
        const updated = data.map((t) => ({ ...t, isNew: false }))
        setThemes([...updated, ...existingThemes])

        // adding questions
        const questionsToInsert = newThemes.flatMap((topic) => {
          const topicQuestions = questions.filter(
            (q) => q.topic_id === topic.id
          )
          if (!topicQuestions || topicQuestions.length === 0) return []
          return topicQuestions.map((question) => ({
            topic_id: topic.id,
            question,
          }))
        })
        console.log(questionsToInsert)

        if (questionsToInsert.length > 0) {
          const { error: questionError } = await supabase
            .from("topics-questions")
            .insert(questionsToInsert)

          if (questionError) {
            showToast("Failed to insert questions", "error")
            console.error(questionError)
            saveError = true
          }
        }
      }
    }

    if (changedThemes.length > 0) {
      const { data, error } = await supabase
        .from("topics")
        .update(changedThemes.map((t) => ({ name: t.name })))
        .in(
          "id",
          changedThemes.map((t) => t.id)
        )
        .select("id, name")

      if (error) {
        showToast("Failed to update topics", "error")
        console.error(error)
        saveError = true
      } else if (data) {
        const updated = data.map((t) => ({ ...t, isNew: false }))
        setThemes([...updated, ...existingThemes])
      }

      const questionsToInsert = changedThemes.flatMap((topic) => {
        const topicQuestions = questions.filter((q) => q.topic_id === topic.id)
        if (!topicQuestions || topicQuestions.length === 0) return []
        return topicQuestions.map((question) => ({
          topic_id: topic.id,
          question,
        }))
      })
      console.log(questionsToInsert)

      if (questionsToInsert.length > 0) {
        const { error: questionError } = await supabase
          .from("topics-questions")
          .insert(questionsToInsert)

        if (questionError) {
          showToast("Failed to insert questions", "error")
          console.error(questionError)
          saveError = true
        }
      }
    }

    if (deletedThemeIds.length > 0) {
      const { error } = await supabase
        .from("topics")
        .delete()
        .in("id", deletedThemeIds)

      if (error) {
        showToast("Failed to delete topics", "error")
        console.error(error)
        saveError = true
      } else {
        setDeletedThemeIds([])
      }
    }

    if (!saveError) {
      showToast("Changes saved successfully!", "success")
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Themes</h1>
        <div className="flex gap-2">
          <Input
            placeholder="New topic name"
            value={newTheme}
            onChange={(e) => setNewTheme(e.target.value)}
            className="w-48"
          />
          <Button onClick={handleAddTheme}>Add New Topic</Button>
        </div>
      </div>

      <div className="space-y-2">
        {themes.length > 0 ? (
          themes.map((theme, index) => (
            <Card key={theme.id ?? theme.name}>
              <CardContent className="p-4 hover:bg-muted rounded-xl transition-all">
                <div
                  className="cursor-pointer font-medium text-lg flex justify-between items-center"
                  onClick={() =>
                    setSelectedTheme(
                      selectedTheme === theme.name ? null : theme.name
                    )
                  }
                >
                  <Input
                    className="w-64"
                    type="text"
                    value={theme.name}
                    onChange={(e) =>
                      handleChangeTheme(index, "name", e.target.value)
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveTheme(index)
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                <AnimatePresence>
                  {selectedTheme === theme.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="mt-4 space-y-2">
                        {(questions || [])
                          .filter((q) => q.topic_id === theme.id)
                          .map((q, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Input
                                value={q.question}
                                onChange={(e) =>
                                  handleUpdateQuestion(idx, e.target.value)
                                }
                                placeholder={`Question ${idx + 1}`}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveQuestion(idx)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        <Button
                          variant="outline"
                          onClick={() => handleAddQuestion(index)}
                        >
                          + Add Question
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          ))
        ) : (
          <h1>loading...</h1>
        )}
        <Button
          variant="outline"
          onClick={() => handleSendTheme()}
          className="mr-2"
          disabled={!themes}
        >
          Save Changes
        </Button>
      </div>
      {toastMessage && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-md text-white transition-all duration-300 ${
            toastType === "success"
              ? "bg-green-600"
              : toastType === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  )
}
