import React, { useRef } from 'react';
import { DialogueSegment, Project } from '../types';
import { Clock, ZoomIn, ZoomOut } from 'lucide-react';

interface TimelineWaveformProps {
  project: Project;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
  uiLang: 'en' | 'ur';
}

export const TimelineWaveform: React.FC<TimelineWaveformProps> = ({
  project,
  currentTime,
  onSeek,
  selectedSegmentId,
  onSelectSegment,
  uiLang,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const duration = project.duration || 15;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(progress * duration);
  };

  // Generate tick marks for time ruler
  const numTicks = Math.min(16, Math.max(6, Math.floor(duration)));
  const ticks = Array.from({ length: numTicks + 1 }, (_, i) => {
    const time = (i / numTicks) * duration;
    return {
      time,
      label: `${time.toFixed(0)}s`,
      percent: (time / duration) * 100,
    };
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl select-none">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-sm text-slate-200">
            {uiLang === 'ur' ? 'ٹائم لائن اور آڈیو ویو' : 'Timeline & Waveform Tracks'}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({duration.toFixed(1)}s total)
          </span>
        </div>

        {/* Speaker Color Legends */}
        <div className="flex items-center gap-3">
          {project.speakers.map((spk) => (
            <div key={spk.id} className="flex items-center gap-1.5 text-xs text-slate-300">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: spk.color }}
              />
              <span className="truncate max-w-[100px]">{spk.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time Ruler */}
      <div className="relative h-5 mb-1 text-[10px] font-mono text-slate-500">
        {ticks.map((t, idx) => (
          <div
            key={idx}
            className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${t.percent}%` }}
          >
            <span>{t.label}</span>
            <div className="w-[1px] h-1.5 bg-slate-700 mt-0.5" />
          </div>
        ))}
      </div>

      {/* Main Timeline Waveform Track Container */}
      <div
        ref={containerRef}
        onClick={handleTimelineClick}
        className="relative h-20 bg-slate-950/80 rounded-xl border border-slate-800 cursor-pointer overflow-hidden group"
      >
        {/* Background Waveform bars grid pattern */}
        <div className="absolute inset-0 flex items-center justify-around opacity-20 pointer-events-none px-2">
          {Array.from({ length: 60 }).map((_, i) => {
            const h = 20 + Math.sin(i * 0.4) * 15 + ((i * 13) % 25);
            return (
              <div
                key={i}
                className="w-1 bg-slate-500 rounded-full"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>

        {/* Segment Blocks */}
        {project.segments.map((seg) => {
          const speaker = project.speakers.find((s) => s.id === seg.speakerId);
          const leftPercent = (seg.startTime / duration) * 100;
          const widthPercent = Math.max(2, ((seg.endTime - seg.startTime) / duration) * 100);
          const isSelected = selectedSegmentId === seg.id;
          const isCurrentlyActive =
            currentTime >= seg.startTime && currentTime <= seg.endTime;

          return (
            <div
              key={seg.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSegment(seg.id);
                onSeek(seg.startTime);
              }}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                borderColor: isSelected ? '#ffffff' : speaker?.color || '#6366f1',
                backgroundColor: isCurrentlyActive
                  ? `${speaker?.color || '#6366f1'}40`
                  : `${speaker?.color || '#6366f1'}20`,
              }}
              className={`absolute top-2 bottom-2 rounded-lg border-2 p-1.5 flex flex-col justify-between overflow-hidden transition-all hover:scale-[1.01] hover:brightness-125 z-10 ${
                isSelected ? 'ring-2 ring-white shadow-lg' : ''
              }`}
              title={`${speaker?.name}: "${seg.translatedText || seg.originalText}" (${seg.startTime.toFixed(1)}s - ${seg.endTime.toFixed(1)}s)`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span
                  className="truncate px-1 rounded text-white"
                  style={{ backgroundColor: speaker?.color || '#6366f1' }}
                >
                  {speaker?.name?.split(' ')[0]}
                </span>
                <span className="font-mono text-slate-300 text-[9px]">
                  {(seg.endTime - seg.startTime).toFixed(1)}s
                </span>
              </div>

              <div className="truncate text-[11px] font-medium text-slate-200">
                {seg.translatedText || seg.originalText}
              </div>
            </div>
          );
        })}

        {/* Live Playhead Needle */}
        <div
          className="absolute top-0 bottom-0 z-30 pointer-events-none transition-none flex flex-col items-center"
          style={{ left: `${(currentTime / duration) * 100}%` }}
        >
          <div className="w-3 h-3 bg-rose-500 rotate-45 -translate-y-1 shadow-md shadow-rose-500/50" />
          <div className="w-[2px] h-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
        </div>
      </div>
    </div>
  );
};
