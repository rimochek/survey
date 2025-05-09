// "use client"

// import { useEffect, useState } from "react"

// interface UserData {
//   id: number
//   first_name: string
//   last_name?: string
//   username?: string
//   language_code?: string
//   is_premium?: boolean
// }

// export default function Home() {
//   const [userData, setUserData] = useState<UserData | null>(null)

//   useEffect(() => {
//     const loadWebApp = async () => {
//       const { default: WebApp } = await import("@twa-dev/sdk")
//       if (WebApp.initDataUnsafe.user) {
//         setUserData(WebApp.initDataUnsafe.user as UserData)
//       }
//     }

//     loadWebApp()
//   }, [])

//   return (
//     <main className="p-4">
//       {userData ? (
//         <>
//           <h1 className="text-2xl font-bold mb-4">User Data</h1>
//           <ul>
//             <li>ID: {userData.id}</li>
//             <li>First Name: {userData.first_name}</li>
//             <li>Last Name: {userData.last_name}</li>
//             <li>Username: {userData.username}</li>
//             <li>Language code: {userData.language_code}</li>
//             <li>Is premium: {userData.is_premium ? "Yes" : "No"}</li>
//           </ul>
//         </>
//       ) : (
//         <div>loading...</div>
//       )}
//     </main>
//   )
// }

// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { motion } from "framer-motion"
// import { Check } from "lucide-react"

// type Mood = "unhappy" | "neutral" | "satisfied"

// type EmojiOption = {
//   id: Mood
//   icon: string
//   label: string
// }

// const EMOJIS: EmojiOption[] = [
//   { id: "unhappy", icon: "😠", label: "Unhappy" },
//   { id: "neutral", icon: "😐", label: "Neutral" },
//   { id: "satisfied", icon: "😍", label: "Satisfied" },
// ]

// const OPTIONS: Record<Mood, string[]> = {
//   unhappy: [
//     "Not helpful and not thoughtful",
//     "Slow and not responsive",
//     "Support line is always busy",
//     "Confusing",
//     "Other",
//   ],
//   neutral: ["I never called support", "I think they are okay", "I don’t know"],
//   satisfied: [
//     "Helpful and thoughtful",
//     "Quick and responsive",
//     "Solved most of my problems",
//     "Good knowledge of the product",
//   ],
// }

// export default function CustomerSupportSurvey() {
//   const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
//   const [selectedOptions, setSelectedOptions] = useState<string[]>([])

//   const toggleOption = (option: string) => {
//     setSelectedOptions((prev) =>
//       prev.includes(option)
//         ? prev.filter((o) => o !== option)
//         : [...prev, option]
//     )
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//       <Card className="w-full max-w-md rounded-2xl shadow-lg p-6 bg-white">
//         <CardContent>
//           {!selectedMood ? (
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold text-center">
//                 When you need help or have concerns related to our product, how
//                 satisfied are you with our customer support’s performance?
//               </h2>
//               <div className="flex justify-around mt-6">
//                 {EMOJIS.map((emoji) => (
//                   <motion.button
//                     whileTap={{ scale: 0.95 }}
//                     key={emoji.id}
//                     onClick={() => setSelectedMood(emoji.id)}
//                     className="flex flex-col items-center"
//                   >
//                     <div className="text-4xl">{emoji.icon}</div>
//                     <span className="mt-1 text-sm font-medium">
//                       {emoji.label}
//                     </span>
//                   </motion.button>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <div className="text-center">
//                 <div className="text-4xl">
//                   {EMOJIS.find((e) => e.id === selectedMood)?.icon}
//                 </div>
//                 <h3 className="text-lg font-semibold mt-2">
//                   {selectedMood === "unhappy"
//                     ? "We are so sorry. What did we do wrong?"
//                     : selectedMood === "neutral"
//                     ? "Neutral is okay. Why is that?"
//                     : "High five! What makes you satisfied?"}
//                 </h3>
//               </div>
//               <div className="space-y-2">
//                 {OPTIONS[selectedMood].map((option) => (
//                   <button
//                     key={option}
//                     onClick={() => toggleOption(option)}
//                     className={`w-full border rounded-xl px-4 py-2 text-left flex justify-between items-center transition-all duration-150 ${
//                       selectedOptions.includes(option)
//                         ? "bg-orange-100 border-orange-400"
//                         : "bg-white border-gray-300"
//                     }`}
//                   >
//                     <span>{option}</span>
//                     {selectedOptions.includes(option) && (
//                       <Check className="w-4 h-4 text-orange-500" />
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//           <div className="mt-6 text-center">
//             <Button className="w-full rounded-full text-white bg-orange-500 hover:bg-orange-600">
//               Finish
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button" // or use a plain <button>

const questions = [
  {
    id: 1,
    question:
      "When you need help or have concerns related to our product, how satisfied are you with our customer support’s performance?",
  },
  {
    id: 2,
    question: "Why did you feel that way?",
  },
]

export default function Survey() {
  const [step, setStep] = useState<number>(0)

  const nextStep = () => {
    if (step < questions.length) setStep((prev) => prev + 1)
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

            <Button onClick={nextStep} className="mt-4">
              {step === questions.length ? "Finish" : "Next"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
