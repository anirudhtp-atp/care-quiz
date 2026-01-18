import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../game-state.service';

@Component({
  standalone: true,
  selector: 'app-result',
  imports: [CommonModule],
  templateUrl: './result.html',
  styleUrl: './result.css',
})
export class Result {

   userName = '';
  score = 0;
  total = 0;

  // You can adjust the file extension if your asset is .webp/.svg
  winnerEmojiSrc = 'assets/avatars/winner.png';

  constructor(public state: GameStateService, private router: Router) {
    // Prefer navigation extras (robust on this navigation)
    const nav = this.router.getCurrentNavigation();
    const st: any = nav?.extras?.state;

    this.userName = st?.userName ?? state.userName ?? '';
    this.score   = Number(st?.score ?? (state as any).lastRoundScore ?? 0);
    this.total   = Number(st?.total ?? 5);

    // Guard: if we lack basics (e.g., deep linked), send home
    if (!this.userName) {
      this.router.navigate(['/']);
    }
  }

  playAgain() {
    // Start a fresh round (QuizComponent initializes a new round on load)
    this.router.navigate(['/quiz']);
  }

  home() {
    this.router.navigate(['/']);
  }

}
