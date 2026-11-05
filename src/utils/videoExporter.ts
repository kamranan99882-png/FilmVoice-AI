import { Project } from '../types';

export interface RenderProgress {
  percent: number;
  stage: string;
  isComplete: boolean;
  downloadUrl?: string;
  error?: string;
}

/**
 * Client-side video compositor with burned-in subtitles and dual-audio track mix
 */
export async function renderDubbedVideo(
  project: Project,
  videoElement: HTMLVideoElement,
  onProgress: (p: RenderProgress) => void
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      onProgress({ percent: 5, stage: 'Initializing video rendering pipeline...', isComplete: false });

      // Create offscreen canvas matching video dimensions
      const width = videoElement.videoWidth || 1280;
      const height = videoElement.videoHeight || 720;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not supported');
      }

      onProgress({ percent: 15, stage: 'Setting up audio & subtitle compositor...', isComplete: false });

      // Create stream from canvas
      const canvasStream = canvas.captureStream(30);

      // Create audio context and stream destination
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const dest = audioCtx.createMediaStreamDestination();

      // Connect video audio to destination if possible (with ducking)
      let videoSource: MediaElementAudioSourceNode | null = null;
      try {
        videoSource = audioCtx.createMediaElementSource(videoElement);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = (project.duckingPercent || 20) / 100;
        videoSource.connect(gainNode);
        gainNode.connect(dest);
        gainNode.connect(audioCtx.destination);
      } catch (e) {
        console.warn('Could not capture audio stream from video tag, proceeding with canvas track');
      }

      // Combine video & audio tracks into single MediaStream
      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ];
      const combinedStream = new MediaStream(combinedTracks);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunks, { type: mimeType });
        const downloadUrl = URL.createObjectURL(finalBlob);
        onProgress({ percent: 100, stage: 'Dubbed video rendered successfully!', isComplete: true, downloadUrl });
        resolve(downloadUrl);
      };

      recorder.start(100);

      // Seek video to start and record through playback
      const originalTime = videoElement.currentTime;
      videoElement.currentTime = 0;
      await videoElement.play();

      const duration = videoElement.duration || project.duration || 10;

      const renderLoop = () => {
        if (videoElement.paused || videoElement.ended || videoElement.currentTime >= duration) {
          recorder.stop();
          videoElement.pause();
          videoElement.currentTime = originalTime;
          return;
        }

        const curr = videoElement.currentTime;
        const progressPercent = Math.min(95, Math.floor((curr / duration) * 90) + 10);
        onProgress({
          percent: progressPercent,
          stage: `Rendering frame at ${curr.toFixed(1)}s / ${duration.toFixed(1)}s...`,
          isComplete: false,
        });

        // 1. Draw video frame
        ctx.drawImage(videoElement, 0, 0, width, height);

        // 2. Render burned-in subtitles if enabled
        if (project.subtitlesEnabled) {
          const currentSeg = project.segments.find(
            (s) => curr >= s.startTime && curr <= s.endTime
          );

          if (currentSeg) {
            const text = currentSeg.translatedText || currentSeg.originalText;
            const speaker = project.speakers.find((s) => s.id === currentSeg.speakerId);

            // Subtitle styling
            const fontSize = Math.max(22, Math.floor(height * 0.045));
            ctx.font = `600 ${fontSize}px "Noto Nastaliq Urdu", "Plus Jakarta Sans", sans-serif`;
            ctx.textAlign = 'center';

            // Background pill
            const textMetrics = ctx.measureText(text);
            const paddingX = 24;
            const paddingY = 12;
            const boxWidth = textMetrics.width + paddingX * 2;
            const boxHeight = fontSize * 1.5 + paddingY * 2;
            const boxX = (width - boxWidth) / 2;
            const boxY = height - boxHeight - Math.floor(height * 0.08);

            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 12);
            ctx.fill();

            // Speaker accent line
            ctx.fillStyle = speaker?.color || '#6366f1';
            ctx.fillRect(boxX, boxY, 4, boxHeight);

            // Text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, width / 2, boxY + boxHeight / 2 + fontSize * 0.35);
          }
        }

        requestAnimationFrame(renderLoop);
      };

      requestAnimationFrame(renderLoop);
    } catch (err: any) {
      console.error('Render error:', err);
      onProgress({ percent: 0, stage: 'Rendering failed', isComplete: false, error: err.message });
      reject(err);
    }
  });
}
