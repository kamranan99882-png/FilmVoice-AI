import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Sliders,
  Type,
  Mic,
  Music,
} from 'lucide-react';
import { DialogueSegment, Project } from '../types';
import { UI_STRINGS } from '../constants';

interface VideoPlayerProps {
  project: Project;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  uiLang: 'en' | 'ur';
  onUpdateProject: (updates: Partial<Project>) => void;
  activeSegment: DialogueSegment | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  project,
  currentTime,
  onTimeUpdate,
  onDurationChange,
  videoRef,
  isPlaying,
  onTogglePlay,
  onSeek,
  uiLang,
  onUpdateProject,
  activeSegment,
}) => {
  const strings = UI_STRINGS[uiLang];
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showMixer, setShowMixer] = useState<boolean>(false);
  const [originalMuted, setOriginalMuted] = useState<boolean>(false);
  const [originalVolume, setOriginalVolume] = useState<number>(0.2); // Ducked by default
  const [dubVolume, setDubVolume] = useState<number>(1.0);

  const activeSpeaker = activeSegment
    ? project.speakers.find((s) => s.id === activeSegment.speakerId)
    : null;

  // Format seconds to mm:ss.ms
  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${ms}`;
  };

  const handleSpeedChange = () => {
    const rates = [0.75, 1, 1.25, 1.5];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col">
      {/* Video Screen & Overlays */}
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
        <video
          ref={videoRef}
          src={project.videoUrl}
          playsInline
          crossOrigin="anonymous"
          className="w-full h-full object-contain cursor-pointer"
          onClick={onTogglePlay}
          onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => onDurationChange(e.currentTarget.duration)}
        />

        {/* Active Speaker HUD Badge */}
        {activeSegment && activeSpeaker && (
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 shadow-lg animate-in fade-in">
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: activeSpeaker.color }}
            />
            <span className="text-xs font-semibold text-slate-200">
              {activeSpeaker.name}
            </span>
            <span className="text-[10px] uppercase font-bold text-indigo-300 px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30">
              {activeSegment.voice}
            </span>
          </div>
        )}

        {/* Burned / Synchronized Subtitle Overlay */}
        {project.subtitlesEnabled && activeSegment && (
          <div className="absolute bottom-14 left-4 right-4 z-20 pointer-events-none flex flex-col items-center justify-center text-center">
            <div
              className={`inline-block px-5 py-2.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 shadow-2xl max-w-[90%] transition-all ${
                project.targetLanguage === 'Urdu' || project.targetLanguage === 'Arabic'
                  ? 'font-["Noto_Nastaliq_Urdu",serif] leading-relaxed text-right'
                  : 'font-sans'
              }`}
            >
              <p
                className="font-bold text-white tracking-wide"
                style={{
                  fontSize: `${project.subtitleFontSize || 20}px`,
                  color: project.subtitleFontColor || '#ffffff',
                }}
              >
                {activeSegment.translatedText}
              </p>
              {activeSegment.originalText && (
                <p className="text-xs text-slate-400 mt-1 font-normal font-sans">
                  {activeSegment.originalText}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Big Center Play Icon when paused */}
        {!isPlaying && (
          <button
            onClick={onTogglePlay}
            className="absolute z-10 w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}
      </div>

      {/* Scrub Bar */}
      <div className="px-4 pt-2 bg-slate-900 border-t border-slate-800">
        <div className="relative group cursor-pointer flex items-center">
          <input
            type="range"
            min={0}
            max={project.duration || 100}
            step={0.01}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="px-4 py-3 bg-slate-900 flex items-center justify-between gap-3 text-slate-300">
        {/* Left: Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition"
            title={isPlaying ? strings.paused : strings.playing}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => onSeek(Math.max(0, currentTime - 5))}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Rewind 5s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSeek(Math.min(project.duration, currentTime + 5))}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Forward 5s"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="font-mono text-xs text-slate-300 ml-2 font-semibold">
            <span className="text-white">{formatTimecode(currentTime)}</span>
            <span className="text-slate-500 mx-1">/</span>
            <span className="text-slate-400">{formatTimecode(project.duration)}</span>
          </div>
        </div>

        {/* Right: Audio Ducking Mixer & Subtitles */}
        <div className="flex items-center gap-2">
          {/* Subtitle toggle */}
          <button
            onClick={() =>
              onUpdateProject({ subtitlesEnabled: !project.subtitlesEnabled })
            }
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
              project.subtitlesEnabled
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Subtitles"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{strings.subtitles}</span>
          </button>

          {/* Audio Ducking & Track Mixer Panel Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowMixer(!showMixer)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                showMixer
                  ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Dual-track Audio Mixer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mixer</span>
            </button>

            {/* Mixer Popover */}
            {showMixer && (
              <div className="absolute right-0 bottom-full mb-3 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    Audio Track Mixer
                  </span>
                  <span className="text-[10px] text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
                    Auto-Ducking
                  </span>
                </div>

                {/* Original Video Track Volume */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1">
                      <Music className="w-3 h-3 text-slate-400" />
                      {strings.originalVideo}
                    </span>
                    <span className="font-mono text-indigo-400">
                      {originalMuted ? 'Muted' : `${Math.round(originalVolume * 100)}%`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOriginalMuted(!originalMuted)}
                      className="p-1 hover:text-white"
                    >
                      {originalMuted ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={originalMuted ? 0 : originalVolume}
                      onChange={(e) => {
                        setOriginalVolume(parseFloat(e.target.value));
                        setOriginalMuted(false);
                        onUpdateProject({
                          duckingPercent: Math.round(parseFloat(e.target.value) * 100),
                        });
                      }}
                      className="w-full h-1 bg-slate-700 rounded accent-indigo-500"
                    />
                  </div>
                </div>

                {/* Dubbed AI Speech Track Volume */}
                <div className="space-y-1 mb-2">
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1">
                      <Mic className="w-3 h-3 text-pink-400" />
                      {strings.dubbedAudio}
                    </span>
                    <span className="font-mono text-pink-400">
                      {Math.round(dubVolume * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-pink-400" />
                    <input
                      type="range"
                      min={0.2}
                      max={1.5}
                      step={0.05}
                      value={dubVolume}
                      onChange={(e) => setDubVolume(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-700 rounded accent-pink-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <p>Original track volume is ducked automatically during speech dialogue.</p>
                </div>
              </div>
            )}
          </div>

          {/* Speed Selector */}
          <button
            onClick={handleSpeedChange}
            className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-mono font-semibold text-slate-300 transition"
            title="Playback Speed"
          >
            {playbackRate}x
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
