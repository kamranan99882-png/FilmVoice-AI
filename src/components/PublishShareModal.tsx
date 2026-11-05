import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  X,
  Share2,
  Copy,
  Check,
  Smartphone,
  Monitor,
  ExternalLink,
  MessageCircle,
  Facebook,
  Twitter,
  Send,
  Code,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Project } from '../types';
import { UI_STRINGS, PUBLIC_LIVE_URL } from '../constants';

interface PublishShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  uiLang: 'en' | 'ur';
}

export const PublishShareModal: React.FC<PublishShareModalProps> = ({
  isOpen,
  onClose,
  project,
  uiLang,
}) => {
  const strings = UI_STRINGS[uiLang];
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use the public live URL provided by the hosting platform
  const liveUrl = PUBLIC_LIVE_URL;

  // Share text
  const shareMessage =
    project.targetLanguage === 'Urdu'
      ? `میرے اس اے آئی ڈبنگ پروجیکٹ "${project.title}" کو دیکھیں! اردو میں ڈب شدہ ویڈیو یہاں لائیو دیکھیں: ${liveUrl}`
      : `Check out my AI Video Dubbing project "${project.title}" dubbed in ${project.targetLanguage}! Watch live here: ${liveUrl}`;

  // WhatsApp and Facebook share links
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    liveUrl
  )}&quote=${encodeURIComponent(shareMessage)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareMessage
  )}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    liveUrl
  )}&text=${encodeURIComponent(shareMessage)}`;

  const embedCode = `<iframe src="${liveUrl}" width="100%" height="700" frameborder="0" allow="autoplay; microphone; camera" allowfullscreen></iframe>`;

  // Draw QR code onto canvas
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        liveUrl,
        {
          width: 180,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR code error:', error);
        }
      );
    }
  }, [isOpen, liveUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setEmbedCopied(true);
    setTimeout(() => setEmbedCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {strings.publishAndShare}
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Hosting
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {uiLang === 'ur'
                  ? 'ویب سائٹ کو پبلک کریں، موبائل پر ٹیسٹ کریں اور واٹس ایپ/فیس بک پر شیئر کریں'
                  : 'Public live URL, instant mobile QR testing, and 1-click social sharing'}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Live Published URL */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Globe className="w-4 h-4" />
                {strings.liveUrl}
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active &amp; Online
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-2">
              <input
                type="text"
                readOnly
                value={liveUrl}
                className="w-full bg-transparent text-xs font-mono text-slate-200 focus:outline-none px-2 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md transition shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? strings.linkCopied : strings.copyLink}</span>
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                title="Open Live URL in New Tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Quick AI Studio 1-Click Activation Notice */}
            <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-xl p-3 text-[11px] text-slate-300 space-y-1">
              <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                {uiLang === 'ur'
                  ? 'پبلک لنک ایکٹیویٹ کرنے کا طریقہ (How to Activate Public Link):'
                  : 'How to make this link accessible to everyone:'}
              </p>
              <p className="text-slate-400">
                {uiLang === 'ur'
                  ? 'اسکرین کے اوپر دائیں کونے (Top-Right) میں موجود "Share" بٹن دبائیں اور "Anyone with the link" منتخب کریں۔ اس کے بعد یہ لنک ہر موبائل اور کمپیوٹر پر بغیر کسی ایرر کے کھل جائے گا۔'
                  : 'Click the "Share" button at the top-right of your AI Studio window and select "Anyone with the link" to make it open for all users worldwide.'}
              </p>
            </div>
          </div>

          {/* Section 2: Mobile & Computer Testing (QR Code & Device Check) */}
          <div className="bg-gradient-to-br from-slate-950 to-indigo-950/20 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-pink-400" />
              <h3 className="font-bold text-sm text-white">{strings.mobileTesting}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* QR Code Canvas */}
              <div className="flex flex-col items-center justify-center bg-white p-3 rounded-2xl shadow-lg border border-slate-200">
                <canvas ref={canvasRef} className="rounded-lg" />
                <span className="text-[11px] font-bold text-slate-800 mt-2 text-center">
                  {strings.scanQr}
                </span>
                <span className="text-[10px] text-slate-500 text-center">
                  iPhone &amp; Android camera supported
                </span>
              </div>

              {/* Testing Instructions & Device Badges */}
              <div className="space-y-3 text-xs text-slate-300">
                <p className="leading-relaxed">
                  {uiLang === 'ur'
                    ? 'یہ ویب سائٹ مکمل طور پر رسپانسو (Responsive) ہے اور موبائل، ٹیبلٹ اور کمپیوٹر سب پر بہترین کام کرتی ہے۔'
                    : 'The application is fully responsive. Scan the QR code with your phone to experience mobile video dubbing touch controls.'}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-semibold text-white block">Mobile Testing</span>
                      <span className="text-[11px] text-slate-400">Touch video scrub, microphone preview</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-semibold text-white block">Computer Testing</span>
                      <span className="text-[11px] text-slate-400">Full timeline waveform & multi-track mixer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: WhatsApp & Facebook 1-Click Sharing */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              {uiLang === 'ur' ? 'سوشل میڈیا پر فوری شیئر کریں' : 'Instant 1-Click Social Sharing'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp Share */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition transform active:scale-95"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>{strings.shareOnWhatsApp}</span>
              </a>

              {/* Facebook Share */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition transform active:scale-95"
              >
                <Facebook className="w-5 h-5 fill-current" />
                <span>{strings.shareOnFacebook}</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition"
              >
                <Twitter className="w-4 h-4" />
                <span>Share on X / Twitter</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition"
              >
                <Send className="w-4 h-4 text-sky-400" />
                <span>Share on Telegram</span>
              </a>
            </div>
          </div>

          {/* Section 4: Embed Code */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs">
            <div className="flex items-center justify-between mb-1.5 text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                Embed Studio on your Website
              </span>
              <button
                onClick={handleCopyEmbed}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold"
              >
                {embedCopied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="bg-slate-900 p-2 rounded-lg text-[11px] font-mono text-slate-400 overflow-x-auto">
              {embedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
