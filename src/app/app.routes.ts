import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./avatar-selection.component').then(m => m.AvatarSelectionComponent)
	},
	{
		path: 'quiz',
		loadComponent: () => import('./quiz.component').then(m => m.QuizComponent)
	},
	{
		path: 'result',
		loadComponent: () => import('./result/result').then(m => m.Result)
	}
];
