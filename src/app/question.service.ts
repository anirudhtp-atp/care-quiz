import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Papa from 'papaparse';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

export interface Question {
  text: string;
  options: string[];
  answer: number; // index
}

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private SAMPLE_QUESTIONS: { [level: number]: Question[] } = {};
  private loaded = false;

  // notify when questions are ready
  readonly ready$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadFromCsv();
  }

  private loadFromCsv() {
    this.http.get('/assets/sample_questions.csv', { responseType: 'text' })
      .subscribe(csvData => {
        const parsed = Papa.parse(csvData, { header: true });
        const levels: { [level: number]: Question[] } = {};

        (parsed.data as any[]).forEach(row => {
          const level = Number(row.Level);
          if (!levels[level]) levels[level] = [];
          levels[level].push({
            text: row.Text,
            options: [row.Option1, row.Option2, row.Option3, row.Option4],
            answer: Number(row.AnswerIndex)
          });
        });

        // fill empty levels 4–8 with level 3 demo questions
        for (let i = 4; i <= 8; i++) {
          levels[i] = levels[i] && levels[i].length > 0 ? levels[i] : levels[3] || [];
        }

        this.SAMPLE_QUESTIONS = levels;
        this.loaded = true;
        this.ready$.next(true); // signal readiness
      });
  }

  getRandomQuestionForLevel(level: number): Question {
    const pool = this.SAMPLE_QUESTIONS[level] || this.SAMPLE_QUESTIONS[1] || [];
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  getQuestionsForLevel(level: number): Question[] {
    const pool = this.SAMPLE_QUESTIONS[level] || this.SAMPLE_QUESTIONS[1] || [];
    return Array.isArray(pool) ? [...pool] : [];
  }

  getShuffledQuestions(level: number, count: number): Question[] {
    let safeCount = Number.isFinite(count) ? Math.floor(count) : 5;
    if (safeCount < 1) safeCount = 1;

    let pool = this.getQuestionsForLevel(level);

    if (pool.length < safeCount) {
      const fallback = this.getQuestionsForLevel(1);
      const merged: Question[] = [...pool];
      for (const q of fallback) {
        if (!merged.includes(q)) merged.push(q);
        if (merged.length >= safeCount) break;
      }
      pool = merged;
    }

    const limit = Math.min(safeCount, pool.length);

    // Fisher–Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, limit);
  }
}