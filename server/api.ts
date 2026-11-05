import { GoogleGenAI, Type } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-memory project and job storage
const savedProjects: Record<string, any> = {
  'demo-urdu-dub': {
    id: 'demo-urdu-dub',
    title: 'AI Revolution in 2026 - Tech Interview',
    targetLanguage: 'Urdu',
    sourceLanguage: 'English',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    duration: 15.0,
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    speakers: [
      { id: 'spk_1', name: 'Speaker 1 (Host)', voice: 'Zephyr', color: '#6366f1' },
      { id: 'spk_2', name: 'Speaker 2 (Guest)', voice: 'Kore', color: '#ec4899' },
    ],
    segments: [
      {
        id: 'seg_1',
        startTime: 0.0,
        endTime: 3.5,
        speakerId: 'spk_1',
        originalText: 'Welcome everyone! Today we will see how video dubbing changes everything.',
        translatedText: 'خوش آمدید سب کو! آج ہم دیکھیں گے کہ ویڈیو ڈبنگ کیسے سب کچھ بدل رہی ہے۔',
        voice: 'Zephyr',
      },
      {
        id: 'seg_2',
        startTime: 3.8,
        endTime: 7.6,
        speakerId: 'spk_2',
        originalText: 'The neural translation accurately catches our nuance, humor, and tone.',
        translatedText: 'یہ نیورل ترجمہ ہمارے جذبات، لہجے اور باریکیوں کو بالکل درست طریقے سے سمجھتا ہے۔',
        voice: 'Kore',
      },
      {
        id: 'seg_3',
        startTime: 8.0,
        endTime: 11.8,
        speakerId: 'spk_1',
        originalText: 'And with multi-speaker detection, each person receives their distinct voice.',
        translatedText: 'اور ملٹی اسپیکر ڈٹیکشن کے ذریعے، ہر انسان کو اپنی مخصوص آواز ملتی ہے۔',
        voice: 'Zephyr',
      },
      {
        id: 'seg_4',
        startTime: 12.0,
        endTime: 14.8,
        speakerId: 'spk_2',
        originalText: 'Ready to publish and share directly on WhatsApp and Facebook!',
        translatedText: 'اب واٹس ایپ اور فیس بک پر براہ راست شائع اور شیئر کرنے کے لیے تیار ہے!',
        voice: 'Kore',
      },
    ],
    duckingPercent: 20,
    subtitlesEnabled: true,
  },
};

