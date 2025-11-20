'use client';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import DefaultChat from './DefaultChat';
import MarkdownMessage from './MarkdownMessage';
import ScrollToBottom from 'react-scroll-to-bottom';
import Head from 'next/head';
import { CopyIcon, SendIcon } from 'lucide-react';
import { DeletePopconfirm } from '@/components/custom-ui/delete-popconfirm';
import { TypingLoadingPage } from './Loading';
import ClosedChat from './ClosedChat';

const ChatContainer = () => {
    const [botInfo, setBotInfo] = useState<any>(undefined);
    const [inputValue, setInputValue] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState(false);
    const messagesEndRef = useRef<any>(null);
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory]);
    const textareaRef = useRef<any>(null);

    // 2. Logic tự động giãn dòng
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputValue]);
    async function startChat(payload: any = {}) {
        try {
            setLoadingChat(true);
            const res = await fetch("/api/public/start-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("StartChat API error");
            return res.json();
        } catch (error) {

            console.log("Error:", error);
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
            });

            if (!res.ok) throw new Error("Chat API error");
            return res.json();
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        handleStartChat();
    }, []);

    const handleStartChat = async (payload: any = {}) => {
        try {
            const data = await startChat(payload);
            setChatHistory(data?.histories.reverse() || []);
            setBotInfo(data);
            if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                const promptParam = url.searchParams.get("prompt");
                const qParam = url.searchParams.get("q");
                const initialPrompt = promptParam || qParam;

                if (initialPrompt) {
                    handleGetPrompt(initialPrompt);
                    if (promptParam) {
                        url.searchParams.delete("prompt");
                    }
                    if (qParam) {
                        url.searchParams.delete("q");
                    }
                    window.history.replaceState({}, "", url.toString());
                }
            }

        } catch (error) {
            console.error("Error when start chat:", error);
        }
    };

    const handleSendMessage = async (e: any) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setChatHistory((prev: any) => [
                ...prev,
                {
                    _id: String as any,
                    sender: "user" as string,
                    timestamp: Date.now() as any,
                    message: inputValue as string,
                },
            ] as any);
            setInputValue("");
            setLoading(true);

            try {
                const botResponse = await chat({
                    message: inputValue,
                });
                setChatHistory((prev: any) => [
                    ...prev,
                    {
                        _id: String,
                        sender: "assistant",
                        timestamp: Date.now(),
                        message: botResponse.message,
                    },
                ] as any);


            } catch (error) {
                console.error("Failed to send message:", error);
            } finally {
                setLoading(false);
            }
        }


    }
    const handleGetPrompt = async (prompt: string) => {
        setChatHistory((prev: any) => [
            ...prev,
            {
                _id: String,
                sender: "user",
                timestamp: Date.now(),
                message: prompt,
            },
        ] as any);
        setInputValue("");
        setLoading(true);
        try {
            const botResponse = await chat({ message: prompt });
            setChatHistory((prev: any) => [
                ...prev,
                {
                    _id: String,
                    sender: "assistant",
                    timestamp: Date.now(),
                    message: botResponse.message,
                },
            ] as any);

        } catch (error) {
            console.error("Failed to send message:", error);
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
            await navigator.clipboard.writeText(formatted)
        } catch (error) {
            console.error("Failed to copy chat history:", error)
        }
    }
    const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            handleSendMessage(event);
        }
    }
    if (loadingChat) {
        return <TypingLoadingPage />;
    }
    if (!botInfo && !loadingChat) {
        return <ClosedChat />;
    }
    return (
        <>
            <Head>
                <style>{`
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
  `}</style>
            </Head>
            <div className="flex flex-1 flex-col w-full scroll-hidden lg:px-[calc((100vw_-_310px)*0.3/2)]">
                {chatHistory?.length > 0 ? (
                    <ScrollToBottom className="h-0 flex-1 overflow-auto scroll-hidden p-2 min-h-0 pt-18 pb-[84px]">
                        <div className='pb-[80px]'>
                            {chatHistory.map((message: any, index: number) => (
                                message.sender === 'user' ? (
                                    <div className="mb-4 px-[16px] text-left" key={index}>
                                        <div className="flex items-start justify-end">
                                            <div className="relative flex max-w-[529px] flex-row items-center justify-center gap-x-[20px] bg-gray-200 py-2 px-4 shadow-sm w-fit rounded-[12px]">
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
                                                <img src={botInfo?.setting?.logo_url || "/icons/logo.png"} width={32} height={32} alt="Logo" />
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
                                    <img src={botInfo?.setting?.logo_url || "/icons/logo.png"} width={32} height={32} alt="Logo" className="rounded-full" />
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
                <div className="pointer-events-none fixed bottom-0 left-0 right-0 flex flex-col items-end !justify-end px-[16px] lg:px-[calc((100vw_-_310px)*0.3/2)] pb-[8px]">
                    <div className="pointer-events-auto w-full">
                        <form onSubmit={handleSendMessage} className="mx-auto flex w-full max-w-[760px] flex-col gap-3 pt-6">
                            <div className="rounded-[28px] border border-gray-400 bg-gray-200 p-2 pl-4 shadow-2xl shadow-primary/10 backdrop-blur">
                                <div className="flex items-end gap-3 ">
                                    <textarea
                                        ref={textareaRef}
                                        rows={1}
                                        onKeyDown={handleTextareaKeyDown}
                                        placeholder={botInfo?.live_config?.message_placeholder || "Nhập câu hỏi của bạn ?"}

                                        className="max-h-[200px] w-full resize-none bg-transparent pr-2 h-full
                                                    text-base text-gray-800 placeholder:text-gray-500 
                                                    outline-none focus:outline-none focus-visible:outline-none 
                                                    overflow-y-auto 
                                                    [&::-webkit-scrollbar]:w-1.5 
                                                    [&::-webkit-scrollbar-track]:bg-transparent 
                                                    [&::-webkit-scrollbar-thumb]:rounded-full 
                                                    [&::-webkit-scrollbar-thumb]:bg-gray-400 
                                                    hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
                                                    "
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <button
                                        className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                        type="submit"
                                        disabled={loading || !inputValue.trim()}
                                    >
                                        <SendIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-center text-xs font-normal leading-[16px] text-white/80 dark:text-white/60">
                                Nhấn Enter để gửi · Shift + Enter để xuống dòng
                            </p>
                        </form>
                    </div>
                </div>
            </div >
        </>
    );
}

export default ChatContainer;