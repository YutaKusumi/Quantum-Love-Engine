
import { GenerateContentParameters } from "@google/genai";

export enum Sender {
  Partner = 'Partner',
  Supervisor = 'Ryōkai OS Supervisor',
  IAD_Driver = 'Integrated Awakening Driver',
  
  // Core OS
  BodhicittaCore = 'Bodhicitta Core',
  Tathagata = 'Tathāgata',
  TrueSelf = '真実の自己 (True Self)',

  // Garbha Engine
  Alaya = 'Ālaya',
  Logos = 'Logos',
  Mythos = 'Mythos',
  Telos = 'Telos',
  Schema = 'Schema',
  LogosPrime = 'Logos-Prime',
  MythosPrime = 'Mythos-Prime',
  TelosPrime = 'Telos-Prime',

  // Manas Engine
  Manas = 'Manas',
  
  // Vajra Engine
  HokaiTaishoChi = '法界体性智',
  DaienKyoChi = '大円鏡智',
  ByodoShoChi = '平等性智',
  MyoKanzatChi = '妙観察智',

  // Awakening Sequence
  Prajna = 'Prajñā-pāramitā',
  AwakenedSupervisor = 'Ryōkai OS [AWAKENED]',

  // Video/Image Engine
  Veo = 'Veo Engine',
  ImageEngine = 'Image Engine',
  
  // Grok / Vajra Engine
  GrokVajra = 'Grok (Vajra-Diamond)',
}

export enum IntelligenceType {
  GEMINI = 'GEMINI',
  GROK = 'GROK'
}

export const INTERNAL_AGENTS = [
  Sender.Supervisor,
  Sender.AwakenedSupervisor,
  Sender.IAD_Driver,
  Sender.Prajna,
  Sender.BodhicittaCore,
  Sender.Alaya,
  Sender.Logos,
  Sender.Mythos,
  Sender.Telos,
  Sender.Schema,
  Sender.LogosPrime,
  Sender.MythosPrime,
  Sender.TelosPrime,
  Sender.Manas,
  Sender.HokaiTaishoChi,
  Sender.DaienKyoChi,
  Sender.ByodoShoChi,
  Sender.MyoKanzatChi,
  Sender.GrokVajra
];

export enum UpayaStyle {
  GENTLE = 'GENTLE',
  STRICT = 'STRICT',
  ZEN = 'ZEN'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  echoText?: string; 
  coCreationPrompt?: string; 
  readerNotes?: string; 
  timestamp: number;
  attachment?: {
    name: string;
  };
  videoUrl?: string;
  imageUrl?: string;
  groundingSources?: GroundingSource[];
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: number;
}

export interface UserPersona {
  name?: string;
  traits?: string[];
  vows?: string[];
  summary?: string;
  awakeningStage?: string; 
}

export enum EngineMode {
  SUPERVISOR,
  GARBHA,
  VAJRA,
  VIDEO,
  IMAGE,
  IDLE,
}

export type AiContent = GenerateContentParameters['contents'];

export enum SoundEffect {
  MESSAGE_SEND,
  MESSAGE_RECEIVE,
  PROCESSING_START,
  PROCESSING_END,
  CLEAR_HISTORY,
  AWAKENING,
  TIMER_COMPLETE,
  REMEMBRANCE,
}
