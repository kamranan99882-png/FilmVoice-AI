import React from 'react';
import {
  Sparkles,
  Share2,
  Download,
  FolderOpen,
  Plus,
  Globe,
  User,
  HardDrive,
  Tv,
  CheckCircle2,
} from 'lucide-react';
import { Project, UserProfile } from '../types';
import { UI_STRINGS } from '../constants';

interface HeaderProps {
  currentProject: Project;
  projects: Project[];
  onSelectProject: (proj: Project) => void;
  onOpenNewProject: () => void;
  onOpenPublishShare: () => void;
  onOpenExport: () => void;
  onOpenAuth: () => void;
  uiLang: 'en' | 'ur';
  setUiLang: (lang: 'en' | 'ur') => void;
  user: UserProfile;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onOpenNewProject,
  onOpenPublishShare,
  onOpenExport,
  onOpenAuth,
  uiLang,
  setUiLang,
  user,
  previewMode,
  setPreviewMode,
}) => {
  const strings = UI_STRINGS[uiLang];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Project Selector */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                  {strings.appTitle}
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI v2.5
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {strings.subtitle}
              </p>
            </div>
          </div>

          {/* Project Switcher */}
          <div className="hidden md:flex items-center gap-1.5 pl-4 border-l border-slate-800">
            <div className="relative group">
              <select
                value={currentProject.id}
                onChange={(e) => {
                  const found = projects.find((p) => p.id === e.target.value);
                  if (found) onSelectProject(found);
                }}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-200 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.title}
                  </option>
                ))}
              </select>
              <FolderOpen className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              onClick={onOpenNewProject}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700/60 transition"
              title={strings.newProject}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{strings.newProject}</span>
            </button>
          </div>
        </div>

        {/* Center: Device Preview Tester (Requirement 13: Mobile & Computer testing) */}
        <div className="hidden lg:flex items-center bg-slate-950/60 border border-slate-800 rounded-lg p-1 text-xs">
          <span className="text-slate-400 px-2 font-medium flex items-center gap-1">
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            {strings.previewDevice}:
          </span>
          <button
            onClick={() => setPreviewMode('desktop')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              previewMode === 'desktop'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {strings.desktop}
          </button>
          <button
            onClick={() => setPreviewMode('tablet')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              previewMode === 'tablet'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {strings.tablet}
          </button>
          <button
            onClick={() => setPreviewMode('mobile')}
            className={`px-2.5 py-1 rounded font-medium transition ${
              previewMode === 'mobile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {strings.mobile}
          </button>
        </div>

        {/* Right: Language, Auth & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* UI Language Switcher (English / Urdu) */}
          <button
            onClick={() => setUiLang(uiLang === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/70 transition"
            title="Toggle Urdu / English UI"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{uiLang === 'en' ? 'اردو' : 'English'}</span>
          </button>

          {/* User Profile / Storage badge */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs text-slate-300 transition"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
              {user.name.charAt(0)}
            </div>
            <span className="hidden sm:inline font-medium">{user.name}</span>
            <span className="hidden xl:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              <HardDrive className="w-3 h-3" />
              {user.storageUsedMB}MB / {user.storageLimitMB}MB
            </span>
          </button>

          {/* Export Video Button */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{strings.export}</span>
          </button>

          {/* Publish & Share Button (Prominent Requirement 13) */}
          <button
            onClick={onOpenPublishShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white shadow-lg shadow-indigo-500/30 text-xs font-bold transition transform active:scale-95"
          >
            <Share2 className="w-4 h-4 animate-pulse" />
            <span>{strings.publishAndShare}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
