/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header';
import { VideoPlayer } from './components/VideoPlayer';
import { TimelineWaveform } from './components/TimelineWaveform';
import { SegmentEditor } from './components/SegmentEditor';
import { SpeakerDiarizationPanel } from './components/SpeakerDiarizationPanel';
import { PublishShareModal } from './components/PublishShareModal';
import { ExportModal } from './components/ExportModal';
import { AuthModal } from './components/AuthModal';
import { NewProjectModal } from './components/NewProjectModal';
import { Project, UserProfile, DialogueSegment } from './types';
import { SAMPLE_VIDEOS, PUBLIC_LIVE_URL } from './constants';
import { Smartphone, Monitor, Tablet, Share2, Copy, Check } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    return SAMPLE_VIDEOS.map((s) => ({
      ...s,
      duckingPercent: 20,
      subtitlesEnabled: true,
      subtitleFontSize: 20,
      subtitleFontColor: '#ffffff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  });

  const [currentProject, setCurrentProject] = useState<Project>(projects[0]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [uiLang, setUiLang] = useState<'en' | 'ur'>('ur'); // Default to Urdu for bilingual audience
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedBanner, setCopiedBanner] = useState<boolean>(false);

  // Modals state
  const [isPublishShareOpen, setIsPublishShareOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState<boolean>(false);

  // User state
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_kamran',
    name: 'Kamran Ali',
    email: 'kamranan99882@gmail.com',
    avatar: '',
    isGuest: false,
    storageUsedMB: 240,
    storageLimitMB: 5000,
    joinedDate: '2026-11-05',
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Active dialogue segment based on currentTime
  const activeSegment: DialogueSegment | null =
    currentProject.segments.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime
    ) || null;

  // Toggle video play / pause
  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    }
  };

  // Seek video
  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // Update current project
  const handleUpdateProject = (updates: Partial<Project>) => {
    setCurrentProject((prev) => {
      const updated = { ...prev, ...updates, updatedAt: new Date().toISOString() };
      setProjects((all) => all.map((p) => (p.id === updated.id ? updated : p)));
      return updated;
    });
  };

  // Create new project
  const handleCreateProject = (newProj: Project) => {
    setProjects((all) => [newProj, ...all]);
    setCurrentProject(newProj);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentProject={currentProject}
        projects={projects}
        onSelectProject={(p) => {
          setCurrentProject(p);
          setCurrentTime(0);
          setIsPlaying(false);
        }}
        onOpenNewProject={() => setIsNewProjectOpen(true)}
        onOpenPublishShare={() => setIsPublishShareOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        uiLang={uiLang}
        setUiLang={setUiLang}
        user={user}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
      />

      {/* Main Studio Workspace container with responsive device testing frame */}
      <main className="flex-1 p-3 sm:p-5 lg:p-6 flex flex-col items-center justify-start">
        <div
          className={`w-full transition-all duration-300 ${
            previewMode === 'mobile'
              ? 'max-w-[420px] border-4 border-slate-700 rounded-[40px] p-4 shadow-2xl bg-slate-900 my-4'
              : previewMode === 'tablet'
              ? 'max-w-[820px] border-4 border-slate-700 rounded-[32px] p-5 shadow-2xl bg-slate-900 my-4'
              : 'max-w-7xl'
          }`}
        >
          {/* Live Public URL Announcement Bar (Requirement 13) */}
          <div className="mb-4 bg-gradient-to-r from-indigo-950/70 via-slate-900 to-emerald-950/40 border border-indigo-500/30 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {uiLang === 'ur' ? 'ویب سائٹ لائیو پبلش ہو چکی ہے' : 'Website Live & Publicly Hosted'}
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Online 24/7
                  </span>
                </div>
                <div className="text-xs font-mono text-indigo-300 truncate max-w-xs sm:max-w-md md:max-w-xl">
                  {PUBLIC_LIVE_URL}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(PUBLIC_LIVE_URL);
                  setCopiedBanner(true);
                  setTimeout(() => setCopiedBanner(false), 2500);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                {copiedBanner ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>
                  {copiedBanner
                    ? uiLang === 'ur'
                      ? 'کاپی ہو گیا!'
                      : 'Copied!'
                    : uiLang === 'ur'
                    ? 'لنک کاپی کریں'
                    : 'Copy Public URL'}
                </span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `Check out my live AI Video Dubbing Studio: ${PUBLIC_LIVE_URL}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition"
              >
                WhatsApp
              </a>

              <button
                onClick={() => setIsPublishShareOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-md transition"
              >
                {uiLang === 'ur' ? 'موبائل کیو آر کوڈ' : 'Mobile QR Code'}
              </button>
            </div>
          </div>

          {/* Device Mockup Header bar when in mobile or tablet mode */}
          {previewMode !== 'desktop' && (
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                {previewMode === 'mobile' ? (
                  <Smartphone className="w-4 h-4 text-pink-400" />
                ) : (
                  <Tablet className="w-4 h-4 text-indigo-400" />
                )}
                <span>
                  {previewMode === 'mobile' ? 'Mobile Phone Simulator (390x844)' : 'Tablet Simulator (820x1180)'}
                </span>
              </div>
              <button
                onClick={() => setPreviewMode('desktop')}
                className="hover:text-white underline text-[11px]"
              >
                Exit Simulator
              </button>
            </div>
          )}

          {/* Studio Grid: Left Media & Timeline / Right Dialogue & Translation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column (Video, Waveform & Speakers) */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* Video Player */}
              <VideoPlayer
                project={currentProject}
                currentTime={currentTime}
                onTimeUpdate={(t) => setCurrentTime(t)}
                onDurationChange={(d) => {
                  if (d && !isNaN(d)) handleUpdateProject({ duration: d });
                }}
                videoRef={videoRef}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
                onSeek={handleSeek}
                uiLang={uiLang}
                onUpdateProject={handleUpdateProject}
                activeSegment={activeSegment}
              />

              {/* Timeline & Waveform */}
              <TimelineWaveform
                project={currentProject}
                currentTime={currentTime}
                onSeek={handleSeek}
                selectedSegmentId={selectedSegmentId}
                onSelectSegment={setSelectedSegmentId}
                uiLang={uiLang}
              />

              {/* Speaker Diarization & Voice Selector Panel */}
              <SpeakerDiarizationPanel
                project={currentProject}
                onUpdateProject={handleUpdateProject}
                uiLang={uiLang}
              />
            </div>

            {/* Right Column (Dialogue Segments & Neural Translation) */}
            <div className="lg:col-span-5 flex flex-col">
              <SegmentEditor
                project={currentProject}
                currentTime={currentTime}
                selectedSegmentId={selectedSegmentId}
                onSelectSegment={setSelectedSegmentId}
                onSeek={handleSeek}
                onUpdateProject={handleUpdateProject}
                uiLang={uiLang}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Floating Quick Share Bar on Mobile */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsPublishShareOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold rounded-full shadow-2xl shadow-indigo-500/50"
        >
          <Share2 className="w-5 h-5 animate-pulse" />
          <span>Publish &amp; Share</span>
        </button>
      </div>

      {/* Modals */}
      <PublishShareModal
        isOpen={isPublishShareOpen}
        onClose={() => setIsPublishShareOpen(false)}
        project={currentProject}
        uiLang={uiLang}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        project={currentProject}
        videoRef={videoRef}
        uiLang={uiLang}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUpdateUser={setUser}
        uiLang={uiLang}
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreateProject={handleCreateProject}
        uiLang={uiLang}
      />
    </div>
  );
}
