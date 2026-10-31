/**
 * TRAİ Speech Synthesis & Recognition Coordinator
 * Coordinates Web Speech Recognition + Gemini TTS / Browser Fallback + Audio Visualizer
 */

export type SpeechState = 'idle' | 'listening' | 'processing' | 'speaking';

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private currentAudio: HTMLAudioElement | null = null;
  private stateListeners: Array<(state: SpeechState) => void> = [];
  private currentState: SpeechState = 'idle';

  constructor() {
    this.initRecognition();
  }

  private setState(state: SpeechState) {
    this.currentState = state;
    this.stateListeners.forEach((fn) => fn(state));
  }

  public subscribeState(listener: (state: SpeechState) => void) {
    this.stateListeners.push(listener);
    listener(this.currentState);
    return () => {
      this.stateListeners = this.stateListeners.filter((l) => l !== listener);
    };
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('SpeechRecognition API is not supported in this browser.');
      return;
    }

    try {
      this.recognition = new SpeechRec();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'tr-TR';
    } catch (e) {
      console.error('Failed to initialize SpeechRecognition', e);
    }
  }

  // Start listening for speech
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onWakeWordDetected?: () => void,
    onError?: (error: any) => void
  ) {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      onError?.({ message: 'Tarayıcınız ses tanıma özelliğini desteklemiyor.' });
      return;
    }

    if (this.isListening) {
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
      this.setState('listening');
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).trim();
      const lower = text.toLowerCase();

      // Check for wake word: TRAİ or Jarvis
      if (
        lower.includes('trai') ||
        lower.includes('tra i') ||
        lower.includes('hey trai') ||
        lower.includes('merhaba trai') ||
        lower.includes('jarvis') ||
        lower.includes('hey jarvis') ||
        lower.includes('merhaba jarvis')
      ) {
        onWakeWordDetected?.();
      }

      onResult(text, !!finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      // no-speech or aborted are normal events, don't break UI
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('SpeechRecognition notice:', event.error);
        this.setState('idle');
        this.isListening = false;
        onError?.(event);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.currentState === 'listening') {
        this.setState('idle');
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      // Already started or busy, safe to ignore
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
    if (this.currentState === 'listening') {
      this.setState('idle');
    }
  }

  // Speak response using Gemini TTS with browser Web Speech synthesis fallback
  public async speak(text: string, voiceName: string = 'Fenrir', speechRate: number = 1.0): Promise<void> {
    this.stopSpeaking();
    this.setState('speaking');

    // 1. Try Gemini 3.8 Flash Lite TTS endpoint
    try {
      const res = await fetch('/api/trai/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: voiceName }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioData) {
          return new Promise((resolve) => {
            const audio = new Audio(data.audioData);
            this.currentAudio = audio;
            audio.playbackRate = speechRate;

            audio.onended = () => {
              this.currentAudio = null;
              this.setState('idle');
              resolve();
            };
            audio.onerror = () => {
              this.currentAudio = null;
              this.fallbackBrowserSpeech(text, speechRate).then(resolve);
            };

            audio.play().catch(() => {
              this.fallbackBrowserSpeech(text, speechRate).then(resolve);
            });
          });
        }
      }
    } catch (err) {
      console.warn('Gemini TTS failed, falling back to browser speech synthesis', err);
    }

    // 2. Fallback to Browser SpeechSynthesis
    return this.fallbackBrowserSpeech(text, speechRate);
  }

  private fallbackBrowserSpeech(text: string, rate: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        this.setState('idle');
        resolve();
        return;
      }

      try {
        window.speechSynthesis.cancel();
      } catch (e) {}

      const cleanText = text.replace(/[*_#`[\]()]/g, '').trim();
      if (!cleanText) {
        this.setState('idle');
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find((v) => v.lang.startsWith('tr') || v.lang.startsWith('TR'));
      if (trVoice) {
        utterance.voice = trVoice;
        utterance.lang = 'tr-TR';
      }

      utterance.onend = () => {
        this.setState('idle');
        resolve();
      };
      utterance.onerror = (e) => {
        // 'canceled' or 'interrupted' is normal when user clicks another action
        this.setState('idle');
        resolve();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        this.setState('idle');
        resolve();
      }
    });
  }

  public stopSpeaking() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.currentState === 'speaking') {
      this.setState('idle');
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
