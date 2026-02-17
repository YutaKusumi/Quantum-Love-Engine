/**
 * A service to handle Text-to-Speech using the browser's Web Speech API.
 */
class TtsService {
  private synthesis: SpeechSynthesis;
  private isSupported: boolean;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoiceURI: string | null = null;
  public onVoicesLoaded: (() => void) | null = null;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    if (this.isSupported) {
      this.synthesis = window.speechSynthesis;
      // The 'voiceschanged' event is crucial for loading voices, as they may be loaded asynchronously.
      this.synthesis.onvoiceschanged = this.loadVoices.bind(this);
      this.loadVoices(); // Initial load attempt
    } else {
      console.warn("Text-to-Speech is not supported in this browser.");
    }
  }

  private loadVoices(): void {
    if (this.isSupported) {
        this.voices = this.synthesis.getVoices();
        if (this.onVoicesLoaded) {
            this.onVoicesLoaded();
        }
    }
  }

  /**
   * Gets the list of available speech synthesis voices.
   * @returns An array of SpeechSynthesisVoice objects.
   */
  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Sets the preferred voice for speech synthesis.
   * @param voiceURI The voiceURI of the desired voice.
   */
  public setSelectedVoice(voiceURI: string): void {
    this.selectedVoiceURI = voiceURI;
  }

  /**
   * Speaks the given text aloud. Cancels any previously playing speech.
   * @param text The text to be spoken.
   */
  public speak(text: string): void {
    if (!this.isSupported) return;

    // Cancel any ongoing speech before starting a new one.
    if (this.synthesis.speaking) {
      this.synthesis.cancel();
    }
    
    // Clean up text for better speech flow.
    const cleanedText = text.replace(/[*`]/g, '').trim();
    if (cleanedText.length === 0) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Attempt to find the user-selected voice.
    let selectedVoice: SpeechSynthesisVoice | undefined;
    if (this.selectedVoiceURI) {
      selectedVoice = this.voices.find(voice => voice.voiceURI === this.selectedVoiceURI);
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      // Fallback if no voice is selected or found (browser will use its default).
      utterance.lang = 'en-US'; 
    }

    utterance.pitch = 1;
    utterance.rate = 1.1; // Slightly faster for a more natural feel
    utterance.volume = 0.9;

    this.synthesis.speak(utterance);
  }

  /**
   * Immediately stops any speech that is currently playing.
   */
  public cancel(): void {
    if (this.isSupported && this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const ttsService = new TtsService();