import React from 'react';
import { motion } from 'framer-motion';

export const Mandala: React.FC = () => {
    return (
        <div className="mandala-container" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: -1,
            overflow: 'hidden'
        }}>
            <div className="breathing-bg" />
            <motion.div
                className="mandala-glow"
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            {/* Decorative SVG Mandala rings */}
            <motion.svg
                width="60vh"
                height="60vh"
                viewBox="0 0 100 100"
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                style={{ opacity: 0.1 }}
            >
                <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent-gold)" strokeWidth="0.2" strokeDasharray="1,2" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent-gold)" strokeWidth="0.1" />
                <path d="M50 2 L50 98 M2 50 L98 50 M15.5 15.5 L84.5 84.5 M15.5 84.5 L84.5 15.5" stroke="var(--accent-gold)" strokeWidth="0.05" />
            </motion.svg>
        </div>
    );
};
