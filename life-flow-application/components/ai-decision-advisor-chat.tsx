"use client"

import React, { useEffect, useRef, useState } from "react"
import {
  Bot,
  CornerDownLeft,
  HelpCircle,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  User,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import {
  sendAdvisorMessage,
  getAdvisorHistory,
  clearAdvisorHistory,
  type AdvisorMessage,
  type Scenario,
} from "@/lib/api"
import { isValidMeaningfulStatement } from "@/components/future-self-interview"

interface AIDecisionAdvisorChatProps {
  decisionId: string
  decisionTitle: string
  category?: string
  goal?: string
  scenarios?: Scenario[]
}

const DEFAULT_SUGGESTED_QUESTIONS = [
  "Which path is best for a beginner?",
  "Which scenario requires the least budget?",
  "Which scenario is less risky?",
  "What happens if I have only 2 hours daily?",
  "What are the biggest challenges?",
  "Which skills should I learn first?",
  "What if I fail to complete my roadmap?",
  "Can you recommend the most practical scenario?",
]

export function AIDecisionAdvisorChat({
  decisionId,
  decisionTitle,
  category = "Career",
  goal = "",
  scenarios = [],
}: AIDecisionAdvisorChatProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(DEFAULT_SUGGESTED_QUESTIONS)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Load conversation history on mount or when decisionId changes
  useEffect(() => {
    if (!decisionId) return
    let isMounted = true

    const loadHistory = async () => {
      setHistoryLoading(true)
      try {
        const history = await getAdvisorHistory(decisionId)
        if (isMounted) {
          setMessages(history)
          if (history.length > 0) {
            const lastAssistantMsg = [...history].reverse().find((m) => m.role === "assistant")
            if (lastAssistantMsg?.suggestedQuestions && lastAssistantMsg.suggestedQuestions.length > 0) {
              setSuggestedQuestions(lastAssistantMsg.suggestedQuestions)
            }
          }
        }
      } catch (err) {
        console.warn("Could not load advisor history:", err)
      } finally {
        if (isMounted) setHistoryLoading(false)
      }
    }

    loadHistory()
    return () => {
      isMounted = false
    }
  }, [decisionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim()
    if (!text || loading) return

    if (!isValidMeaningfulStatement(text)) {
      toast.error("not a valid statement. Please ask your AI Decision Advisor a meaningful question.")
      return
    }

    setInputMessage("")
    setLoading(true)

    // Optimistic user message preview
    const tempUserMsg: AdvisorMessage = {
      id: "temp-" + Date.now(),
      decisionId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    try {
      const { userMessage, assistantMessage, suggestedQuestions: newQuestions } = await sendAdvisorMessage(
        decisionId,
        text
      )

      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), userMessage, assistantMessage])

      if (newQuestions && newQuestions.length > 0) {
        setSuggestedQuestions(newQuestions)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || "Could not get a response from AI Decision Advisor.")
      // Revert temp user message on total failure
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id))
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (!messages.length) return
    if (!window.confirm("Clear all conversation history with this Decision Advisor?")) return

    try {
      await clearAdvisorHistory(decisionId)
      setMessages([])
      setSuggestedQuestions(DEFAULT_SUGGESTED_QUESTIONS)
      toast.success("Conversation history cleared.")
    } catch {
      toast.error("Could not clear advisor history.")
    }
  }

  return (
    <div
      style={{
        width: "100%",
        background: "#ffffff",
        border: "1px solid #ebd9be",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 8px rgba(40,37,33,0.03)",
        minHeight: 620,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "18px 24px",
          background: "#fbf9f4",
          borderBottom: "1px solid #ebd9be",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#24201c",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bot size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#282521", margin: 0 }}>
              Ask Your AI Decision Advisor
            </h3>
            <span style={{ fontSize: 12, color: "#776f63" }}>
              Grounded in &quot;{decisionTitle}&quot; ({category}) and your 3 generated scenarios
            </span>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            style={{
              background: "none",
              border: "1px solid #e4ded2",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              color: "#8c6e3b",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            title="Reset conversation"
          >
            <RotateCcw size={13} /> Reset Chat
          </button>
        )}
      </div>

      {/* Suggested Questions Bar */}
      <div
        style={{
          padding: "12px 20px",
          background: "#faf8f4",
          borderBottom: "1px solid #f0eae1",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.8,
            color: "#8c6e3b",
            textTransform: "uppercase",
            marginRight: 4,
          }}
        >
          Suggested Questions:
        </span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            disabled={loading}
            onClick={() => handleSendMessage(q)}
            style={{
              padding: "5px 11px",
              borderRadius: 20,
              background: "#ffffff",
              border: "1px solid #e2dacd",
              fontSize: 11.5,
              color: "#4a443c",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#8c6e3b"
              e.currentTarget.style.background = "#fbf8f2"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2dacd"
              e.currentTarget.style.background = "#ffffff"
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Stream Container */}
      <div
        style={{
          flex: 1,
          padding: 24,
          overflowY: "auto",
          maxHeight: 520,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "#ffffff",
        }}
      >
        {historyLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#8c6e3b", fontSize: 13 }}>
            Loading previous advisor consultation...
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 20px",
              maxWidth: 540,
              margin: "auto",
              background: "#faf8f4",
              borderRadius: 12,
              border: "1px dashed #ded6c8",
            }}
          >
            <Sparkles size={28} color="#8c6e3b" style={{ margin: "0 auto 10px" }} />
            <h4 style={{ fontSize: 16, fontWeight: 700, color: "#282521", marginBottom: 6 }}>
              Welcome to your Strategic Decision Advisor
            </h4>
            <p style={{ fontSize: 13, color: "#6f685d", lineHeight: 1.5, marginBottom: 16 }}>
              I have analyzed your <strong>Optimistic</strong>, <strong>Realistic</strong>, and{" "}
              <strong>Pessimistic</strong> scenarios for <em>&quot;{decisionTitle}&quot;</em>.
              <br />
              Ask me which path suits your budget, how to handle limited time, or which skills to learn first.
            </p>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#8c6e3b" }}>
              Click any suggested question above or type your own question below to begin!
            </span>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user"
            return (
              <div
                key={msg.id || index}
                style={{
                  display: "flex",
                  gap: 12,
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#8c6e3b",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Bot size={17} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: "80%",
                    padding: "12px 16px",
                    borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: isUser ? "#24201c" : "#faf8f4",
                    color: isUser ? "#ffffff" : "#282521",
                    border: isUser ? "none" : "1px solid #ebd9be",
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {msg.content}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#e4dfd4",
                      color: "#38332a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </div>
            )
          })
        )}

        {loading && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "#8c6e3b",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Bot size={17} />
            </div>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                background: "#faf8f4",
                border: "1px solid #ebd9be",
                fontSize: 12.5,
                color: "#776f63",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="waveform-container" style={{ gap: 2 }}>
                <span className="waveform-bar active" style={{ height: 12, width: 3 }} />
                <span className="waveform-bar active" style={{ height: 16, width: 3 }} />
                <span className="waveform-bar active" style={{ height: 12, width: 3 }} />
              </span>
              AI Advisor is comparing scenarios &amp; formulating advice...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        style={{
          padding: 16,
          background: "#fbf9f4",
          borderTop: "1px solid #ebd9be",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask your AI Advisor anything about your scenarios, budget, or timelines..."
            disabled={loading}
            style={{
              flex: 1,
              height: 44,
              padding: "0 16px",
              borderRadius: 8,
              border:
                inputMessage.trim().length > 0 && !isValidMeaningfulStatement(inputMessage)
                  ? "1.5px solid #dc2626"
                  : "1px solid #dcd6c9",
              fontSize: 13.5,
              background: "#ffffff",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            style={{
              height: 44,
              padding: "0 18px",
              borderRadius: 8,
              background: inputMessage.trim() && !loading ? "#24201c" : "#e5dfd4",
              color: "#ffffff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: inputMessage.trim() && !loading ? "pointer" : "not-allowed",
            }}
          >
            <span>Ask Advisor</span>
            <Send size={15} />
          </button>
        </div>

        {inputMessage.trim().length > 0 && !isValidMeaningfulStatement(inputMessage) && (
          <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 500 }}>
            not a valid statement
          </span>
        )}
      </form>
    </div>
  )
}
