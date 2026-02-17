export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content: string;
  timestamp: number;
  model?: string;
  agent?: string; // Character name like 'ojizo_bot'
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  avatar: string; // Icon name from lucide
  prompt: string;
  color: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  memory?: string; // Loom of Memory essence
}
