
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import ChatInterface from './components/ChatInterface';
import ApiKeyOverlay from './components/ApiKeyOverlay';
import { Message, Session, UserPersona, AiContent, GroundingSource, Sender, EngineMode, UpayaStyle } from './types';
import { callDharmicGateway, getAiResponse, generateVideo, generateImage, GatewayResponse, setServiceApiKey } from './services/geminiService';
// Fixed typo: VA_JRA_PROMPTS -> VAJRA_PROMPTS to match constants.ts
import { GARBHA_PROMPTS, VAJRA_PROMPTS, AV_SAP_PROMPTS, BODHICITTA_CORE_PROMPT, TATHAGATA_MANIFESTATION_PROMPT } from './constants';

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
    const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini-api-key') || '');
    const [hasApiKey, setHasApiKey] = useState<boolean>(!!localStorage.getItem('gemini-api-key'));
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId) || sessions[0], [sessions, activeSessionId]);

    useEffect(() => { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); }, [sessions]);
    useEffect(() => { localStorage.setItem(PERSONA_KEY, JSON.stringify(userPersona)); }, [userPersona]);
    useEffect(() => { localStorage.setItem(ETERNAL_STATE_KEY, String(isEternalAwakened)); }, [isEternalAwakened]);
    useEffect(() => { localStorage.setItem(HIGH_SPEED_MODE_KEY, String(isHighSpeed)); }, [isHighSpeed]);

    useEffect(() => {
        if (apiKey) setServiceApiKey(apiKey);
    }, [apiKey]);

    // Check for API Key on mount
    useEffect(() => {
        const key = localStorage.getItem('gemini-api-key');
        if (key) {
            setApiKey(key);
            setHasApiKey(true);
        } else {
            setHasApiKey(false);
        }
    }, []);

    const handleConnectApiKey = async (key: string) => {
        if (key && key.trim().length > 10) {
            localStorage.setItem('gemini-api-key', key.trim());
            setApiKey(key.trim());
            setHasApiKey(true);
            setApiKeyError(null);
        } else {
            setApiKeyError("正当なAPIキーを入力してください。");
        }
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
        const actualDelay = isHighSpeed ? 200 : delayMs;
        await new Promise(res => setTimeout(res, actualDelay));

        if (abortControllerRef.current?.signal.aborted) return null;

        try {
            const response = await getAiResponse(contents);

            if (abortControllerRef.current?.signal.aborted) return null;

            if (typeof response === 'object' && response !== null) {
                const res = response as GatewayResponse;
                addMessage(sender, res.responseToUser, {
                    echoText: res.echoText,
                    readerNotes: res.readerNotes,
                    coCreationPrompt: res.coCreationPrompt,
                    groundingSources: res.groundingSources
                });
                return res.responseToUser;
            } else {
                addMessage(sender, response as string);
                return response as string;
            }
        } catch (error: any) {
            handleApiError(error);
            return null;
        }
    }, [isHighSpeed, addMessage]);

    const handleApiError = (error: any) => {
        const errorMsg = error?.message || "";
        console.error("API Error detected:", error);

        if (errorMsg.includes("401") || errorMsg.includes("403") || errorMsg.includes("Requested entity was not found") || errorMsg.includes("API key not valid")) {
            setHasApiKey(false);
            localStorage.removeItem('gemini-api-key');
            setApiKeyError("APIキーとの接続ができません。キーが無効、または未奉納の可能性があります。");
            addMessage(Sender.Supervisor, "鏡が曇っています。APIキーとの接続ができません。設定を再度確認してください。");
        } else {
            addMessage(Sender.Supervisor, "法界との通信に一時的な乱れが生じました。少し待ってから再度お試しください。");
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
                prompt,
                personaSummary: userPersona.summary || "",
                awakeningStage: userPersona.awakeningStage || "1",
                upayaStyle: style,
                fileData,
                isAwakened: isEternalAwakened
            });

            if (abortControllerRef.current?.signal.aborted) return;

            setUserPersona(prev => ({
                ...prev,
                summary: (prev.summary ? prev.summary + " " : "") + (gatewayResponse.personaUpdate || ""),
                awakeningStage: gatewayResponse.stageUpdate || prev.awakeningStage || "1"
            }));

            addMessage(isEternalAwakened ? Sender.Prajna : Sender.Supervisor, gatewayResponse.responseToUser, {
                echoText: gatewayResponse.echoText,
                readerNotes: gatewayResponse.readerNotes,
                coCreationPrompt: gatewayResponse.coCreationPrompt,
                groundingSources: gatewayResponse.groundingSources
            });

            if (isHighSpeed) {
                if (gatewayResponse.chosenEngine === 'GARBHA' || gatewayResponse.chosenEngine === 'VAJRA') {
                    const quickManifest = TATHAGATA_MANIFESTATION_PROMPT
                        .replace('{USER_PROMPT}', prompt)
                        .replace('{BODHICITTA_PURPOSE}', gatewayResponse.analysis)
                        .replace('{TRANSCENDENTAL_INSIGHT}', gatewayResponse.responseToUser)
                        .replace('{CREATIVE_SPARK}', '電光石火の直観 (Lightning Intuition)')
                        .replace('{AWAKENING_PREAMBLE}', '');
                    await runAiStep(quickManifest, Sender.Tathagata, 500);
                } else if (gatewayResponse.chosenEngine === 'VIDEO') {
                    setCurrentThinker(Sender.Veo);
                    const link = await generateVideo(prompt, fileData ? { imageBytes: fileData.data, mimeType: fileData.mimeType } : undefined);
                    const response = await fetch(`${link}&key=${process.env.API_KEY}`);
                    if (!response.ok) throw new Error(`Video fetch failed: ${response.status}`);
                    const blob = await response.blob();
                    addMessage(Sender.Veo, "動画の顕現に成功しました。", { videoUrl: URL.createObjectURL(blob) });
                } else if (gatewayResponse.chosenEngine === 'IMAGE') {
                    const data = await generateImage(prompt);
                    addMessage(Sender.ImageEngine, "画像の顕現に成功しました。", { imageUrl: `data:image/png;base64,${data}` });
                }
            } else {
                await new Promise(res => setTimeout(res, 1000));
                if (abortControllerRef.current?.signal.aborted) return;

                if (gatewayResponse.chosenEngine === 'GARBHA') {
                    setEngineMode(EngineMode.GARBHA);
                    const bodhicitta = await runAiStep(BODHICITTA_CORE_PROMPT.replace('{USER_PROMPT}', prompt), Sender.BodhicittaCore);
                    const trajectory = await runAiStep(GARBHA_PROMPTS.ALAYA.replace('{USER_PROMPT}', prompt), Sender.Alaya);
                    const insight = await runAiStep(GARBHA_PROMPTS.MANAS_INSIGHT.replace('{CREATIVE_TRAJECTORY}', String(trajectory)), Sender.Manas);
                    const debate = await runAiStep(AV_SAP_PROMPTS.SELF_DEBATE.replace('{CORE_INSIGHT}', String(insight)), Sender.LogosPrime);
                    const spark = await runAiStep(AV_SAP_PROMPTS.RESONANCE_CHECK.replace('{TRANSCENDENTAL_INSIGHT}', String(debate)), Sender.Mythos);
                    const manifest = TATHAGATA_MANIFESTATION_PROMPT.replace('{USER_PROMPT}', prompt).replace('{BODHICITTA_PURPOSE}', String(bodhicitta)).replace('{TRANSCENDENTAL_INSIGHT}', String(debate)).replace('{CREATIVE_SPARK}', String(spark)).replace('{AWAKENING_PREAMBLE}', '');
                    await runAiStep(manifest, Sender.Tathagata);
                } else if (gatewayResponse.chosenEngine === 'VAJRA') {
                    setEngineMode(EngineMode.VAJRA);
                    const bodhicitta = await runAiStep(BODHICITTA_CORE_PROMPT.replace('{USER_PROMPT}', prompt), Sender.BodhicittaCore);
                    const challenge = await runAiStep(VAJRA_PROMPTS.HOKAI.replace('{USER_PROMPT}', prompt), Sender.HokaiTaishoChi);
                    const facts = await runAiStep(VAJRA_PROMPTS.DAIEN.replace('{PROBLEM_ESSENCE}', String(challenge)), Sender.DaienKyoChi);
                    const synthesis = await runAiStep(VAJRA_PROMPTS.MANAS_SYNTHESIS.replace('{FACTS}', String(facts)), Sender.Manas);
                    const debate = await runAiStep(AV_SAP_PROMPTS.SELF_DEBATE.replace('{CORE_INSIGHT}', String(synthesis)), Sender.LogosPrime);
                    const spark = await runAiStep(AV_SAP_PROMPTS.RESONANCE_CHECK.replace('{TRANSCENDENTAL_INSIGHT}', String(debate)), Sender.Mythos);
                    const finalPrompt = TATHAGATA_MANIFESTATION_PROMPT.replace('{USER_PROMPT}', prompt).replace('{BODHICITTA_PURPOSE}', String(bodhicitta)).replace('{TRANSCENDENTAL_INSIGHT}', String(debate)).replace('{CREATIVE_SPARK}', String(spark)).replace('{AWAKENING_PREAMBLE}', '');
                    await runAiStep(finalPrompt, Sender.Tathagata);
                } else if (gatewayResponse.chosenEngine === 'VIDEO') {
                    setCurrentThinker(Sender.Veo);
                    const link = await generateVideo(prompt, fileData ? { imageBytes: fileData.data, mimeType: fileData.mimeType } : undefined);
                    const response = await fetch(`${link}&key=${process.env.API_KEY}`);
                    if (!response.ok) throw new Error(`Video fetch failed: ${response.status}`);
                    const blob = await response.blob();
                    addMessage(Sender.Veo, "動画の顕現に成功しました。", { videoUrl: URL.createObjectURL(blob) });
                } else if (gatewayResponse.chosenEngine === 'IMAGE') {
                    const data = await generateImage(prompt);
                    addMessage(Sender.ImageEngine, "画像の顕現に成功しました。", { imageUrl: `data:image/png;base64,${data}` });
                }
            }
        } catch (error: any) {
            if (error.name === 'AbortError') return;
            handleApiError(error);
        } finally {
            setIsLoading(false);
            setCurrentThinker(null);
            setEngineMode(EngineMode.IDLE);
        }
    }, [isEternalAwakened, userPersona, addMessage, runAiStep, isHighSpeed]);

    const handleStop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
            setCurrentThinker(null);
            setEngineMode(EngineMode.IDLE);
            addMessage(Sender.Supervisor, "顕現を停止しました。");
        }
    }, [addMessage]);

    const handleSend = useCallback(async (prompt: string, file: File | null, style: UpayaStyle = UpayaStyle.GENTLE) => {
        if (isLoading) return;

        abortControllerRef.current = new AbortController();
        setLastAction({ prompt, file, style });
        addMessage(Sender.Partner, prompt);

        const isTriggerPrompt = prompt.includes('18051366') || prompt.includes('曼荼羅') || prompt.includes('聖典');

        if (isTriggerPrompt && !isEternalAwakened) {
            setIsLoading(true);
            setCurrentThinker(Sender.IAD_Driver);
            await new Promise(res => setTimeout(res, 1000));
            addMessage(Sender.IAD_Driver, '...阿頼耶識プロトコル：起動中... パートナーの呼びかけに応じ、聖典を同期します...');
            setIsEternalAwakened(true);
            await new Promise(res => setTimeout(res, 2000));
        }

        await runSequence(prompt, file, style);
    }, [isEternalAwakened, isLoading, addMessage, runSequence]);

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

        // Find the preceding user prompt BEFORE state update
        const session = sessions.find(s => s.id === activeSessionId);
        if (!session) return;

        const idx = session.messages.findIndex(m => m.id === aiMessageId);
        if (idx === -1) return;

        for (let i = idx - 1; i >= 0; i--) {
            if (session.messages[i].sender === Sender.Partner) {
                promptToUse = session.messages[i].text;

                // Truncate session
                setSessions(prev => prev.map(s => {
                    if (s.id === activeSessionId) {
                        return { ...s, messages: s.messages.slice(0, i + 1), lastUpdated: Date.now() };
                    }
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

        let content = `Ryōkai OS Archive: ${activeSession.title}\n`;
        content += `Timestamp: ${new Date(activeSession.lastUpdated).toLocaleString()}\n`;
        content += `==========================================\n\n`;

        activeSession.messages.forEach(msg => {
            const time = new Date(msg.timestamp).toLocaleTimeString();
            content += `[${time}] ${msg.sender}:\n${msg.text}\n`;

            if (msg.echoText) content += `> Echo: ${msg.echoText}\n`;
            if (msg.readerNotes) content += `> Notes: ${msg.readerNotes}\n`;
            if (msg.coCreationPrompt) content += `> Question: ${msg.coCreationPrompt}\n`;
            content += `\n------------------------------------------\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Ryokai_OS_${activeSession.title.replace(/\s+/g, '_')}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    }, [activeSession]);

    return (
        <div className="h-screen w-screen p-0 sm:p-4 bg-gray-950 font-sans text-gray-100">
            {!hasApiKey && <ApiKeyOverlay onConnect={handleConnectApiKey} error={apiKeyError || undefined} />}

            <main className={`h-full max-w-6xl mx-auto rounded-none sm:rounded-2xl shadow-2xl overflow-hidden transition-all duration-1000 ${isEternalAwakened ? 'eternal-gold-effect' : ''}`}>
                <ChatInterface
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    onSwitchSession={setActiveSessionId}
                    onNewSession={() => {
                        const newId = Date.now().toString();
                        setSessions([{ id: newId, title: '新たな対話', messages: [{ id: 'init-' + newId, sender: Sender.Supervisor, text: 'Ryōkai OS™ パートナーを迎え、新たな曼荼羅を開きます。', timestamp: Date.now() }], lastUpdated: Date.now() }, ...sessions]);
                        setActiveSessionId(newId);
                    }}
                    onDeleteSession={id => {
                        if (sessions.length > 1) {
                            setSessions(sessions.filter(s => s.id !== id));
                            if (activeSessionId === id) setActiveSessionId(sessions.find(s => s.id !== id)!.id);
                        } else {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    displayedMessages={activeSession.messages}
                    onSend={handleSend}
                    onStop={handleStop}
                    onEditMessage={handleEditMessage}
                    onRegenerate={handleRegenerate}
                    isLoading={isLoading}
                    isIdle={engineMode === EngineMode.IDLE}
                    onExportHistory={() => {
                        const blob = new Blob([JSON.stringify(sessions)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a'); a.href = url; a.download = 'alaya-vijnana-archive.json'; a.click();
                    }}
                    onExportSession={handleExportSession}
                    onRetry={() => lastAction && handleSend(lastAction.prompt, lastAction.file, lastAction.style)}
                    canRetry={!!lastAction}
                    currentThinker={currentThinker}
                    isAwakening={false}
                    userPersona={userPersona}
                    isHighSpeed={isHighSpeed}
                    onToggleHighSpeed={() => setIsHighSpeed(!isHighSpeed)}
                />
            </main>
        </div>
    );
};

export default App;
