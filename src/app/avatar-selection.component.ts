import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameStateService } from './game-state.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'avatar-selection',
  imports: [CommonModule, FormsModule],
  templateUrl: './avatar-selection.component.html',
  styleUrls: ['./avatar-selection.component.css']
})
export class AvatarSelectionComponent {
  highlightInput = true;
  userName: string = '';
  avatarType: string = 'super-heroes';
  showCredits = false; 
  classes = Array.from({ length: 8 }, (_, i) => i + 1);
  // Avatars can include an `img` path. Place avatar images under `srcassets/avatars/` or `publicassets/avatars/`.
  avatars = [
    { id: 'boy-1', label: '👦', img: `assets/avatars/${this.avatarType}/boy-1.png` },
    { id: 'girl-1', label: '👧', img: `assets/avatars/${this.avatarType}/girl-1.png` },

    { id: 'boy-2', label: '👦', img: `assets/avatars/${this.avatarType}/boy-2.png` },
    { id: 'girl-2', label: '👧', img: `assets/avatars/${this.avatarType}/girl-2.png` },

    { id: 'boy-3', label: '👦', img: `assets/avatars/${this.avatarType}/boy-3.png` },
    { id: 'girl-3', label: '👧', img: `assets/avatars/${this.avatarType}/girl-3.png` },

    { id: 'boy-4', label: '👦', img: `assets/avatars/${this.avatarType}/boy-4.png` },
    { id: 'girl-4', label: '👧', img: `assets/avatars/${this.avatarType}/girl-4.png` }
  ];

  selectedClass: number | null = null;
  selectedAvatar: string | null = null;
  
  toggleCredits() {
    this.showCredits = !this.showCredits;
  }

  
  constructor(private router: Router, private state: GameStateService) {
    setTimeout(() => this.highlightInput = false, 1200);
  }

  start() {
    if (!this.userName || !this.selectedAvatar) return;
    this.state.userName = this.userName;
    const avatar = this.avatars.find(a => a.id === this.selectedAvatar) as any;
    this.state.selectedClass = 1
    // this.state.selectedClass = this.selectedClass;
    // store image path if available so quiz can render the avatar image
    this.state.selectedAvatar = avatar?.img ?? this.selectedAvatar;
    this.state.reset();
    this.router.navigate(['/quiz']);
  }
}
