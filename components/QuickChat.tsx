import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { getQuickChat } from '../services/geminiService';
import { ZapIcon, SendIcon, LoaderIcon } from './Icons';

interface Message {
    sender: 'user' | 'model';
    text: string;
}

const QuickChat: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setChat(getQuickChat());
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        try {
            const responseStream = await chat.sendMessageStream({ message: input });
            let modelResponse = '';
            setMessages(prev => [...prev, { sender: 'model', text: '...' }]);

            for await (const chunk of responseStream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'model', text: modelResponse };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = { sender: 'model', text: '抱歉，出错了。' };
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = errorMessage;
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[90vh]">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-4">
                <ZapIcon className="w-8 h-8"/> 快速问答 (低延迟)
            </h2>
            <div className="flex-1 bg-gray-800 rounded-xl shadow-lg flex flex-col p-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md lg:max-w-2xl px-4 py-2 rounded-2xl ${
                                msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isLoading && messages[messages.length-1]?.sender === 'user' && (
                        <div className="flex justify-start">
                             <div className="max-w-xs md:max-w-md lg:max-w-2xl px-4 py-2 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                                <LoaderIcon className="w-5 h-5 text-gray-400" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="快速提问..."
                        className="flex-1 p-3 bg-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 disabled:bg-gray-600 transition-colors">
                        <SendIcon className="w-6 h-6"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default QuickChat;