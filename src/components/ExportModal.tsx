import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  Film,
  Music,
  FileText,
  FileCode,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Project } from '../types';
import { UI_STRINGS } from '../constants';
import {
  generateSrt,
  generateVtt,
  generateScriptText,
  triggerDownload,
} from '../utils/subtitleGenerator';
import { renderDubbedVideo, RenderProgress } from '../utils/videoExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  uiLang: 'en' | 'ur';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
  videoRef,
  uiLang,
}) => {
  const strings = UI_STRINGS[uiLang];
  const [activeTab, setActiveTab] = useState<'video' | 'audio' | 'subtitles' | 'script'>('video');
  const [renderProgress, setRenderProgress] = useState<RenderProgress | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartVideoRender = async () => {
    if (!videoRef.current) return;
    setIsRendering(true);
    setDownloadUrl(null);

    try {
      const url = await renderDubbedVideo(project, videoRef.current, (p) => {
        setRenderProgress(p);
      });
      setDownloadUrl(url);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Video render failed:', err);
    } finally {
      setIsRendering(false);
    }
  };

  const handleDownloadSrt = (mode: 'translated' | 'original' | 'bilingual') => {
    const srt = generateSrt(project.segments, mode);
    triggerDownload(
      srt,
      `${project.title.replace(/\s+/g, '_')}_${project.targetLanguage}_${mode}.srt`,
      'application/x-subrip'
    );
  };

  const handleDownloadVtt = () => {
    const vtt = generateVtt(project.segments, 'translated');
    triggerDownload(
      vtt,
      `${project.title.replace(/\s+/g, '_')}_${project.targetLanguage}.vtt`,
      'text/vtt'
    );
  };

  const handleDownloadScript = () => {
    const txt = generateScriptText(project);
    triggerDownload(
      txt,
      `${project.title.replace(/\s+/g, '_')}_dubbing_script.txt`,
      'text/plain'
    );
  };

  const handleDownloadJson = () => {
    const data = JSON.stringify(project, null, 2);
    triggerDownload(
      data,
      `${project.title.replace(/\s+/g, '_')}_project_data.json`,
      'application/json'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{strings.export}</h2>
              <p className="text-xs text-slate-400">
                {uiLang === 'ur'
                  ? 'ویڈیو، ڈب شدہ آڈیو ٹریک، یا سب ٹائٹلز ڈاؤن لوڈ کریں'
                  : 'Render and download dubbed video, audio tracks, or subtitle files'}
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

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'video'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Dubbed Video</span>
          </button>

          <button
            onClick={() => setActiveTab('subtitles')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'subtitles'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Subtitles (.SRT/.VTT)</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`flex items-center gap-2 px-3 py-2 border-b-2 text-xs font-bold transition ${
              activeTab === 'script'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Dubbing Script</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="font-semibold text-white">Rendering Engine:</span>
                  <span className="text-emerald-400 font-mono">FFmpeg &amp; Canvas WebAudio</span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Burn-in Subtitles:</span>
                  <span className="font-bold text-white">
                    {project.subtitlesEnabled ? 'Enabled (Urdu Nastaliq)' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Audio Mix:</span>
                  <span className="text-indigo-400 font-bold">
                    {project.targetLanguage} Neural Dub + {project.duckingPercent}% Ducked Background
                  </span>
                </div>
              </div>

              {/* Progress Box */}
              {isRendering && renderProgress && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/40 space-y-2 animate-in fade-in">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-indigo-300 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {renderProgress.stage}
                    </span>
                    <span className="font-mono text-white">{renderProgress.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full transition-all duration-300"
                      style={{ width: `${renderProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {downloadUrl && (
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="font-bold text-white text-xs block">
                        Dubbed Video Ready!
                      </span>
                      <span className="text-[11px] text-emerald-300">
                        Rendered with audio &amp; subtitles
                      </span>
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    download={`${project.title.replace(/\s+/g, '_')}_dubbed.webm`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition transform active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </a>
                </div>
              )}

              {!downloadUrl && !isRendering && (
                <button
                  onClick={handleStartVideoRender}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Start Video Render &amp; Export</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'subtitles' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Download subtitle files formatted with millisecond timestamps for YouTube, VLC, or video editors.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleDownloadSrt('translated')}
                  className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition"
                >
                  <span className="font-bold text-xs text-white block">
                    Download .SRT (Translated)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Standard {project.targetLanguage} subtitles
                  </span>
                </button>

                <button
                  onClick={() => handleDownloadSrt('bilingual')}
                  className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition"
                >
                  <span className="font-bold text-xs text-white block">
                    Download .SRT (Bilingual)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Both original and translated text
                  </span>
                </button>

                <button
                  onClick={handleDownloadVtt}
                  className="p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition"
                >
                  <span className="font-bold text-xs text-white block">
                    Download WebVTT (.vtt)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Web-ready HTML5 video subtitles
                  </span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Download the complete bilingual transcript with speaker assignments and timestamps.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleDownloadScript}
                  className="flex-1 p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
                >
                  <span className="font-bold text-xs text-white block">
                    Download Script (.TXT)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Clean formatted text screenplay
                  </span>
                </button>

                <button
                  onClick={handleDownloadJson}
                  className="flex-1 p-3 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 rounded-xl text-left transition"
                >
                  <span className="font-bold text-xs text-white block">
                    Download Project (.JSON)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Full project data and timestamps
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
