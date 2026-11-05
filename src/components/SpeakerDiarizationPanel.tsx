import React, { useState } from 'react';
import { Users, Volume2, Plus, Sparkles, Loader2, Music2 } from 'lucide-react';
import { Project, Speaker } from '../types';
import { AVAILABLE_VOICES, SPEAKER_COLORS, UI_STRINGS } from '../constants';
import { generateSegmentAudio, speakNative } from '../utils/audioSynthesis';

interface SpeakerDiarizationPanelProps {
  project: Project;
  onUpdateProject: (updates: Partial<Project>) => void;
  uiLang: 'en' | 'ur';
}

export const SpeakerDiarizationPanel: React.FC<SpeakerDiarizationPanelProps> = ({
  project,
  onUpdateProject,
  uiLang,
}) => {
  const strings = UI_STRINGS[uiLang];
  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);

  const handleUpdateSpeaker = (speakerId: string, updates: Partial<Speaker>) => {
    const updated = project.speakers.map((spk) =>
      spk.id === speakerId ? { ...spk, ...updates } : spk
    );
    // Also update any segments if voice was changed
    let updatedSegments = project.segments;
    if (updates.voice) {
      updatedSegments = project.segments.map((seg) =>
        seg.speakerId === speakerId ? { ...seg, voice: updates.voice! } : seg
      );
    }
    onUpdateProject({ speakers: updated, segments: updatedSegments });
  };

  const handleAddSpeaker = () => {
    const newIdx = project.speakers.length + 1;
    const voice = AVAILABLE_VOICES[newIdx % AVAILABLE_VOICES.length].id;
    const color = SPEAKER_COLORS[newIdx % SPEAKER_COLORS.length];
    const newSpeaker: Speaker = {
      id: `spk_${Date.now()}`,
      name: `Speaker ${newIdx}`,
      voice,
      color,
      pitch: 1.0,
      speed: 1.0,
    };
    onUpdateProject({ speakers: [...project.speakers, newSpeaker] });
  };

  const handleTestVoice = async (speaker: Speaker) => {
    setTestingVoiceId(speaker.id);
    const samplePhrase =
      project.targetLanguage === 'Urdu'
        ? `ہیلو! میں ${speaker.name} ہوں۔ اے آئی ڈبنگ اسٹوڈیو میں آپ کا استقبال ہے۔`
        : `Hello! I am ${speaker.name}. This is my natural neural voice in the AI Dubbing Studio.`;

    try {
      const audioUri = await generateSegmentAudio(samplePhrase, speaker.voice);
      if (audioUri) {
        const audio = new Audio(audioUri);
        await audio.play();
      } else {
        speakNative(samplePhrase, project.targetLanguage === 'Urdu' ? 'ur-PK' : 'en-US');
      }
    } catch (err) {
      speakNative(samplePhrase, project.targetLanguage === 'Urdu' ? 'ur-PK' : 'en-US');
    } finally {
      setTestingVoiceId(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm text-white">{strings.speakers}</h3>
          <span className="text-[11px] bg-slate-800 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-slate-700">
            Diarization ({project.speakers.length})
          </span>
        </div>

        <button
          onClick={handleAddSpeaker}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Speaker</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {project.speakers.map((spk) => {
          const currentVoice =
            AVAILABLE_VOICES.find((v) => v.id === spk.voice) || AVAILABLE_VOICES[0];

          return (
            <div
              key={spk.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-3 hover:border-slate-700 transition"
            >
              {/* Speaker name & color tag */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: spk.color }}
                  />
                  <input
                    type="text"
                    value={spk.name}
                    onChange={(e) =>
                      handleUpdateSpeaker(spk.id, { name: e.target.value })
                    }
                    className="bg-slate-900/80 border border-slate-800 rounded px-2 py-0.5 text-xs font-bold text-white focus:outline-none focus:border-indigo-500 w-full"
                  />
                </div>

                {/* Test Voice Sample Button */}
                <button
                  onClick={() => handleTestVoice(spk)}
                  disabled={testingVoiceId === spk.id}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-semibold border border-indigo-500/30 transition shrink-0"
                  title="Test Voice Audio"
                >
                  {testingVoiceId === spk.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                  <span>Sample</span>
                </button>
              </div>

              {/* Voice model selection */}
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  AI Voice Persona
                </label>
                <select
                  value={spk.voice}
                  onChange={(e) =>
                    handleUpdateSpeaker(spk.id, { voice: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {AVAILABLE_VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.style})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1 italic truncate">
                  {currentVoice.style}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
