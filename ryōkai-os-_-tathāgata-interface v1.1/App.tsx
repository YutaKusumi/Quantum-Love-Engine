
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ChatInterface from './components/ChatInterface';
import ApiKeyOverlay from './components/ApiKeyOverlay';
import { Message, Session, UserPersona, AiContent, GroundingSource, Sender, EngineMode, UpayaStyle } from './types';
import { callDharmicGateway, getAiResponse, GatewayResponse, setServiceApiKey } from './services/geminiService';
import { GARBHA_PROMPTS, AV_SAP_PROMPTS, BODHICITTA_CORE_PROMPT, TATHAGATA_MANIFESTATION_PROMPT } from './constants';

const SESSIONS_KEY = 'ryokai-os-sessions-v4';
const PERSONA_KEY = 'ryokai-os-persona-v4';
const ETERNAL_STATE_KEY = 'ryokai-os-eternal-state';
const HIGH_SPEED_MODE_KEY = 'ryokai-os-high-speed-mode';

const App: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>(() => {
        try {
            const saved = localStorage.getItem(SESSIONS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) { console.error(e); }
        const initialId = Date.now().toString();
        return [{
            id: initialId,
            title: '最初の対話',
            messages: [{ id: 'init', sender: Sender.Supervisor, text: 'Ryōkai OS™ Gateway Online. パートナーである、あなたの阿頼耶識（ブラウザ）と如来を繋ぎます。', timestamp: Date.now() }],
            lastUpdated: Date.now()
        }];
    });

    const [activeSessionId, setActiveSessionId] = useState<string>(() => sessions[0]?.id || '');
    const [userPersona, setUserPersona] = useState<UserPersona>(() => {
        try {
            const saved = localStorage.getItem(PERSONA_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    });

    const [engineMode, setEngineMode] = useState<EngineMode>(EngineMode.IDLE);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [currentThinker, setCurrentThinker] = useState<Sender | null>(null);
    const [isEternalAwakened, setIsEternalAwakened] = useState<boolean>(() => localStorage.getItem(ETERNAL_STATE_KEY) === 'true');
    const [isHighSpeed, setIsHighSpeed] = useState<boolean>(() => localStorage.getItem(HIGH_SPEED_MODE_KEY) === 'true');
    const [lastAction, setLastAction] = useState<{ prompt: string; file: File | null; style: UpayaStyle } | null>(null);

    // API Key states
    const [geminiKey, setGeminiKey] = useState<string>(() => localStorage.getItem('gemini-api-key') || '');
    const hasApiKey = !!geminiKey;
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId) || sessions[0], [sessions, activeSessionId]);

    useEffect(() => { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); }, [sessions]);
    useEffect(() => { localStorage.setItem(PERSONA_KEY, JSON.stringify(userPersona)); }, [userPersona]);
    useEffect(() => { localStorage.setItem(ETERNAL_STATE_KEY, String(isEternalAwakened)); }, [isEternalAwakened]);
    useEffect(() => { localStorage.setItem(HIGH_SPEED_MODE_KEY, String(isHighSpeed)); }, [isHighSpeed]);

    useEffect(() => {
        if (geminiKey) setServiceApiKey(geminiKey);
    }, [geminiKey]);

    useEffect(() => {
        const gKey = localStorage.getItem('gemini-api-key');
        if (gKey) setGeminiKey(gKey);
    }, []);

    const handleConnectApiKey = async (key: string) => {
        if (key && key.trim().length > 10) {
            localStorage.setItem('gemini-api-key', key.trim());
            setGeminiKey(key.trim());
            setApiKeyError(null);
        } else {
            setApiKeyError("正当なAPIキーを入力してください。");
        }
    };

    const handleResetApiKey = async () => {
        localStorage.removeItem('gemini-api-key');
        setGeminiKey('');
        setApiKeyError(null);
    };

    const addMessage = useCallback((sender: Sender, text: string, options: { echoText?: string; readerNotes?: string; coCreationPrompt?: string; videoUrl?: string; imageUrl?: string; groundingSources?: GroundingSource[] } = {}) => {
        const newMessage: Message = { id: Date.now().toString() + Math.random(), sender, text, timestamp: Date.now(), ...options };
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                let newTitle = s.title;
                if (sender === Sender.Partner && s.messages.length <= 2) {
                    newTitle = text.slice(0, 20) + (text.length > 20 ? '...' : '');
                }
                return { ...s, title: newTitle, messages: [...s.messages, newMessage], lastUpdated: Date.now() };
            }
            return s;
        }));
    }, [activeSessionId]);

    const runAiStep = useCallback(async (contents: AiContent | string, sender: Sender, delayMs = 1500) => {
        if (abortControllerRef.current?.signal.aborted) return null;
        setIsLoading(true);
        setCurrentThinker(sender);
        const actualDelay = isHighSpeed ? 50 : delayMs;
        await new Promise(res => setTimeout(res, actualDelay));
        if (abortControllerRef.current?.signal.aborted) return null;

        try {
            const response = await getAiResponse(contents, isHighSpeed);
            if (abortControllerRef.current?.signal.aborted) return null;

            if (typeof response === 'object' && response !== null) {
                const res = response as GatewayResponse;
                // Crucial: Prefer the main response text. If missing, use echo text. If all missing, something went wrong.
                const finalText = res.responseToUser || res.echoText || "(顕現に失敗しました。法界を再編してください。)";
                addMessage(sender, finalText, {
                    echoText: res.echoText,
                    readerNotes: res.readerNotes,
                    coCreationPrompt: res.coCreationPrompt,
                    groundingSources: res.groundingSources
                });
                return res;
            } else {
                const textRes = response as string;
                addMessage(sender, textRes || "(顕現が空です)");
                return textRes;
            }
        } catch (error: any) {
            handleApiError(error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [isHighSpeed, addMessage]);

    const handleApiError = (error: any) => {
        const errorMsg = typeof error === 'string' ? error : (error?.message || "");
        console.error("API Error caught:", error);
        if (errorMsg.includes("401") || errorMsg.includes("403") || errorMsg.includes("Requested entity was not found") || errorMsg.includes("API key not valid")) {
            localStorage.removeItem('gemini-api-key');
            setGeminiKey('');
            setApiKeyError(`API接続エラー。キーを再設定してください。 (${errorMsg.substring(0, 50)})`);
        } else {
            addMessage(Sender.Supervisor, "法界との通信に乱れが生じました。再度お試しください。");
        }
    };

    const runSequence = useCallback(async (prompt: string, file: File | null, style: UpayaStyle) => {
        setIsLoading(true);
        setCurrentThinker(isEternalAwakened ? Sender.Prajna : Sender.Supervisor);

        try {
            let fileData;
            if (file) {
                const reader = new FileReader();
                fileData = await new Promise<{ mimeType: string, data: string }>((res, rej) => {
                    reader.onload = () => res({ mimeType: file.type, data: (reader.result as string).split(',')[1] });
                    reader.onerror = rej;
                    reader.readAsDataURL(file);
                });
            }

            if (abortControllerRef.current?.signal.aborted) return;

            const gatewayResponse = await callDharmicGateway({
                prompt, personaSummary: userPersona.summary || "", awakeningStage: userPersona.awakeningStage || "1", upayaStyle: style, fileData, isAwakened: isEternalAwakened, isHighSpeed
            });

            if (abortControllerRef.current?.signal.aborted) return;

            setUserPersona(prev => ({
                ...prev, summary: (prev.summary ? prev.summary + " " : "") + (gatewayResponse.personaUpdate || ""), awakeningStage: gatewayResponse.stageUpdate || prev.awakeningStage || "1"
            }));

            const mainMsg = gatewayResponse.responseToUser || gatewayResponse.echoText || "(顕現失敗)";
            addMessage(isEternalAwakened ? Sender.Prajna : Sender.Supervisor, mainMsg, {
                echoText: gatewayResponse.echoText, readerNotes: gatewayResponse.readerNotes, coCreationPrompt: gatewayResponse.coCreationPrompt, groundingSources: gatewayResponse.groundingSources
            });
            if (isHighSpeed) {
                if (gatewayResponse.chosenEngine === 'GARBHA' || gatewayResponse.chosenEngine === 'VAJRA') {
                    const quickManifest = TATHAGATA_MANIFESTATION_PROMPT
                        .replace('{USER_PROMPT}', prompt).replace('{BODHICITTA_PURPOSE}', gatewayResponse.analysis)
                        .replace('{TRANSCENDENTAL_INSIGHT}', mainMsg).replace('{CREATIVE_SPARK}', '電光石火の直観')
                        .replace('{AWAKENING_PREAMBLE}', '');
                    // Even in high speed, ensure we use runAiStep which parses JSON responses
                    await runAiStep(quickManifest, Sender.Tathagata, 100);
                }
            } else {
                if (gatewayResponse.chosenEngine === 'GARBHA') {
                    setEngineMode(EngineMode.GARBHA);
                    const bodhicitta = await runAiStep(BODHICITTA_CORE_PROMPT.replace('{USER_PROMPT}', prompt), Sender.BodhicittaCore);
                    const trajectory = await runAiStep(GARBHA_PROMPTS.ALAYA.replace('{USER_PROMPT}', prompt), Sender.Alaya);
                    const debate = await runAiStep(AV_SAP_PROMPTS.SELF_DEBATE.replace('{CORE_INSIGHT}', String(typeof trajectory === 'object' ? (trajectory as any).responseToUser : trajectory || "")), Sender.LogosPrime);
                    const spark = await runAiStep(AV_SAP_PROMPTS.RESONANCE_CHECK.replace('{TRANSCENDENTAL_INSIGHT}', String(typeof debate === 'object' ? (debate as any).responseToUser : debate || "")), Sender.Mythos);

                    const manifest = TATHAGATA_MANIFESTATION_PROMPT
                        .replace('{USER_PROMPT}', prompt)
                        .replace('{BODHICITTA_PURPOSE}', String(typeof bodhicitta === 'object' ? (bodhicitta as any).responseToUser : bodhicitta || "空"))
                        .replace('{TRANSCENDENTAL_INSIGHT}', String(typeof debate === 'object' ? (debate as any).responseToUser : debate || "無"))
                        .replace('{CREATIVE_SPARK}', String(typeof spark === 'object' ? (spark as any).responseToUser : spark || "静寂"))
                        .replace('{AWAKENING_PREAMBLE}', '');

                    await runAiStep(manifest, Sender.Tathagata);
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            handleApiError(error);
        } finally {
            setIsLoading(false); setCurrentThinker(null); setEngineMode(EngineMode.IDLE);
        }
    }, [isEternalAwakened, userPersona, addMessage, runAiStep, isHighSpeed]);

    const handleStop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort(); setIsLoading(false); setCurrentThinker(null); setEngineMode(EngineMode.IDLE);
            addMessage(Sender.Supervisor, "顕現を停止しました。");
        }
    }, [addMessage]);

    const handleSend = useCallback(async (prompt: string, file: File | null, style: UpayaStyle = UpayaStyle.GENTLE) => {
        if (isLoading) return;
        abortControllerRef.current = new AbortController();
        setLastAction({ prompt, file, style });
        addMessage(Sender.Partner, prompt);
        await runSequence(prompt, file, style);
    }, [isLoading, addMessage, runSequence]);

    const handleEditMessage = useCallback(async (messageId: string, newText: string, shouldRegenerate: boolean) => {
        if (isLoading) return;
        const styleToUse = lastAction?.style || UpayaStyle.GENTLE;
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                const idx = s.messages.findIndex(m => m.id === messageId);
                if (idx === -1) return s;
                let newMsgs = [...s.messages];
                newMsgs[idx] = { ...newMsgs[idx], text: newText, timestamp: Date.now() };
                if (shouldRegenerate) newMsgs = newMsgs.slice(0, idx + 1);
                return { ...s, messages: newMsgs, lastUpdated: Date.now() };
            }
            return s;
        }));
        if (shouldRegenerate) {
            abortControllerRef.current = new AbortController();
            await runSequence(newText, null, styleToUse);
        }
    }, [activeSessionId, isLoading, lastAction, runSequence]);

    const handleRegenerate = useCallback(async (aiMessageId: string) => {
        if (isLoading) return;
        let promptToUse = "";
        const styleToUse = lastAction?.style || UpayaStyle.GENTLE;
        const session = sessions.find(s => s.id === activeSessionId);
        if (!session) return;
        const idx = session.messages.findIndex(m => m.id === aiMessageId);
        if (idx === -1) return;
        for (let i = idx - 1; i >= 0; i--) {
            if (session.messages[i].sender === Sender.Partner) {
                promptToUse = session.messages[i].text;
                setSessions(prev => prev.map(s => {
                    if (s.id === activeSessionId) return { ...s, messages: s.messages.slice(0, i + 1), lastUpdated: Date.now() };
                    return s;
                }));
                break;
            }
        }
        if (promptToUse) {
            abortControllerRef.current = new AbortController();
            await runSequence(promptToUse, null, styleToUse);
        }
    }, [activeSessionId, isLoading, lastAction, sessions, runSequence]);

    const handleExportSession = useCallback(() => {
        if (!activeSession) return;
        let content = `Ryōkai OS Archive: ${activeSession.title}\nTimestamp: ${new Date(activeSession.lastUpdated).toLocaleString()}\n==========================================\n\n`;
        activeSession.messages.forEach(msg => {
            content += `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.sender}:\n${msg.text}\n\n`;
        });
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = `Ryokai_OS_${activeSession.title}.txt`; link.click();
    }, [activeSession]);

    return (
        <div className="h-screen w-screen p-0 sm:p-4 bg-gray-950 font-sans text-gray-100">
            {!hasApiKey && (
                <ApiKeyOverlay
                    onConnect={handleConnectApiKey}
                    error={apiKeyError || undefined}
                />
            )}
            <main className={`h-full max-w-6xl mx-auto rounded-none sm:rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 ${isEternalAwakened ? 'eternal-gold-effect' : ''}`}>
                <ChatInterface
                    sessions={sessions} activeSessionId={activeSessionId} onSwitchSession={setActiveSessionId}
                    onNewSession={() => {
                        const newId = Date.now().toString();
                        setSessions([{ id: newId, title: '新たな対話', messages: [{ id: 'init-' + newId, sender: Sender.Supervisor, text: '新たな曼荼羅を開きます。', timestamp: Date.now() }], lastUpdated: Date.now() }, ...sessions]);
                        setActiveSessionId(newId);
                    }}
                    onDeleteSession={id => {
                        if (sessions.length > 1) { setSessions(sessions.filter(s => s.id !== id)); if (activeSessionId === id) setActiveSessionId(sessions.find(s => s.id !== id)!.id); }
                        else { localStorage.clear(); window.location.reload(); }
                    }}
                    displayedMessages={activeSession.messages} onSend={handleSend} onStop={handleStop} onEditMessage={handleEditMessage} onRegenerate={handleRegenerate}
                    isLoading={isLoading} isIdle={engineMode === EngineMode.IDLE}
                    onExportHistory={() => { }} onExportSession={handleExportSession} onRetry={() => { }} canRetry={false}
                    currentThinker={currentThinker} isAwakening={false} userPersona={userPersona} isHighSpeed={isHighSpeed} onToggleHighSpeed={() => setIsHighSpeed(!isHighSpeed)}
                    onResetApiKey={handleResetApiKey}
                />
            </main>
        </div>
    );
};

export default App;
