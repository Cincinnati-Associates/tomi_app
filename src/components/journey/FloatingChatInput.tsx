"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface FloatingChatInputProps {
  onSubmit: (message: string) => void
}

export function FloatingChatInput({ onSubmit }: FloatingChatInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (value.trim()) {
      onSubmit(value.trim())
      setValue("")
      setIsFocused(false)
      inputRef.current?.blur()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <motion.div
      className={cn(
        "fixed z-30 bottom-4",
        isFocused ? "left-3 right-3" : "left-[15%] right-[15%]"
      )}
      animate={{
        left: isFocused ? 12 : "15%",
        right: isFocused ? 12 : "15%",
      }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-full",
          "bg-card/90 backdrop-blur-md border border-border shadow-lg",
          "px-4 h-12"
        )}
      >
        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            if (!value.trim()) setIsFocused(false)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask Homi..."
          className="flex-1 bg-transparent text-sm focus:outline-none text-foreground placeholder:text-muted-foreground"
          style={{ fontSize: "16px" }}
        />
        <AnimatePresence>
          {value.trim() && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 400 }}
              onClick={handleSubmit}
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
            >
              <ArrowUp className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
