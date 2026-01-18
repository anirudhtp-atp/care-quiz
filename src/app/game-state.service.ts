import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GameStateService {
  userName: string | null = null;
  selectedClass: number | null = null;
  selectedAvatar: string | null = null;
  score = 0;
  lastResult: 'correct' | 'wrong' | null = null;
  lastRoundScore?: number;
  
  reset() {
    this.score = 0;
    this.lastResult = null;
  }
}