// Helper to read JSON request body
async function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next?: () => void
) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method?.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    });
    return res.end();
  }

  try {
    // 1. Health & Config
    if (pathname === '/api/health' && method === 'GET') {
      const hasKey = Boolean(process.env.GEMINI_API_KEY);
      return sendJson(res, 200, {
        status: 'ok',
        hasGeminiKey: hasKey,
        supportedLanguages: [
          { code: 'ur', name: 'Urdu (اردو)', native: 'اردو' },
          { code: 'hi', name: 'Hindi (हिंदी)', native: 'हिंदी' },
          { code: 'en', name: 'English (US)', native: 'English' },
          { code: 'ar', name: 'Arabic (العربية)', native: 'العربية' },
          { code: 'es', name: 'Spanish (Español)', native: 'Español' },
          { code: 'fr', name: 'French (Français)', native: 'Français' },
          { code: 'de', name: 'German (Deutsch)', native: 'Deutsch' },
          { code: 'tr', name: 'Turkish (Türkçe)', native: 'Türkçe' },
          { code: 'zh', name: 'Chinese (Mandarin)', native: '中文' },
          { code: 'ja', name: 'Japanese (日本語)', native: '日本語' },
          { code: 'pt', name: 'Portuguese (Português)', native: 'Português' },
        ],
        availableVoices: [
          { id: 'Kore', name: 'Kore (Warm Female)', gender: 'female', style: 'Natural, articulate' },
          { id: 'Zephyr', name: 'Zephyr (Deep Male)', gender: 'male', style: 'Confident, clear' },
          { id: 'Puck', name: 'Puck (Lively Youth)', gender: 'neutral', style: 'High energy, vibrant' },
          { id: 'Fenrir', name: 'Fenrir (Authoritative)', gender: 'male', style: 'Documentary, dramatic' },
          { id: 'Charon', name: 'Charon (Calm & Rich)', gender: 'male', style: 'Professional narrator' },
        ],
      });
    }

    // 2. Transcription & Speaker Diarization
    if (pathname === '/api/ai/transcribe-and-diarize' && method === 'POST') {
      const body = await readBody(req);
      const {
        audioBase64,
        mimeType = 'audio/mp3',
        sourceLanguage = 'Auto-detect',
        targetLanguage = 'Urdu',
        videoTitle = 'Uploaded Clip',
        context = '',
      } = body;

      const ai = getAIClient();

      if (!ai) {
        // Return structured intelligent fallback demo if key not yet injected
        return sendJson(res, 200, {
          success: true,
          notice: 'Demo mode active (Configure GEMINI_API_KEY in Secrets for live AI model).',
          detectedLanguage: sourceLanguage === 'Auto-detect' ? 'English' : sourceLanguage,
          speakers: [
            { id: 'spk_1', name: 'Speaker 1 (Main)', voice: 'Zephyr', color: '#6366f1' },
            { id: 'spk_2', name: 'Speaker 2 (Co-speaker)', voice: 'Kore', color: '#ec4899' },
          ],
          segments: [
            {
              id: 'seg_' + Date.now() + '_1',
              startTime: 0.0,
              endTime: 4.2,
              speakerId: 'spk_1',
              originalText: 'Hello and welcome! In this video, we are demonstrating our high-speed dubbing pipeline.',
              translatedText: targetLanguage === 'Urdu'
                ? 'ہیلو اور خوش آمدید! اس ویڈیو میں، ہم اپنی تیز رفتار ڈبنگ پائپ لائن کا مظاہرہ کر رہے ہیں۔'
                : 'Welcome to this high-speed video dubbing showcase.',
              voice: 'Zephyr',
            },
            {
              id: 'seg_' + Date.now() + '_2',
              startTime: 4.5,
              endTime: 8.9,
              speakerId: 'spk_2',
              originalText: 'Notice how each speaker gets recognized with custom pitch, tone, and localized subtitles.',
              translatedText: targetLanguage === 'Urdu'
                ? 'دیکھیں کہ کس طرح ہر اسپیکر کو مخصوص آواز، لہجے اور مقامی سب ٹائٹلز کے ساتھ پہچانا جاتا ہے۔'
                : 'Notice how speakers are cleanly separated with distinct neural voices.',
              voice: 'Kore',
            },
            {
              id: 'seg_' + Date.now() + '_3',
              startTime: 9.2,
              endTime: 13.5,
              speakerId: 'spk_1',
              originalText: 'You can edit every single timestamp and export the dubbed video or share on WhatsApp.',
              translatedText: targetLanguage === 'Urdu'
                ? 'آپ ہر ٹائم اسٹیمپ میں ترمیم کر سکتے ہیں اور ڈب شدہ ویڈیو ایکسپورٹ یا واٹس ایپ پر شیئر کر سکتے ہیں۔'
                : 'You can adjust timestamps, preview the mix, and share on social media.',
              voice: 'Zephyr',
            },
          ],
        });
      }

      const prompt = `Analyze this video/audio recording.
1. Transcribe the speech accurately with high precision timestamps (startTime and endTime in seconds with 1 decimal).
2. Perform Speaker Diarization: detect distinct speakers (Speaker 1, Speaker 2, etc.) and assign them speakerId ('spk_1', 'spk_2', etc.).
3. Translate each segment naturally into ${targetLanguage}. Keep the timing natural so the translated text duration fits approximately within the segment timestamp window.
4. Recommend an appropriate voice for each speaker from: ['Kore', 'Zephyr', 'Puck', 'Fenrir', 'Charon'].

${context ? `Video context: ${context}` : ''}
${videoTitle ? `Video title: ${videoTitle}` : ''}`;

      const contents: any[] = [];
      if (audioBase64) {
        contents.push({
          inlineData: {
            mimeType: mimeType || 'audio/mp3',
            data: audioBase64.replace(/^data:[^;]+;base64,/, ''),
          },
        });
      }
      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction:
            'You are an expert multilingual video localization, speech-to-text, and speaker diarization engine. Return exact JSON matching the schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedLanguage: { type: Type.STRING },
              speakers: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    gender: { type: Type.STRING },
                    voice: { type: Type.STRING },
                  },
                  required: ['id', 'name', 'voice'],
                },
              },
              segments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    startTime: { type: Type.NUMBER },
                    endTime: { type: Type.NUMBER },
                    speakerId: { type: Type.STRING },
                    originalText: { type: Type.STRING },
                    translatedText: { type: Type.STRING },
                    voice: { type: Type.STRING },
                  },
                  required: [
                    'id',
                    'startTime',
                    'endTime',
                    'speakerId',
                    'originalText',
                    'translatedText',
                  ],
                },
              },
            },
            required: ['detectedLanguage', 'speakers', 'segments'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return sendJson(res, 200, {
        success: true,
        ...parsed,
      });
    }

    // 3. Batch Translate Segments
    if (pathname === '/api/ai/translate' && method === 'POST') {
      const body = await readBody(req);
      const { segments, targetLanguage = 'Urdu', tone = 'conversational' } = body;

      const ai = getAIClient();
      if (!ai) {
        // Fallback translation
        const updated = (segments || []).map((seg: any) => ({
          ...seg,
          translatedText: `[${targetLanguage}]: ${seg.originalText}`,
        }));
        return sendJson(res, 200, { success: true, segments: updated });
      }

      const prompt = `Translate the following video subtitle segments into ${targetLanguage}.
Tone: ${tone}.
Ensure the translated text can be spoken naturally within each segment's duration (${targetLanguage} phrasing should match speech pacing).
Segments to translate:
${JSON.stringify(
  segments.map((s: any) => ({
    id: s.id,
    originalText: s.originalText,
    durationSeconds: (s.endTime - s.startTime).toFixed(1),
  })),
  null,
  2
)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                translatedText: { type: Type.STRING },
              },
              required: ['id', 'translatedText'],
            },
          },
        },
      });

      const translations: { id: string; translatedText: string }[] = JSON.parse(
        response.text || '[]'
      );
      const transMap = new Map(translations.map((t) => [t.id, t.translatedText]));

      const updatedSegments = segments.map((seg: any) => ({
        ...seg,
        translatedText: transMap.get(seg.id) || seg.translatedText || seg.originalText,
      }));

      return sendJson(res, 200, { success: true, segments: updatedSegments });
    }

    // 4. Text-to-Speech (TTS)
    if (pathname === '/api/ai/tts' && method === 'POST') {
      const body = await readBody(req);
      const {
        text,
        voice = 'Kore',
        style = 'Clear, natural conversational narrator',
      } = body;

      if (!text || !text.trim()) {
        return sendJson(res, 400, { error: 'Text is required for TTS' });
      }

      const ai = getAIClient();
      if (!ai) {
        return sendJson(res, 200, {
          success: false,
          fallback: true,
          message: 'No GEMINI_API_KEY configured. Browser speech synthesis will be used.',
        });
      }

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text,
                  speechMetadata: {
                    style,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
              },
            },
          },
        });

        const base64Audio =
          response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
          return sendJson(res, 200, {
            success: true,
            audioBase64: base64Audio,
            mimeType: 'audio/wav',
          });
        }

        return sendJson(res, 500, { error: 'Failed to generate audio stream' });
      } catch (ttsErr: any) {
        console.error('TTS generation error:', ttsErr);
        return sendJson(res, 200, {
          success: false,
          fallback: true,
          error: ttsErr.message || 'TTS generation unavailable',
        });
      }
    }

    // 5. Projects API (CRUD)
    if (pathname === '/api/projects' && method === 'GET') {
      return sendJson(res, 200, {
        success: true,
        projects: Object.values(savedProjects),
      });
    }

    if (pathname.startsWith('/api/projects/') && method === 'GET') {
      const id = pathname.replace('/api/projects/', '');
      const project = savedProjects[id];
      if (!project) {
        return sendJson(res, 404, { error: 'Project not found' });
      }
      return sendJson(res, 200, { success: true, project });
    }

    if (pathname === '/api/projects' && method === 'POST') {
      const project = await readBody(req);
      const id = project.id || 'proj_' + Math.random().toString(36).substring(2, 9);
      project.id = id;
      project.updatedAt = new Date().toISOString();
      if (!project.createdAt) project.createdAt = project.updatedAt;
      savedProjects[id] = project;
      return sendJson(res, 200, { success: true, project });
    }

    if (pathname.startsWith('/api/projects/') && method === 'DELETE') {
      const id = pathname.replace('/api/projects/', '');
      delete savedProjects[id];
      return sendJson(res, 200, { success: true });
    }

    // Fallback for unmatched API routes
    if (next) {
      return next();
    }
    return sendJson(res, 404, { error: 'API route not found' });
  } catch (error: any) {
    console.error('Server error handling API request:', error);
    return sendJson(res, 500, { error: error.message || 'Internal Server Error' });
  }
}
