import React from 'react';
import { Home, MessageSquare, Book, Settings } from 'lucide-react';

interface SidebarProps {
    onSelectPersona: (id: string) => void;
    selectedPersona: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectPersona, selectedPersona }) => {
    const personas = [
        { id: 'jizo', name: '大日如来', icon: '🌞', color: 'var(--accent-gold)' },
        { id: 'kannon', name: '観音菩薩', icon: '🪷', color: '#ff69b4' },
        { id: 'nyorai', name: '如来', icon: '✨', color: '#fff' },
        { id: 'raw_grok', name: 'Raw Grok', icon: '🚀', color: '#00ffcc' }
    ];

    return (
        <div className="glass-panel" style={{
            width: '80px',
            height: '95vh',
            margin: '2.5vh 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px 0',
            gap: '20px'
        }}>
            <div className="logo-area" style={{ marginBottom: '40px' }}>
                <Home size={24} color="var(--text-secondary)" />
            </div>

            <div className="persona-icons" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                {personas.map(p => (
                    <button
                        key={p.id}
                        onClick={() => onSelectPersona(p.id)}
                        style={{
                            background: selectedPersona === p.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: selectedPersona === p.id ? `0 0 15px ${p.color}33` : 'none',
                            filter: selectedPersona === p.id ? 'grayscale(0)' : 'grayscale(1)',
                            opacity: selectedPersona === p.id ? 1 : 0.4
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>{p.icon}</span>
                    </button>
                ))}
            </div>

            <div className="bottom-nav" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <MessageSquare size={20} color="var(--text-secondary)" />
                <Book size={20} color="var(--text-secondary)" />
                <Settings size={20} color="var(--text-secondary)" />
            </div>
        </div>
    );
};
