export type LanguageCode =
  | 'ur'
  | 'hi'
  | 'en'
  | 'ar'
  | 'es'
  | 'fr'
  | 'de'
  | 'tr'
  | 'zh'
  | 'ja'
  | 'pt';

export interface Language {
  code: LanguageCode;
  name: string;
  native: string;
  dir?: 'ltr' | 'rtl';
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  style: string;
  sampleAudio?: string;
}

export interface Speaker {
  id: string;
  name: string;
  voice: string;
  color: string;
  gender?: string;
  pitch?: number; // 0.8 - 1.2
  speed?: number; // 0.8 - 1.3
}

export interface DialogueSegment {
  id: string;
  startTime: number;
  endTime: number;
  speakerId: string;
  originalText: string;
  translatedText: string;
  voice: string;
  audioBlobUrl?: string;
  audioBase64?: string;
  isGeneratingAudio?: boolean;
}

export interface Project {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number;
  sourceLanguage: string;
  targetLanguage: string;
  speakers: Speaker[];
  segments: DialogueSegment[];
  duckingPercent: number; // 0 - 100 (percentage of original audio during speech)
  subtitlesEnabled: boolean;
  subtitleFontSize: number;
  subtitleFontColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isGuest: boolean;
  storageUsedMB: number;
  storageLimitMB: number;
  joinedDate: string;
}
