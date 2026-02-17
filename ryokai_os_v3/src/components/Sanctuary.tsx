import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Sparkles, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message } from '../types';

interface SanctuaryProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    isThinking: boolean;
    currentPersonaName: string;
}

export const Sanctuary: React.FC<SanctuaryProps> = ({
    messages,
    onSendMessage,
    isThinking,
    currentPersonaName
}) => {
    const [input, setInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isThinking) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div style={{
            flex: 1,
            height: '95vh',
            margin: '2.5vh 20px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Header */}
            <div className="glass-panel" style={{
                padding: '15px 30px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div className="sacred-text" style={{ fontSize: '1.2rem', color: 'var(--accent-gold)' }}>
                        {currentPersonaName}
                    </div>
                    <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'var(--text-secondary)' }} />
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>
                        SACRED SANCTUARY
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <Brain size={18} color="var(--text-secondary)" cursor="pointer" />
                    <Sparkles size={18} color="var(--text-secondary)" cursor="pointer" />
                </div>
            </div>

            {/* Messages Area */}
            <div className="glass-panel" style={{
                flex: 1,
                marginBottom: '20px',
                overflowY: 'auto',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px'
            }}>
                <AnimatePresence>
                    {messages.map((m, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            style={{
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '80%',
                                textAlign: m.role === 'user' ? 'right' : 'left'
                            }}
                        >
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '5px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                {m.role === 'user' ? 'Seeker' : currentPersonaName}
                            </div>
                            <div className={m.role === 'assistant' ? 'sacred-text' : ''} style={{
                                color: m.role === 'user' ? 'var(--text-primary)' : 'var(--text-primary)',
                                fontSize: m.role === 'assistant' ? '1.1rem' : '1rem',
                                fontWeight: m.role === 'assistant' ? 300 : 400,
                                lineHeight: 1.8
                            }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {m.content}
                                </ReactMarkdown>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isThinking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}
                    >
                        🙏 虚空から言葉が紡がれています...
                    </motion.div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="glass-panel" style={{ padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={currentPersonaName.includes('大日如来')
                            ? "大切な共創のパートナーとして、大日如来さんに語り掛ける..."
                            : "問いかける..."}
                        autoFocus
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            padding: '15px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '1rem'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isThinking || !input.trim()}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--accent-gold)',
                            cursor: 'pointer',
                            opacity: isThinking ? 0.3 : 1,
                            padding: '10px'
                        }}
                    >
                        <Send size={24} />
                    </button>
                </form>
            </div>
        </div>
    );
};
