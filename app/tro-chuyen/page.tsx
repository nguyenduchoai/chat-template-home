'use client';
import { useState, useEffect, useRef } from 'react';
import DefaultChat from './common/DefaultChat';
import MarkdownMessage from './common/MarkdownMessage';
import ScrollToBottom from 'react-scroll-to-bottom';
import { CopyIcon, SendIcon, MessageCircle } from 'lucide-react';
import { DeletePopconfirm } from '@/components/custom-ui/delete-popconfirm';
import { TypingLoadingPage } from './common/Loading';
import ClosedChat from './common/ClosedChat';
import { ChatInput } from './common/input';
import { toast } from 'sonner';

const ChatContainer = () => {
    const [botInfo, setBotInfo] = useState<any>(undefined);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [hasTriedLoad, setHasTriedLoad] = useState(false); // Track if we've attempted to load
    const [siteLogo, setSiteLogo] = useState<string | null>(null);
    const [chatPageHint, setChatPageHint] = useState<string>('');
    const messagesEndRef = useRef<any>(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory]);

    useEffect(() => {
        const fetchSiteLogo = async () => {
            try {
                const res = await fetch("/api/public/site-info", {
                    credentials: "include",
                })
                if (res.ok) {
                    const data = await res.json()
                    if (data.logo) {
                        setSiteLogo(data.logo)
                    }
                    if (data.chatPageHint) {
                        setChatPageHint(data.chatPageHint)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch site logo:", error)
            }
        }
        fetchSiteLogo()
    }, []);
    async function startChat(payload: any = {}) {
        try {
            setLoadingChat(true);
            const res = await fetch("/api/public/start-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`StartChat API error: ${res.status} - ${errorText}`);
            }
            const data = await res.json();
            return data;
        } catch (error) {
            console.error("Error starting chat:", error);
            return null;
        } finally {
            setLoadingChat(false);
        }
    }
    async function chat(payload: any) {
        try {
            const res = await fetch("/api/public/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            });

            if (!res.ok) {
                const errorText = await res.text();
                let errorMessage = "Không thể gửi tin nhắn";
                
                if (res.status === 401) {
                    errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng làm mới trang.";
                } else if (res.status === 429) {
                    errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
                } else if (res.status >= 500) {
                    errorMessage = "Lỗi server. Vui lòng thử lại sau.";
                } else if (errorText) {
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await res.json();
            
            // Validate response data
            if (!data || !data.message) {
                throw new Error("Phản hồi không hợp lệ từ server");
            }
            
            return data;
        } catch (error: any) {
            console.error("Failed to send message:", error);
            throw error; // Re-throw to handle in calling function
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        handleStartChat();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        // State change tracking for Safari compatibility
    }, [botInfo, chatHistory]);

    const handleStartChat = async (payload: any = {}) => {
        try {
            setHasTriedLoad(true);
            const data = await startChat(payload);
            
            if (data) {
                const histories = Array.isArray(data.histories) 
                    ? [...data.histories].reverse()
                    : [];
                
                setBotInfo(data);
                setChatHistory(histories);
            } else {
                setBotInfo(null);
                setChatHistory([]);
            }
            if (typeof window !== "undefined") {
                try {
                    let url: URL;
                    try {
                        url = new URL(window.location.href);
                    } catch (e) {
                        const baseUrl = window.location.origin + window.location.pathname;
                        url = new URL(baseUrl + window.location.search);
                    }
                    
                    const promptParam = url.searchParams.get("prompt");
                    const qParam = url.searchParams.get("q");
                    const initialPrompt = promptParam || qParam;

                    if (initialPrompt) {
                        handleGetPrompt(initialPrompt);
                        // Update URL without causing Safari issues
                        try {
                            if (promptParam) {
                                url.searchParams.delete("prompt");
                            }
                            if (qParam) {
                                url.searchParams.delete("q");
                            }
                            const newUrl = url.toString();
                            window.history.replaceState({}, "", newUrl);
                        } catch (historyError) {
                            // Safari fallback: use simpler URL update
                            const searchParams = new URLSearchParams(window.location.search);
                            searchParams.delete("prompt");
                            searchParams.delete("q");
                            const newSearch = searchParams.toString();
                            const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
                            window.history.replaceState({}, "", newUrl);
                        }
                    }
                } catch (urlError) {
                    console.error("Error parsing URL:", urlError);
                    // Fallback: try to get params from window.location.search directly
                    const searchParams = new URLSearchParams(window.location.search);
                    const promptParam = searchParams.get("prompt");
                    const qParam = searchParams.get("q");
                    const initialPrompt = promptParam || qParam;
                    if (initialPrompt) {
                        handleGetPrompt(initialPrompt);
                    }
                }
            }

        } catch (error) {
            console.error("Error when start chat:", error);
        }
    };

    const handleSendMessage = async (message: string, files?: File[]) => {
        // Validation
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            toast.error("Vui lòng nhập nội dung tin nhắn");
            return;
        }

        // Max length validation (e.g., 10000 characters)
        const MAX_MESSAGE_LENGTH = 10000;
        if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
            toast.error(`Tin nhắn quá dài. Tối đa ${MAX_MESSAGE_LENGTH} ký tự.`);
            return;
        }

        // Add user message to chat history
        const userMessageId = `user-${Date.now()}-${Math.random()}`;
        setChatHistory((prev: any) => [
            ...prev,
            {
                _id: userMessageId,
                sender: "user",
                timestamp: Date.now(),
                message: trimmedMessage,
            },
        ] as any);
        setLoading(true);

        try {
            const botResponse = await chat({
                message: trimmedMessage,
            });
            
            // Add bot response to chat history
            setChatHistory((prev: any) => [
                ...prev,
                {
                    _id: `assistant-${Date.now()}-${Math.random()}`,
                    sender: "assistant",
                    timestamp: Date.now(),
                    message: botResponse.message,
                },
            ] as any);
        } catch (error: any) {
            console.error("Failed to send message:", error);
            
            // Remove user message on error (rollback)
            setChatHistory((prev: any) => 
                prev.filter((msg: any) => msg._id !== userMessageId)
            );
            
            // Show error toast
            const errorMessage = error?.message || "Không thể gửi tin nhắn. Vui lòng thử lại.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }
    const handleGetPrompt = async (prompt: string) => {
        const trimmedPrompt = prompt.trim();
        if (!trimmedPrompt) {
            toast.error("Prompt không hợp lệ");
            return;
        }

        const userMessageId = `user-${Date.now()}-${Math.random()}`;
        setChatHistory((prev: any) => [
            ...prev,
            {
                _id: userMessageId,
                sender: "user",
                timestamp: Date.now(),
                message: trimmedPrompt,
            },
        ] as any);
        setLoading(true);
        
        try {
            const botResponse = await chat({ message: trimmedPrompt });
            setChatHistory((prev: any) => [
                ...prev,
                {
                    _id: `assistant-${Date.now()}-${Math.random()}`,
                    sender: "assistant",
                    timestamp: Date.now(),
                    message: botResponse.message,
                },
            ] as any);
        } catch (error: any) {
            console.error("Failed to send message:", error);
            
            // Remove user message on error (rollback)
            setChatHistory((prev: any) => 
                prev.filter((msg: any) => msg._id !== userMessageId)
            );
            
            // Show error toast
            const errorMessage = error?.message || "Không thể gửi tin nhắn. Vui lòng thử lại.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }
    const handleCopyAllMessages = async () => {
        if (!chatHistory.length) return
        const formatted = chatHistory
            .map((message: any) => {
                const sender = message.sender === "assistant" ? "Bot" : "Bạn"
                return `${sender}: ${typeof message.message === "string" ? message.message : ""}`
            })
            .join("\n\n")

        try {
            // Safari-compatible clipboard API with fallback
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(formatted)
            } else {
                // Fallback for older Safari versions
                const textArea = document.createElement("textarea")
                textArea.value = formatted
                textArea.style.position = "fixed"
                textArea.style.left = "-999999px"
                textArea.style.top = "-999999px"
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                try {
                    document.execCommand("copy")
                } catch (err) {
                    console.error("Fallback copy failed:", err)
                }
                document.body.removeChild(textArea)
            }
        } catch (error) {
            console.error("Failed to copy chat history:", error)
        }
    }
    const handleStop = () => {
        // TODO: Implement stop generation logic if needed
        setLoading(false);
    }

    const ChatLogo = ({ className = "rounded-full", width = 32, height = 32 }: { className?: string; width?: number; height?: number }) => {
        const [chatLogoError, setChatLogoError] = useState(false)
        const [siteLogoError, setSiteLogoError] = useState(false)
        
        const chatLogoUrl = botInfo?.setting?.logo_url
        const siteLogoUrl = siteLogo
        
        // Reset errors when URLs change
        useEffect(() => {
            setChatLogoError(false)
        }, [chatLogoUrl])
        
        useEffect(() => {
            setSiteLogoError(false)
        }, [siteLogoUrl])
        
        // Priority: siteLogo -> chatLogo -> icon
        // Try siteLogo first
        if (siteLogoUrl && !siteLogoError) {
            return (
                <img 
                    src={siteLogoUrl}
                    width={width} 
                    height={height} 
                    alt="Logo"
                    className={className}
                    onError={() => {
                        setSiteLogoError(true)
                    }}
                />
            )
        }
        
        // Fallback to chat logo if site logo failed or not available
        if (chatLogoUrl && !chatLogoError) {
            return (
                <img 
                    src={chatLogoUrl}
                    width={width} 
                    height={height} 
                    alt="Logo"
                    className={className}
                    onError={() => {
                        setChatLogoError(true)
                    }}
                />
            )
        }
        
        // Final fallback to icon
        return (
            <div className={`${className} flex items-center justify-center bg-muted`} style={{ width, height }}>
                <MessageCircle 
                    width={width * 0.7} 
                    height={height * 0.7} 
                    style={{ color: 'currentColor' }}
                />
            </div>
        )
    }
    if (loadingChat) {
        return <TypingLoadingPage />;
    }
    if (hasTriedLoad && botInfo === null && !loadingChat) {
        return <ClosedChat />;
    }
    if (!hasTriedLoad || botInfo === undefined) {
        return <TypingLoadingPage />;
    }
    return (
        <>
            <style dangerouslySetInnerHTML={{__html: `
    .chat-container {
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 10px;
      max-width: 800px;
    }

    .chat-message {
      padding: 10px 15px;
      border-radius: 8px;
      max-width: 70%;
      word-wrap: break-word;
      line-height: 1.4;
      font-size: 14px;
    }

    .user-message {
      background-color: #007bff;
      color: white;
      margin-left: auto;
      text-align: right;
    }
    .assistant-message {
      background-color: rgba(255,255,255,0.08);
      color: #e8e8f0;
      margin-right: auto;
      text-align: left;
    }
  `}} />
            <div className="flex flex-1 flex-col w-full scroll-hidden lg:px-[calc((100vw_-_310px)*0.3/2)]" style={{ minHeight: 0 }}>
                {chatHistory?.length > 0 ? (
                    <div className="flex-1 overflow-auto scroll-hidden min-h-0" style={{ height: '100%', WebkitOverflowScrolling: 'touch' }}>
                        <ScrollToBottom className="h-full p-2 pt-18 pb-[84px]">
                            <div className='pb-[80px]'>
                            {chatHistory.map((message: any, index: number) => {
                                if (!message || typeof message.sender === 'undefined' || typeof message.message === 'undefined') {
                                    return null;
                                }
                                
                                return message.sender === 'user' ? (
                                    <div className="mb-4 px-[16px] text-left" key={index}>
                                        <div className="flex items-start justify-end">
                                            <div 
                                                className="relative flex max-w-[529px] flex-row items-center justify-center gap-x-[20px] py-2 px-4 shadow-sm w-fit rounded-[12px]"
                                                style={{
                                                    backgroundColor: "var(--chat-user-message-bg)",
                                                    color: "var(--chat-user-message-text)",
                                                }}
                                            >
                                                <div className="markdown prose w-full whitespace-pre-wrap break-words text-[16px]">
                                                    {message.message}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mb-3 w-full border-0 bg-transparent" key={index}>
                                        <div className="pb-[4px] pt-[12px] flex gap-x-[12px] px-[16px] lg:mb-[10px] lg:gap-x-[16px]">
                                            <div className="conversation-header flex-start">
                                                <ChatLogo width={32} height={32} />
                                            </div>
                                            <div className=" flex max-w-[calc(100%-52px)] flex-grow flex-col space-y-2 bg-transparent lg:max-w-[calc(100%-56px)]">
                                                <div className="w-full text-[17px] font-normal leading-[22px] text-gray-200">
                                                    <MarkdownMessage content={message.message} />
                                                </div>
                                                {
                                                    chatHistory.length === index + 1 && (
                                                        <div className="flex items-center gap-1 ">
                                                            <button
                                                                type="button"
                                                                onClick={handleCopyAllMessages}
                                                                className='p-1 text-sm text-gray-400 hover:text-[#c5a664] cursor-pointer'
                                                                aria-label="Sao chép toàn bộ cuộc hội thoại"
                                                            >
                                                                <CopyIcon className="w-4 h-4" />
                                                            </button>
                                                            <DeletePopconfirm
                                                                onConfirm={() => handleStartChat({
                                                                    isReset: true,
                                                                })}
                                                                title="Bạn có chắc chắn muốn xoá?"
                                                                description="Thao tác này không thể hoàn tác. Tin nhắn sẽ bị xoá vĩnh viễn."
                                                                confirmText="Xoá"
                                                                cancelText="Huỷ" />
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {loading && (
                                <div className="h-[80px] flex items-center gap-2 p-4">
                                    <ChatLogo width={32} height={32} />
                                    <div className="flex items-center gap-1 p-2 rounded-full bg-white/10">
                                        <span className="w-2 h-2 bg-[#c5a664] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-[#c5a664] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-[#c5a664] rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            </div>
                            <div ref={messagesEndRef} />
                        </ScrollToBottom>
                    </div>
                ) : (
                    <DefaultChat setPrompt={handleGetPrompt} config={botInfo} />
                )}
                <div className="pointer-events-none fixed bottom-0 left-0 right-0 flex flex-col items-center justify-end px-[16px] lg:px-[calc((100vw_-_310px)*0.3/2)] pb-[8px]">
                    <div className="pointer-events-auto w-full">
                        <ChatInput
                            onSend={handleSendMessage}
                            onStop={handleStop}
                            isGenerating={loading}
                            placeholder={botInfo?.live_config?.message_placeholder || "Nhập câu hỏi của bạn ?"}
                            disabled={loadingChat}
                            logoUrl={botInfo?.setting?.logo_url || undefined}
                            siteLogo={siteLogo}
                            hintText={chatPageHint}
                        />
                    </div>
                </div>
            </div >
        </>
    );
}

export default ChatContainer;