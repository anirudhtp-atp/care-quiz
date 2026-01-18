import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from './game-state.service';
import { QuestionService, Question } from './question.service';

@Component({
  standalone: true,
  selector: 'quiz-screen',
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css']
})
export class QuizComponent implements OnInit, OnDestroy {
  question: Question | null = null;
  optionsDisabled = false;
  feedbackMessage: string | null = null;

  // ===== NEW: round management (unchanged logic) =====
  roundQuestions: Question[] = [];
  currentIndex = 0;
  readonly questionsPerRound = 5;
  roundComplete = false;
  roundScore = 0;
  selectedIndex: number | null = null;


  showEmojiOverlay = false;
  showFeedback = false;
  emojiSrc = '';
  emojiAlt = '';
  showCredits = false;
  toggleCredits() {
    this.showCredits = !this.showCredits;
  }



  constructor(
    private router: Router,
    public state: GameStateService,
    private qs: QuestionService,
    private cdr: ChangeDetectorRef
  ) {
    if (!state.selectedClass) {
      router.navigate(['/']);
      return;
    }

    this.qs.ready$.subscribe(ready => {
      if (ready) {
        this.initRound();
        if (this.roundQuestions.length > 0) {
          this.loadQuestion();
          this.cdr.detectChanges(); // force UI update
        }
      }
    });
  }

  ngOnInit() {
    // (no timer)
  }

  ngOnDestroy() {
    // (no timer to clear)
  }

  // Back button handler
  backToHome() {
    this.router.navigate(['/']);
  }

  // Initialize a fresh round
  private initRound() {
    const level = this.state.selectedClass || 1;
    this.roundQuestions = this.qs.getShuffledQuestions(level, this.questionsPerRound);
    this.currentIndex = 0;
    this.roundComplete = false;
    this.roundScore = 0; // per-round score reset
    this.feedbackMessage = null;
    this.optionsDisabled = false;

    this.showEmojiOverlay = false;
    this.showFeedback = false;

  }

  // loadQuestion() {
  //   this.feedbackMessage = null;
  //   this.optionsDisabled = false;

  //   // KEEP (your original line):
  //   this.question = this.qs.getRandomQuestionForLevel(this.state.selectedClass || 1);

  //   // Use curated round question (no repeats, exactly 5 per round)
  //   if (this.currentIndex < this.roundQuestions.length) {
  //     this.question = this.roundQuestions[this.currentIndex] || this.question;
  //   } else {
  //     // round over
  //     this.question = null;
  //     this.roundComplete = true;
  //     return;
  //   }
  //   this.selectedIndex = null;
  //   this.showEmojiOverlay = false;
  //   this.showFeedback = false;

  // }

  loadQuestion() {
    this.feedbackMessage = null;
    this.optionsDisabled = false;

    if (this.currentIndex < this.roundQuestions.length) {
      this.question = this.roundQuestions[this.currentIndex];
    } else {
      this.question = null;
      this.roundComplete = true;
      return;
    }

    this.selectedIndex = null;
    this.showEmojiOverlay = false;
    this.showFeedback = false;
  }

  selectOption(i: number) {
    this.selectedIndex = i;
    if (!this.question) return;
    this.optionsDisabled = true;
    const correct = i === this.question.answer;

    this.state.lastResult = correct ? 'correct' : 'wrong';
    if (correct) {
      const audio = new Audio(`assets/sounds/correct.mp3`);
      audio.play();
      this.state.score += 1;      // global score (preserved)
      this.roundScore += 1;       // per-round score
      this.feedbackMessage = 'Yay!!! Well done';
      this.emojiSrc = "assets/avatars/star-1.png";
      this.emojiAlt = "Stars"

    } else {
      // Show ONLY the correct answer TEXT (no A/B/C/D)
      const audio = new Audio(`assets/sounds/wrong.mp3`);
      audio.play();
      const ci = this.question.answer;
      const text = this.question.options[ci];
      this.feedbackMessage = `Oops!!! <br>Correct answer: ${text}`;
      this.emojiSrc = "assets/avatars/oops.png";
      this.emojiAlt = "Oops";

    }
    this.showFeedback = false;
    this.showEmojiOverlay = true;
  }


  onEmojiAnimationEnd() {
    this.showFeedback = true; // reveal the feedback (template waits for this)
  }


  next() {
    // Move within the fixed 5-question round
    if (this.currentIndex < this.roundQuestions.length - 1) {
      this.currentIndex++;
      this.loadQuestion();
    } else {
      // end of round
      // this.roundComplete = true;
      // this.question = null;
      // this.feedbackMessage = null;
      // this.optionsDisabled = true;
      // this.showEmojiOverlay =false;
      // this.showFeedback = false;
      this.goToResult();
    }
  }
  private goToResult() {

    const audio = new Audio(`assets/sounds/victory.mp3`);
    audio.play();

    // Persist this round's score on shared state (tiny service addition below)
    (this.state as any).lastRoundScore = this.roundScore;

    const total = this.roundQuestions.length || this.questionsPerRound;
    this.router.navigate(['/result'], {
      state: {
        userName: this.state.userName,
        score: this.roundScore,
        total
      }
    });

    // Reset local overlays
    this.showEmojiOverlay = false;
    this.showFeedback = false;
  }


  // Start a fresh round
  playAgain() {
    this.initRound();
    this.loadQuestion();
  }
}
