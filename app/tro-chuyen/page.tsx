'use client';
import { useState, useEffect, useRef } from 'react';
import DefaultChat from './common/DefaultChat';
import MarkdownMessage from './common/MarkdownMessage';
import ScrollToBottom from 'react-scroll-to-bottom';
import { CopyIcon, SendIcon } from 'lucide-react';
import { DeletePopconfirm } from '@/components/custom-ui/delete-popconfirm';
import { TypingLoadingPage } from './common/Loading';
import ClosedChat from './common/ClosedChat';
import { ChatInput } from './common/input';
import { toast } from 'sonner';

const ChatContainer = () => {
    const [botInfo, setBotInfo] = useState<any>(undefined);
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const [hasTriedLoad, setHasTriedLoad] = useState(false); // Track if we've attempted to load
    const [siteLogo, setSiteLogo] = useState<string | null>(null);
    const messagesEndRef = useRef<any>(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory]);

    // Fetch site logo from config
    useEffect(() => {
        const fetchSiteLogo = async () => {
            try {
                const res = await fetch("/api/public/site-info", {
                    credentials: "include", // Safari requires this to send cookies
                })
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
    }, []);
    async function startChat(payload: any = {}) {
        try {
            setLoadingChat(true);
            const res = await fetch("/api/public/start-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include", // CRITICAL: Safari requires this to send/receive cookies
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`StartChat API error: ${res.status} - ${errorText}`);
            }
            const data = await res.json();
            return data;
        } catch (error) {
            console.error("Error starting chat:", error);
            // Return null instead of undefined to prevent errors
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
                credentials: "include", // Safari requires this to send cookies
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
    }, []);

    const handleStartChat = async (payload: any = {}) => {
        try {
            setHasTriedLoad(true); // Mark that we've attempted to load
            const data = await startChat(payload);
            // Only update state if data is valid
            if (data) {
                setChatHistory(data?.histories?.reverse() || []);
                setBotInfo(data);
            } else {
                // If data is null, set botInfo to null to show ClosedChat
                setBotInfo(null);
                console.warn("Failed to start chat - no data returned");
            }
            if (typeof window !== "undefined") {
                try {
                    // Safari-compatible URL parsing with fallback
                    let url: URL;
                    try {
                        url = new URL(window.location.href);
                    } catch (e) {
                        // Fallback for Safari compatibility
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
    if (loadingChat) {
        return <TypingLoadingPage />;
    }
    // Only show ClosedChat if we've tried to load and got no data (null)
    if (hasTriedLoad && botInfo === null && !loadingChat) {
        return <ClosedChat />;
    }
    // Show loading if botInfo is still undefined (initial state before first load attempt)
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
      background-color: #f1f1f1;
      color: #333;
      margin-right: auto;
      text-align: left;
    }
  `}} />
            <div className="flex flex-1 flex-col w-full scroll-hidden lg:px-[calc((100vw_-_310px)*0.3/2)]">
                {chatHistory?.length > 0 ? (
                    <ScrollToBottom className="h-0 flex-1 overflow-auto scroll-hidden p-2 min-h-0 pt-18 pb-[84px]">
                        <div className='pb-[80px]'>
                            {chatHistory.map((message: any, index: number) => (
                                message.sender === 'user' ? (
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
                                                <img 
                                                    src={botInfo?.setting?.logo_url || siteLogo || "/icons/logo.png"} 
                                                    width={32} 
                                                    height={32} 
                                                    alt="Logo"
                                                    className="rounded-full"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        if (target.src !== siteLogo && target.src !== "/icons/logo.png") {
                                                            target.src = siteLogo || "/icons/logo.png"
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className=" flex max-w-[calc(100%-52px)] flex-grow flex-col space-y-2 bg-transparent lg:max-w-[calc(100%-56px)]">
                                                <div className="w-full text-[17px] font-normal leading-[22px] text-gray-700">
                                                    <MarkdownMessage content={message.message} />
                                                </div>
                                                {
                                                    chatHistory.length === index + 1 && (
                                                        <div className="flex items-center gap-1 ">
                                                            <button
                                                                type="button"
                                                                onClick={handleCopyAllMessages}
                                                                className='p-1 text-sm text-gray-500 hover:text-blue-600 cursor-pointer'
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
                                )
                            ))}
                            {loading && (
                                <div className="h-[80px] flex items-center gap-2 p-4">
                                    <img 
                                        src={botInfo?.setting?.logo_url || siteLogo || "/icons/logo.png"} 
                                        width={32} 
                                        height={32} 
                                        alt="Logo" 
                                        className="rounded-full"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement
                                            if (target.src !== siteLogo && target.src !== "/icons/logo.png") {
                                                target.src = siteLogo || "/icons/logo.png"
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-1 p-2 rounded-full bg-gray-200">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div ref={messagesEndRef} />
                    </ScrollToBottom>
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
                            logoUrl={botInfo?.setting?.logo_url || "/icons/logo.png"}
                        />
                    </div>
                </div>
            </div >
        </>
    );
}

export default ChatContainer;