export interface FastTextOptions {
  wordsPerMinute?: number;
  anchorPosition?: number;
}

export interface FastTextDisplay {
  before: string;
  anchor: string;
  after: string;
  currentWord: number;
  totalWords: number;
  progress: number;
}

export class FastTextPlayer {
  private text: string = "";
  private words: string[] = [];
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private wpm: number = 300;
  private anchorPos: number = 0;
  private onUpdate: (display: FastTextDisplay) => void;
  private onComplete: () => void;

  constructor(
    onUpdate: (display: FastTextDisplay) => void,
    onComplete: () => void,
    options: FastTextOptions = {}
  ) {
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
    this.wpm = options.wordsPerMinute ?? 300;
    this.anchorPos = options.anchorPosition ?? 0;
  }

  load(text: string): void {
    this.text = (text || "").trim();
    this.words = this.text.split(/\s+/).filter(w => w.length > 0);
    this.currentIndex = 0;
  }

  start(): void {
    if (this.isPlaying || this.words.length === 0) return;
    this.isPlaying = true;
    this.scheduleNext();
  }

  pause(): void {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  toggle(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.start();
    }
  }

  reset(): void {
    this.pause();
    this.currentIndex = 0;
    if (this.words.length > 0) {
      this.renderCurrent();
    }
  }

  setWPM(wpm: number): void {
    this.wpm = Math.max(60, Math.min(1000, wpm));
    if (this.isPlaying) {
      this.pause();
      this.start();
    }
  }

  getWPM(): number {
    return this.wpm;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  getTotalWords(): number {
    return this.words.length;
  }

  private scheduleNext(): void {
    if (!this.isPlaying) return;

    const intervalMs = (60 / this.wpm) * 1000;

    this.intervalId = setInterval(() => {
      if (!this.isPlaying) return;

      this.currentIndex++;

      if (this.currentIndex >= this.words.length) {
        this.pause();
        this.onComplete();
        return;
      }

      this.renderCurrent();
    }, intervalMs);
  }

  public renderCurrent(): void {
    const word = this.words[this.currentIndex] || "";
    const display = this.formatWord(word);
    this.onUpdate(display);
  }

  private formatWord(word: string): FastTextDisplay {
    const wordLen = word.length;
    const anchorIdx = this.getORPIndex(wordLen);
    const anchorIdxFinal = Math.max(0, anchorIdx);

    const before = word.substring(0, anchorIdxFinal);
    const anchor = word.substring(anchorIdxFinal, anchorIdxFinal + 1);
    const after = word.substring(anchorIdxFinal + 1);

    return {
      before,
      anchor,
      after,
      currentWord: this.currentIndex + 1,
      totalWords: this.words.length,
      progress: ((this.currentIndex + 1) / this.words.length) * 100,
    };
  }

  private getORPIndex(wordLen: number): number {
    if (wordLen <= 1) return 0;
    if (wordLen <= 5) return 1;
    if (wordLen <= 9) return 2;
    if (wordLen <= 13) return 3;
    return 4;
  }
}
