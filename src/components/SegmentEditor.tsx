import React, { useState } from 'react';
import {
  Volume2,
  Trash2,
  Scissors,
  Plus,
  Sparkles,
  Play,
  RotateCcw,
  Languages,
  Check,
  Loader2,
  User,
} from 'lucide-react';
import { DialogueSegment, Project } from '../types';
import { UI_STRINGS } from '../constants';
import { generateSegmentAudio, speakNative } from '../utils/audioSynthesis';

interface SegmentEditorProps {
  project: Project;
  currentTime: number;
  selectedSegmentId: string | null;
  onSelectSegment: (id: string) => void;
  onSeek: (time: number) => void;
  onUpdateProject: (updates: Partial<Project>) => void;
  uiLang: 'en' | 'ur';
}

export const SegmentEditor: React.FC<SegmentEditorProps> = ({
  project,
  currentTime,
  selectedSegmentId,
  onSelectSegment,
  onSeek,
  onUpdateProject,
  uiLang,
}) => {
  const strings = UI_STRINGS[uiLang];
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [filterSpeakerId, setFilterSpeakerId] = useState<string>('all');

  // Handle individual segment text change
  const handleSegmentChange = (id: string, updates: Partial<DialogueSegment>) => {
    const updated = project.segments.map((s) => (s.id === id ? { ...s, ...updates } : s));
    onUpdateProject({ segments: updated });
  };

  // Preview TTS voice for a segment
  const handlePreviewVoice = async (segment: DialogueSegment) => {
    setLoadingAudioId(segment.id);
    try {
      const textToSpeak = segment.translatedText || segment.originalText;
      const speaker = project.speakers.find((s) => s.id === segment.speakerId);
      const voice = speaker?.voice || segment.voice || 'Kore';

      // First try Gemini neural TTS
      const audioUri = await generateSegmentAudio(textToSpeak, voice);
      if (audioUri) {
        const audio = new Audio(audioUri);
        await audio.play();
      } else {
        // Fallback to native speech synthesis
        speakNative(textToSpeak, project.targetLanguage === 'Urdu' ? 'ur-PK' : 'en-US');
      }
    } catch (err) {
      console.warn('Playback error:', err);
      speakNative(
        segment.translatedText || segment.originalText,
        project.targetLanguage === 'Urdu' ? 'ur-PK' : 'en-US'
      );
    } finally {
      setLoadingAudioId(null);
    }
  };

  // Batch translate all segments
  const handleTranslateAll = async () => {
    setIsTranslatingAll(true);
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segments: project.segments,
          targetLanguage: project.targetLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.segments) {
          onUpdateProject({ segments: data.segments });
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslatingAll(false);
    }
  };

  // Split segment
  const handleSplitSegment = (segment: DialogueSegment) => {
    const midTime = (segment.startTime + segment.endTime) / 2;
    const words = segment.translatedText.split(' ');
    const half = Math.ceil(words.length / 2);
    const text1 = words.slice(0, half).join(' ');
    const text2 = words.slice(half).join(' ');

    const newSeg1: DialogueSegment = {
      ...segment,
      endTime: parseFloat(midTime.toFixed(2)),
      translatedText: text1,
      id: `${segment.id}_a`,
    };

    const newSeg2: DialogueSegment = {
      ...segment,
      id: `seg_${Date.now()}`,
      startTime: parseFloat(midTime.toFixed(2)),
      translatedText: text2,
    };

    const updated = project.segments.flatMap((s) => (s.id === segment.id ? [newSeg1, newSeg2] : [s]));
    onUpdateProject({ segments: updated });
  };

  // Delete segment
  const handleDeleteSegment = (id: string) => {
    const updated = project.segments.filter((s) => s.id !== id);
    onUpdateProject({ segments: updated });
  };

  // Add segment at current playhead
  const handleAddSegment = () => {
    const startTime = parseFloat(currentTime.toFixed(2));
    const endTime = parseFloat(Math.min(project.duration, startTime + 3.0).toFixed(2));
    const firstSpeaker = project.speakers[0];

    const newSegment: DialogueSegment = {
      id: `seg_${Date.now()}`,
      startTime,
      endTime,
      speakerId: firstSpeaker?.id || 'spk_1',
      originalText: 'New dialogue sentence.',
      translatedText: project.targetLanguage === 'Urdu' ? 'نیا جملہ یہاں شامل کریں۔' : 'New dialogue sentence.',
      voice: firstSpeaker?.voice || 'Zephyr',
    };

    const updated = [...project.segments, newSegment].sort((a, b) => a.startTime - b.startTime);
    onUpdateProject({ segments: updated });
    onSelectSegment(newSegment.id);
  };

  const filteredSegments = project.segments.filter((s) => {
    if (filterSpeakerId === 'all') return true;
    return s.speakerId === filterSpeakerId;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full shadow-xl overflow-hidden">
      {/* Header & Batch Actions */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-indigo-400" />
          <h2 className="font-bold text-base text-white">{strings.segments}</h2>
          <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
            {project.segments.length}
          </span>
        </div>

        {/* Filter and Actions */}
        <div className="flex items-center gap-2">
          {/* Speaker Filter */}
          <select
            value={filterSpeakerId}
            onChange={(e) => setFilterSpeakerId(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-300 px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Speakers</option>
            {project.speakers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* AI Translate All */}
          <button
            onClick={handleTranslateAll}
            disabled={isTranslatingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {isTranslatingAll ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            )}
            <span>{strings.translateAll}</span>
          </button>

          {/* Add Segment */}
          <button
            onClick={handleAddSegment}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{strings.addSegment}</span>
          </button>
        </div>
      </div>

      {/* Segments Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px] divide-y divide-slate-800/50">
        {filteredSegments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No dialogue segments found. Click &quot;Add Segment&quot; or import a video.
          </div>
        ) : (
          filteredSegments.map((segment, index) => {
            const speaker = project.speakers.find((s) => s.id === segment.speakerId);
            const isSelected = selectedSegmentId === segment.id;
            const isCurrentlyActive =
              currentTime >= segment.startTime && currentTime <= segment.endTime;
            const isUrdu =
              project.targetLanguage === 'Urdu' || project.targetLanguage === 'Arabic';

            return (
              <div
                key={segment.id}
                onClick={() => {
                  onSelectSegment(segment.id);
                  onSeek(segment.startTime);
                }}
                className={`pt-3 rounded-xl p-3.5 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : isCurrentlyActive
                    ? 'bg-indigo-950/20 border-indigo-500/40'
                    : 'bg-slate-950/40 hover:bg-slate-800/40 border-slate-800/80'
                }`}
              >
                {/* Segment Meta Bar: Index, Speaker Tag, Time Range, Playback Button */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 w-5">
                      #{index + 1}
                    </span>

                    {/* Speaker Selector */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: speaker?.color || '#6366f1' }}
                      />
                      <select
                        value={segment.speakerId}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          const chosenSpk = project.speakers.find((s) => s.id === e.target.value);
                          handleSegmentChange(segment.id, {
                            speakerId: e.target.value,
                            voice: chosenSpk?.voice || segment.voice,
                          });
                        }}
                        className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs font-semibold text-slate-200 focus:outline-none"
                      >
                        {project.speakers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.voice})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start and End Time Adjusters */}
                    <div
                      className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="number"
                        step={0.1}
                        value={segment.startTime}
                        onChange={(e) =>
                          handleSegmentChange(segment.id, {
                            startTime: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-12 bg-transparent text-slate-200 text-center focus:outline-none font-bold"
                      />
                      <span>→</span>
                      <input
                        type="number"
                        step={0.1}
                        value={segment.endTime}
                        onChange={(e) =>
                          handleSegmentChange(segment.id, {
                            endTime: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-12 bg-transparent text-slate-200 text-center focus:outline-none font-bold"
                      />
                      <span>s</span>
                    </div>
                  </div>

                  {/* Actions: Preview Audio, Split, Delete */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handlePreviewVoice(segment)}
                      disabled={loadingAudioId === segment.id}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold transition"
                      title={strings.listen}
                    >
                      {loadingAudioId === segment.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">{strings.listen}</span>
                    </button>

                    <button
                      onClick={() => handleSplitSegment(segment)}
                      className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition"
                      title={strings.splitSegment}
                    >
                      <Scissors className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteSegment(segment.id)}
                      className="p-1 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded transition"
                      title={strings.deleteSegment}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtitle Text Editors (Translated & Original) */}
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  {/* Translated Text (Main Dubbed Audio) */}
                  <div className="relative">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block mb-1">
                      {project.targetLanguage} (Dubbed Voice Text)
                    </span>
                    <textarea
                      rows={2}
                      value={segment.translatedText}
                      onChange={(e) =>
                        handleSegmentChange(segment.id, { translatedText: e.target.value })
                      }
                      dir={isUrdu ? 'rtl' : 'ltr'}
                      className={`w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                        isUrdu ? 'font-["Noto_Nastaliq_Urdu",serif] leading-loose text-base' : 'font-sans'
                      }`}
                      placeholder="Enter translated speech..."
                    />
                  </div>

                  {/* Original Transcript */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      Original Speech ({project.sourceLanguage})
                    </span>
                    <input
                      type="text"
                      value={segment.originalText}
                      onChange={(e) =>
                        handleSegmentChange(segment.id, { originalText: e.target.value })
                      }
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-700 font-sans"
                      placeholder="Original spoken phrase..."
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
