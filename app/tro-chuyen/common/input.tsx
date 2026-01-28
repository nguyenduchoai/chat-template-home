"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Send, Square, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "@/components/ui/image"

interface ChatInputProps {
    onSend?: (message: string, files?: File[]) => void
    onStop?: () => void
    isGenerating?: boolean
    placeholder?: string
    disabled?: boolean
    logoUrl?: string
    siteLogo?: string | null
}

export function ChatInput({
    onSend,
    onStop,
    isGenerating = false,
    placeholder = "Nhắn tin cho ChatGPT...",
    disabled = false,
    logoUrl,
    siteLogo: siteLogoProp,
}: ChatInputProps) {
    const [message, setMessage] = useState("")
    const [siteLogoError, setSiteLogoError] = useState(false)
    const [chatLogoError, setChatLogoError] = useState(false)
    const [siteLogo, setSiteLogo] = useState<string | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    
    // Use siteLogo from props or fetch it
    const finalSiteLogo = siteLogoProp || siteLogo

    // Fetch site logo from config if not provided via props
    useEffect(() => {
        if (!siteLogoProp) {
            const fetchSiteLogo = async () => {
                try {
                    const res = await fetch("/api/public/site-info")
                    if (res.ok) {
                        const data = await res.json()
                        if (data.logo) {
                            setSiteLogo(data.logo)
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch site logo:", error)
                }
            }
            fetchSiteLogo()
        }
    }, [siteLogoProp])

    // Reset errors when URLs change
    useEffect(() => {
        setSiteLogoError(false)
    }, [finalSiteLogo])

    useEffect(() => {
        setChatLogoError(false)
    }, [logoUrl])

    // Priority: siteLogo -> chatLogo -> icon
    const getDisplayLogo = (): string | null => {
        // Priority 1: siteLogo (if available and no error)
        if (finalSiteLogo && !siteLogoError) {
            return finalSiteLogo
        }
        // Priority 2: chatLogo (if siteLogo failed or not available)
        if (logoUrl && !chatLogoError) {
            return logoUrl
        }
        // Priority 3: null (will show icon)
        return null
    }

    const displayLogo = getDisplayLogo()

    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
        }
    }, [message])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const trimmedMessage = message.trim()
        
        if (!trimmedMessage) {
            return
        }
        
        const MAX_MESSAGE_LENGTH = 10000
        if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            return
        }
        
        if (!disabled && !isGenerating) {
            onSend?.(trimmedMessage)
            setMessage("")
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto"
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }


    return (
        <div className="w-full max-w-3xl mx-auto px-2 sm:px-4 pb-2 sm:pb-4">
            <form onSubmit={handleSubmit} className="relative">
                <div 
                    className="relative flex flex-col gap-2 rounded-2xl sm:rounded-[28px] md:rounded-[32px] border shadow-sm overflow-hidden"
                    style={{
                        backgroundColor: "var(--chat-input-bg)",
                        borderColor: "var(--chat-input-border)",
                    }}
                >
                    <div className="flex items-end gap-1.5 sm:gap-2 p-2 sm:p-3">
                        <div className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 flex items-center justify-center rounded-full overflow-hidden bg-muted">
                            {displayLogo ? (
                                <img
                                    src={displayLogo}
                                    alt="Chat Logo"
                                    width={40}
                                    height={40}
                                    className="object-cover w-full h-full"
                                    onError={() => {
                                        // Determine which logo failed and set appropriate error state
                                        if (displayLogo === finalSiteLogo && !siteLogoError) {
                                            setSiteLogoError(true)
                                        } else if (displayLogo === logoUrl && !chatLogoError) {
                                            setChatLogoError(true)
                                        }
                                    }}
                                />
                            ) : (
                                <MessageCircle 
                                    width={40} 
                                    height={40} 
                                    className="w-full h-full p-1.5"
                                    style={{ color: 'currentColor' }}
                                />
                            )}
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={(e) => {
                                const value = e.target.value
                                // Limit max length
                                const MAX_MESSAGE_LENGTH = 10000
                                if (value.length <= MAX_MESSAGE_LENGTH) {
                                    setMessage(value)
                                }
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            disabled={disabled || isGenerating}
                            rows={1}
                            maxLength={10000}
                            className={cn(
                                "flex-1 resize-none bg-transparent px-0 py-1.5 sm:py-2",
                                "text-sm sm:text-base",
                                "focus:outline-none disabled:opacity-50",
                                "max-h-[200px] overflow-y-auto",
                            )}
                            style={{
                                color: "var(--chat-input-text)",
                            }}
                        />

                        {isGenerating ? (
                            <Button
                                type="button"
                                size="icon"
                                onClick={onStop}
                                className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full"
                                style={{
                                    backgroundColor: "var(--button)",
                                    color: "var(--button-text)",
                                }}
                            >
                                <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                                <span className="sr-only">Dừng</span>
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!message.trim() || disabled}
                                className="shrink-0 h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full disabled:opacity-30"
                                style={{
                                    backgroundColor: "var(--button)",
                                    color: "var(--button-text)",
                                }}
                            >
                                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="sr-only">Gửi tin nhắn</span>
                            </Button>
                        )}
                    </div>
                </div>

                <p 
                    className="text-[10px] sm:text-xs text-center mt-2 sm:mt-3 px-2 sm:px-4"
                    style={{ color: "var(--chat-input-placeholder)" }}
                >
                    Nhập nội dung của bạn vào đây để bắt đầu trò chuyện
                </p>
            </form>
        </div>
    )
}
