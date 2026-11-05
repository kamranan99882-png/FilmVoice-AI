import { DialogueSegment, Project } from '../types';

function formatSrtTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(
    secs
  ).padStart(2, '0')},${String(millis).padStart(3, '0')}`;
}

function formatVttTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(
    secs
  ).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

export function generateSrt(segments: DialogueSegment[], languageMode: 'translated' | 'original' | 'bilingual' = 'translated'): string {
  let srt = '';
  segments.forEach((seg, index) => {
    const num = index + 1;
    const timeRange = `${formatSrtTime(seg.startTime)} --> ${formatSrtTime(seg.endTime)}`;
    let text = seg.translatedText;
    if (languageMode === 'original') text = seg.originalText;
    if (languageMode === 'bilingual') text = `${seg.translatedText}\n${seg.originalText}`;

    srt += `${num}\n${timeRange}\n${text}\n\n`;
  });
  return srt.trim();
}

export function generateVtt(segments: DialogueSegment[], languageMode: 'translated' | 'original' | 'bilingual' = 'translated'): string {
  let vtt = 'WEBVTT\n\n';
  segments.forEach((seg, index) => {
    const num = index + 1;
    const timeRange = `${formatVttTime(seg.startTime)} --> ${formatVttTime(seg.endTime)}`;
    let text = seg.translatedText;
    if (languageMode === 'original') text = seg.originalText;
    if (languageMode === 'bilingual') text = `${seg.translatedText}\n${seg.originalText}`;

    vtt += `${num}\n${timeRange}\n${text}\n\n`;
  });
  return vtt.trim();
}

export function generateScriptText(project: Project): string {
  let output = `====================================================\n`;
  output += `PROJECT: ${project.title}\n`;
  output += `SOURCE: ${project.sourceLanguage}  |  TARGET: ${project.targetLanguage}\n`;
  output += `DURATION: ${project.duration.toFixed(1)}s  |  SEGMENTS: ${project.segments.length}\n`;
  output += `====================================================\n\n`;

  project.segments.forEach((seg, idx) => {
    const speaker = project.speakers.find((s) => s.id === seg.speakerId)?.name || seg.speakerId;
    output += `[${idx + 1}] (${seg.startTime.toFixed(2)}s - ${seg.endTime.toFixed(2)}s) ${speaker} [Voice: ${seg.voice}]\n`;
    output += `ORIGINAL:   ${seg.originalText}\n`;
    output += `TRANSLATED: ${seg.translatedText}\n`;
    output += `----------------------------------------------------\n`;
  });

  return output;
}

export function triggerDownload(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
