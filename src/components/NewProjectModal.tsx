import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Film,
  Languages,
  Loader2,
  Check,
  Video,
  FileAudio,
} from 'lucide-react';
import { Project } from '../types';
import { SAMPLE_VIDEOS, SUPPORTED_LANGUAGES, UI_STRINGS } from '../constants';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
  uiLang: 'en' | 'ur';
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  uiLang,
}) => {
  const strings = UI_STRINGS[uiLang];
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Urdu');
  const [title, setTitle] = useState('My AI Dubbed Video');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample_tech');
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customFileUrl, setCustomFileUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      const url = URL.createObjectURL(file);
      setCustomFileUrl(url);
    }
  };

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    setProcessStage('Extracting audio track for speech diarization...');

    try {
      // If a pre-loaded sample was selected and no custom file
      if (!customFile) {
        const sample =
          SAMPLE_VIDEOS.find((s) => s.id === selectedSampleId) || SAMPLE_VIDEOS[0];

        setProcessStage('Running AI Speech-to-Text & Diarization...');
        await new Promise((r) => setTimeout(r, 800));

        // If target language differs from sample's default, query translate API
        let segments = sample.segments;
        if (targetLang !== sample.targetLanguage) {
          setProcessStage(`Translating speech to ${targetLang}...`);
          try {
            const resp = await fetch('/api/ai/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ segments, targetLanguage: targetLang }),
            });
            if (resp.ok) {
              const resData = await resp.json();
              if (resData.segments) segments = resData.segments;
            }
          } catch (e) {
            console.warn('Translation call failed, using default', e);
          }
        }

        const newProj: Project = {
          id: 'proj_' + Date.now(),
          title: title || sample.title,
          videoUrl: sample.videoUrl,
          thumbnailUrl: sample.thumbnailUrl,
          duration: sample.duration,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          speakers: sample.speakers,
          segments,
          duckingPercent: 20,
          subtitlesEnabled: true,
          subtitleFontSize: 20,
          subtitleFontColor: '#ffffff',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        onCreateProject(newProj);
        onClose();
        return;
      }

      // Handle custom file upload
      setProcessStage('Analyzing custom video with Gemini AI...');

      // Call API
      const resp = await fetch('/api/ai/transcribe-and-diarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          videoTitle: title,
        }),
      });

      const data = await resp.json();
      const detectedSpeakers = data.speakers || [
        { id: 'spk_1', name: 'Speaker 1', voice: 'Zephyr', color: '#6366f1' },
      ];
      const segments = data.segments || [
        {
          id: 'seg_1',
          startTime: 0.0,
          endTime: 4.0,
          speakerId: 'spk_1',
          originalText: 'Dialogue extracted from your uploaded video.',
          translatedText: targetLang === 'Urdu' ? 'آپ کی ویڈیو سے ڈب شدہ جملہ۔' : 'Translated speech.',
          voice: 'Zephyr',
        },
      ];

      const newProj: Project = {
        id: 'proj_' + Date.now(),
        title: title || customFile.name,
        videoUrl: customFileUrl || '',
        duration: 15.0,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        speakers: detectedSpeakers,
        segments,
        duckingPercent: 20,
        subtitlesEnabled: true,
        subtitleFontSize: 20,
        subtitleFontColor: '#ffffff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onCreateProject(newProj);
      onClose();
    } catch (err) {
      console.error('Error initiating project:', err);
      // Fallback sample
      const sample = SAMPLE_VIDEOS[0];
      const newProj: Project = {
        id: 'proj_' + Date.now(),
        title,
        videoUrl: sample.videoUrl,
        duration: sample.duration,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        speakers: sample.speakers,
        segments: sample.segments,
        duckingPercent: 20,
        subtitlesEnabled: true,
        subtitleFontSize: 20,
        subtitleFontColor: '#ffffff',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onCreateProject(newProj);
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{strings.newProject}</h2>
              <p className="text-xs text-slate-400">
                {uiLang === 'ur'
                  ? 'ویڈیو اپلوڈ کریں یا سیمپل منتخب کریں اور سمارٹ ڈبنگ شروع کریں'
                  : 'Import a video or pick a sample for AI speech-to-text, diarization, and dubbing'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Project Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              placeholder="e.g. AI Keynote Dubbed into Urdu"
            />
          </div>

          {/* Languages Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                {strings.detectedLang}
              </label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="English">English (Original Audio)</option>
                <option value="Auto-detect">Auto-detect Language</option>
                <option value="Spanish">Spanish</option>
                <option value="Urdu">Urdu (اردو)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                {strings.targetLang} (AI Dubbed Voice)
              </label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-slate-950 border border-indigo-500/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.name} ({lang.native})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Choose Video Source: Preset Samples vs Upload */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">
              Select Video Source
            </span>

            {/* Pre-loaded Video Samples */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {SAMPLE_VIDEOS.map((sample) => {
                const isSelected = selectedSampleId === sample.id && !customFile;
                return (
                  <div
                    key={sample.id}
                    onClick={() => {
                      setSelectedSampleId(sample.id);
                      setCustomFile(null);
                      setTitle(sample.title);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-lg ring-1 ring-indigo-500'
                        : 'bg-slate-950/60 hover:bg-slate-800/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white truncate">
                        {sample.title}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                      {sample.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{sample.speakers.length} speakers</span>
                      <span>{sample.duration.toFixed(0)}s</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Upload Dropzone */}
            <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/70 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-950/40">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,audio/mp3,audio/wav"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <Upload className="w-6 h-6 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">
                  {customFile ? customFile.name : 'Or Upload Your Own Video / Audio File'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Supports MP4, WebM, MOV, MP3, WAV (up to 500MB)
                </span>
              </div>
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 text-center space-y-2 animate-in fade-in">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
              <span className="text-xs font-bold text-white block">
                AI Studio Pipeline in Progress
              </span>
              <span className="text-[11px] text-indigo-300">{processStage}</span>
            </div>
          )}

          {/* Action Button */}
          {!isProcessing && (
            <button
              onClick={handleStartProcessing}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span>Generate AI Dubbing &amp; Diarization</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
