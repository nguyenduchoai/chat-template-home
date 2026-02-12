import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import { MessageCircleMore } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const DefaultChat = ({
    setPrompt,
    config,
    chatGreeting,
}: {
    setPrompt: (prompt: string) => void;
    config: any;
    chatGreeting?: string;
}) => {
    const [greeting, setGreeting] = useState<string[]>([]);
    useEffect(() => {
        if (config) {
            let greeting = [
                config?.setting?.greeting,
                1000,
                config?.setting?.live_config?.welcome_message,
                1000,
                config?.setting?.desc,
                1000,
            ];
            greeting = greeting.filter(Boolean);
            setGreeting(greeting);
        }
    }, [config]);
    return (
        <div className="mx-auto flex w-full max-w-[1010px] flex-col text-sm items-center justify-center min-h-[calc(100vh-100px)]">
            <div className="flex flex-col items-center gap-y-4">
                <div className="gap-y-4 flex flex-col items-center  lg:max-w-full">
                    <p className="m-0 text-center text-[24px] font-[700] leading-[35.28px] text-white lg:text-[38px] lg:leading-[38px]">
                        {chatGreeting || config?.setting?.name}
                    </p>
                    {greeting.length > 0 && (
                        <TypeAnimation
                            sequence={greeting}
                            wrapper="span"
                            speed={50}
                            style={{ fontSize: '16px', display: 'inline-block', color: '#b0b0c8' }}
                            repeat={Infinity}
                        />
                    )}
                </div>
                <div className="mx-auto w-full max-w-[calc((100vw_-_32px))] lg:w-fit">
                    <div className=" flex w-full animate-fade-up flex-col gap-4 gap-x-[20px] overflow-x-auto text-[14px] xl:flex-row px-4 cursor-pointer">
                        {config?.suggests?.slice(0, 3).map((prompt: string, index: number) => (
                            <motion.button
                                key={index}
                                onClick={() => setPrompt(prompt)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.15, duration: 0.3 }}
                                className="flex w-full cursor-pointer flex-row gap-x-2 rounded-md p-4 outline-none transition-all bg-white/10 border border-white/10 hover:bg-white/15 hover:border-[#c5a664]/30"
                            >
                                <MessageCircleMore className="h-8 w-8 shrink-0 text-[#c5a664]" />
                                <p className="line-clamp-3 text-left text-[14px] font-medium leading-[20px] text-gray-300 m-0">
                                    {prompt}
                                </p>
                            </motion.button>

                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DefaultChat