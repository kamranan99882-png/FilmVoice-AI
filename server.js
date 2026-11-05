// server.ts
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// server/api.ts
import { GoogleGenAI, Type } from "@google/genai";
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
var savedProjects = {
  "demo-urdu-dub": {
    id: "demo-urdu-dub",
    title: "AI Revolution in 2026 - Tech Interview",
    targetLanguage: "Urdu",
    sourceLanguage: "English",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    duration: 15,
    status: "completed",
    createdAt: new Date(Date.now() - 36e5 * 2).toISOString(),
    speakers: [
      { id: "spk_1", name: "Speaker 1 (Host)", voice: "Zephyr", color: "#6366f1" },
      { id: "spk_2", name: "Speaker 2 (Guest)", voice: "Kore", color: "#ec4899" }
    ],
    segments: [
      {
        id: "seg_1",
        startTime: 0,
        endTime: 3.5,
        speakerId: "spk_1",
        originalText: "Welcome everyone! Today we will see how video dubbing changes everything.",
        translatedText: "\u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F \u0633\u0628 \u06A9\u0648! \u0622\u062C \u06C1\u0645 \u062F\u06CC\u06A9\u06BE\u06CC\u06BA \u06AF\u06D2 \u06A9\u06C1 \u0648\u06CC\u0688\u06CC\u0648 \u0688\u0628\u0646\u06AF \u06A9\u06CC\u0633\u06D2 \u0633\u0628 \u06A9\u0686\u06BE \u0628\u062F\u0644 \u0631\u06C1\u06CC \u06C1\u06D2\u06D4",
        voice: "Zephyr"
      },
      {
        id: "seg_2",
        startTime: 3.8,
        endTime: 7.6,
        speakerId: "spk_2",
        originalText: "The neural translation accurately catches our nuance, humor, and tone.",
        translatedText: "\u06CC\u06C1 \u0646\u06CC\u0648\u0631\u0644 \u062A\u0631\u062C\u0645\u06C1 \u06C1\u0645\u0627\u0631\u06D2 \u062C\u0630\u0628\u0627\u062A\u060C \u0644\u06C1\u062C\u06D2 \u0627\u0648\u0631 \u0628\u0627\u0631\u06CC\u06A9\u06CC\u0648\u06BA \u06A9\u0648 \u0628\u0627\u0644\u06A9\u0644 \u062F\u0631\u0633\u062A \u0637\u0631\u06CC\u0642\u06D2 \u0633\u06D2 \u0633\u0645\u062C\u06BE\u062A\u0627 \u06C1\u06D2\u06D4",
        voice: "Kore"
      },
      {
        id: "seg_3",
        startTime: 8,
        endTime: 11.8,
        speakerId: "spk_1",
        originalText: "And with multi-speaker detection, each person receives their distinct voice.",
        translatedText: "\u0627\u0648\u0631 \u0645\u0644\u0679\u06CC \u0627\u0633\u067E\u06CC\u06A9\u0631 \u0688\u0679\u06CC\u06A9\u0634\u0646 \u06A9\u06D2 \u0630\u0631\u06CC\u0639\u06D2\u060C \u06C1\u0631 \u0627\u0646\u0633\u0627\u0646 \u06A9\u0648 \u0627\u067E\u0646\u06CC \u0645\u062E\u0635\u0648\u0635 \u0622\u0648\u0627\u0632 \u0645\u0644\u062A\u06CC \u06C1\u06D2\u06D4",
        voice: "Zephyr"
      },
      {
        id: "seg_4",
        startTime: 12,
        endTime: 14.8,
        speakerId: "spk_2",
        originalText: "Ready to publish and share directly on WhatsApp and Facebook!",
        translatedText: "\u0627\u0628 \u0648\u0627\u0679\u0633 \u0627\u06CC\u067E \u0627\u0648\u0631 \u0641\u06CC\u0633 \u0628\u06A9 \u067E\u0631 \u0628\u0631\u0627\u06C1 \u0631\u0627\u0633\u062A \u0634\u0627\u0626\u0639 \u0627\u0648\u0631 \u0634\u06CC\u0626\u0631 \u06A9\u0631\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u062A\u06CC\u0627\u0631 \u06C1\u06D2!",
        voice: "Kore"
      }
    ],
    duckingPercent: 20,
    subtitlesEnabled: true
  }
};
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
  });
  res.end(JSON.stringify(data));
}
async function handleApiRequest(req, res, next) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;
  const method = req.method?.toUpperCase();
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });
    return res.end();
  }
  try {
    if (pathname === "/api/health" && method === "GET") {
      const hasKey = Boolean(process.env.GEMINI_API_KEY);
      return sendJson(res, 200, {
        status: "ok",
        hasGeminiKey: hasKey,
        supportedLanguages: [
          { code: "ur", name: "Urdu (\u0627\u0631\u062F\u0648)", native: "\u0627\u0631\u062F\u0648" },
          { code: "hi", name: "Hindi (\u0939\u093F\u0902\u0926\u0940)", native: "\u0939\u093F\u0902\u0926\u0940" },
          { code: "en", name: "English (US)", native: "English" },
          { code: "ar", name: "Arabic (\u0627\u0644\u0639\u0631\u0628\u064A\u0629)", native: "\u0627\u0644\u0639\u0631\u0628\u064A\u0629" },
          { code: "es", name: "Spanish (Espa\xF1ol)", native: "Espa\xF1ol" },
          { code: "fr", name: "French (Fran\xE7ais)", native: "Fran\xE7ais" },
          { code: "de", name: "German (Deutsch)", native: "Deutsch" },
          { code: "tr", name: "Turkish (T\xFCrk\xE7e)", native: "T\xFCrk\xE7e" },
          { code: "zh", name: "Chinese (Mandarin)", native: "\u4E2D\u6587" },
          { code: "ja", name: "Japanese (\u65E5\u672C\u8A9E)", native: "\u65E5\u672C\u8A9E" },
          { code: "pt", name: "Portuguese (Portugu\xEAs)", native: "Portugu\xEAs" }
        ],
        availableVoices: [
          { id: "Kore", name: "Kore (Warm Female)", gender: "female", style: "Natural, articulate" },
          { id: "Zephyr", name: "Zephyr (Deep Male)", gender: "male", style: "Confident, clear" },
          { id: "Puck", name: "Puck (Lively Youth)", gender: "neutral", style: "High energy, vibrant" },
          { id: "Fenrir", name: "Fenrir (Authoritative)", gender: "male", style: "Documentary, dramatic" },
          { id: "Charon", name: "Charon (Calm & Rich)", gender: "male", style: "Professional narrator" }
        ]
      });
    }
    if (pathname === "/api/ai/transcribe-and-diarize" && method === "POST") {
      const body = await readBody(req);
      const {
        audioBase64,
        mimeType = "audio/mp3",
        sourceLanguage = "Auto-detect",
        targetLanguage = "Urdu",
        videoTitle = "Uploaded Clip",
        context = ""
      } = body;
      const ai = getAIClient();
      if (!ai) {
        return sendJson(res, 200, {
          success: true,
          notice: "Demo mode active (Configure GEMINI_API_KEY in Secrets for live AI model).",
          detectedLanguage: sourceLanguage === "Auto-detect" ? "English" : sourceLanguage,
          speakers: [
            { id: "spk_1", name: "Speaker 1 (Main)", voice: "Zephyr", color: "#6366f1" },
            { id: "spk_2", name: "Speaker 2 (Co-speaker)", voice: "Kore", color: "#ec4899" }
          ],
          segments: [
            {
              id: "seg_" + Date.now() + "_1",
              startTime: 0,
              endTime: 4.2,
              speakerId: "spk_1",
              originalText: "Hello and welcome! In this video, we are demonstrating our high-speed dubbing pipeline.",
              translatedText: targetLanguage === "Urdu" ? "\u06C1\u06CC\u0644\u0648 \u0627\u0648\u0631 \u062E\u0648\u0634 \u0622\u0645\u062F\u06CC\u062F! \u0627\u0633 \u0648\u06CC\u0688\u06CC\u0648 \u0645\u06CC\u06BA\u060C \u06C1\u0645 \u0627\u067E\u0646\u06CC \u062A\u06CC\u0632 \u0631\u0641\u062A\u0627\u0631 \u0688\u0628\u0646\u06AF \u067E\u0627\u0626\u067E \u0644\u0627\u0626\u0646 \u06A9\u0627 \u0645\u0638\u0627\u06C1\u0631\u06C1 \u06A9\u0631 \u0631\u06C1\u06D2 \u06C1\u06CC\u06BA\u06D4" : "Welcome to this high-speed video dubbing showcase.",
              voice: "Zephyr"
            },
            {
              id: "seg_" + Date.now() + "_2",
              startTime: 4.5,
              endTime: 8.9,
              speakerId: "spk_2",
              originalText: "Notice how each speaker gets recognized with custom pitch, tone, and localized subtitles.",
              translatedText: targetLanguage === "Urdu" ? "\u062F\u06CC\u06A9\u06BE\u06CC\u06BA \u06A9\u06C1 \u06A9\u0633 \u0637\u0631\u062D \u06C1\u0631 \u0627\u0633\u067E\u06CC\u06A9\u0631 \u06A9\u0648 \u0645\u062E\u0635\u0648\u0635 \u0622\u0648\u0627\u0632\u060C \u0644\u06C1\u062C\u06D2 \u0627\u0648\u0631 \u0645\u0642\u0627\u0645\u06CC \u0633\u0628 \u0679\u0627\u0626\u0679\u0644\u0632 \u06A9\u06D2 \u0633\u0627\u062A\u06BE \u067E\u06C1\u0686\u0627\u0646\u0627 \u062C\u0627\u062A\u0627 \u06C1\u06D2\u06D4" : "Notice how speakers are cleanly separated with distinct neural voices.",
              voice: "Kore"
            },
            {
              id: "seg_" + Date.now() + "_3",
              startTime: 9.2,
              endTime: 13.5,
              speakerId: "spk_1",
              originalText: "You can edit every single timestamp and export the dubbed video or share on WhatsApp.",
              translatedText: targetLanguage === "Urdu" ? "\u0622\u067E \u06C1\u0631 \u0679\u0627\u0626\u0645 \u0627\u0633\u0679\u06CC\u0645\u067E \u0645\u06CC\u06BA \u062A\u0631\u0645\u06CC\u0645 \u06A9\u0631 \u0633\u06A9\u062A\u06D2 \u06C1\u06CC\u06BA \u0627\u0648\u0631 \u0688\u0628 \u0634\u062F\u06C1 \u0648\u06CC\u0688\u06CC\u0648 \u0627\u06CC\u06A9\u0633\u067E\u0648\u0631\u0679 \u06CC\u0627 \u0648\u0627\u0679\u0633 \u0627\u06CC\u067E \u067E\u0631 \u0634\u06CC\u0626\u0631 \u06A9\u0631 \u0633\u06A9\u062A\u06D2 \u06C1\u06CC\u06BA\u06D4" : "You can adjust timestamps, preview the mix, and share on social media.",
              voice: "Zephyr"
            }
          ]
        });
      }
      const prompt = `Analyze this video/audio recording.
1. Transcribe the speech accurately with high precision timestamps (startTime and endTime in seconds with 1 decimal).
2. Perform Speaker Diarization: detect distinct speakers (Speaker 1, Speaker 2, etc.) and assign them speakerId ('spk_1', 'spk_2', etc.).
3. Translate each segment naturally into ${targetLanguage}. Keep the timing natural so the translated text duration fits approximately within the segment timestamp window.
4. Recommend an appropriate voice for each speaker from: ['Kore', 'Zephyr', 'Puck', 'Fenrir', 'Charon'].

${context ? `Video context: ${context}` : ""}
${videoTitle ? `Video title: ${videoTitle}` : ""}`;
      const contents = [];
      if (audioBase64) {
        contents.push({
          inlineData: {
            mimeType: mimeType || "audio/mp3",
            data: audioBase64.replace(/^data:[^;]+;base64,/, "")
          }
        });
      }
      contents.push({ text: prompt });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction: "You are an expert multilingual video localization, speech-to-text, and speaker diarization engine. Return exact JSON matching the schema.",
          responseMimeType: "application/json",
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
                    voice: { type: Type.STRING }
                  },
                  required: ["id", "name", "voice"]
                }
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
                    voice: { type: Type.STRING }
                  },
                  required: [
                    "id",
                    "startTime",
                    "endTime",
                    "speakerId",
                    "originalText",
                    "translatedText"
                  ]
                }
              }
            },
            required: ["detectedLanguage", "speakers", "segments"]
          }
        }
      });
      const parsed = JSON.parse(response.text || "{}");
      return sendJson(res, 200, {
        success: true,
        ...parsed
      });
    }
    if (pathname === "/api/ai/translate" && method === "POST") {
      const body = await readBody(req);
      const { segments, targetLanguage = "Urdu", tone = "conversational" } = body;
      const ai = getAIClient();
      if (!ai) {
        const updated = (segments || []).map((seg) => ({
          ...seg,
          translatedText: `[${targetLanguage}]: ${seg.originalText}`
        }));
        return sendJson(res, 200, { success: true, segments: updated });
      }
      const prompt = `Translate the following video subtitle segments into ${targetLanguage}.
Tone: ${tone}.
Ensure the translated text can be spoken naturally within each segment's duration (${targetLanguage} phrasing should match speech pacing).
Segments to translate:
${JSON.stringify(
        segments.map((s) => ({
          id: s.id,
          originalText: s.originalText,
          durationSeconds: (s.endTime - s.startTime).toFixed(1)
        })),
        null,
        2
      )}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                translatedText: { type: Type.STRING }
              },
              required: ["id", "translatedText"]
            }
          }
        }
      });
      const translations = JSON.parse(
        response.text || "[]"
      );
      const transMap = new Map(translations.map((t) => [t.id, t.translatedText]));
      const updatedSegments = segments.map((seg) => ({
        ...seg,
        translatedText: transMap.get(seg.id) || seg.translatedText || seg.originalText
      }));
      return sendJson(res, 200, { success: true, segments: updatedSegments });
    }
    if (pathname === "/api/ai/tts" && method === "POST") {
      const body = await readBody(req);
      const {
        text,
        voice = "Kore",
        style = "Clear, natural conversational narrator"
      } = body;
      if (!text || !text.trim()) {
        return sendJson(res, 400, { error: "Text is required for TTS" });
      }
      const ai = getAIClient();
      if (!ai) {
        return sendJson(res, 200, {
          success: false,
          fallback: true,
          message: "No GEMINI_API_KEY configured. Browser speech synthesis will be used."
        });
      }
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash-lite-tts",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text,
                  speechMetadata: {
                    style
                  }
                }
              ]
            }
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice || "Kore" }
              }
            }
          }
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return sendJson(res, 200, {
            success: true,
            audioBase64: base64Audio,
            mimeType: "audio/wav"
          });
        }
        return sendJson(res, 500, { error: "Failed to generate audio stream" });
      } catch (ttsErr) {
        console.error("TTS generation error:", ttsErr);
        return sendJson(res, 200, {
          success: false,
          fallback: true,
          error: ttsErr.message || "TTS generation unavailable"
        });
      }
    }
    if (pathname === "/api/projects" && method === "GET") {
      return sendJson(res, 200, {
        success: true,
        projects: Object.values(savedProjects)
      });
    }
    if (pathname.startsWith("/api/projects/") && method === "GET") {
      const id = pathname.replace("/api/projects/", "");
      const project = savedProjects[id];
      if (!project) {
        return sendJson(res, 404, { error: "Project not found" });
      }
      return sendJson(res, 200, { success: true, project });
    }
    if (pathname === "/api/projects" && method === "POST") {
      const project = await readBody(req);
      const id = project.id || "proj_" + Math.random().toString(36).substring(2, 9);
      project.id = id;
      project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (!project.createdAt) project.createdAt = project.updatedAt;
      savedProjects[id] = project;
      return sendJson(res, 200, { success: true, project });
    }
    if (pathname.startsWith("/api/projects/") && method === "DELETE") {
      const id = pathname.replace("/api/projects/", "");
      delete savedProjects[id];
      return sendJson(res, 200, { success: true });
    }
    if (next) {
      return next();
    }
    return sendJson(res, 404, { error: "API route not found" });
  } catch (error) {
    console.error("Server error handling API request:", error);
    return sendJson(res, 500, { error: error.message || "Internal Server Error" });
  }
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
var HOST = "0.0.0.0";
app.use("/api", (req, res, next) => {
  handleApiRequest(req, res, next);
});
var distPath = path.resolve(__dirname, "dist");
app.use(express.static(distPath));
app.get("/healthz", (_req, res) => {
  res.status(200).send("OK");
});
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(PORT, HOST, () => {
  console.log(`Production server listening on ${HOST}:${PORT}`);
});
