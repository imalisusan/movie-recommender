import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="loader-container">
      <mat-spinner [diameter]="size" [color]="color"></mat-spinner>
      <p class="loader-text" *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loader-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      min-height: 200px;
    }
    
    .loader-text {
      margin-top: 16px;
      color: #666;
      font-size: 14px;
      text-align: center;
    }
    
    @media (max-width: 768px) {
      .loader-container {
        padding: 20px;
        min-height: 150px;
      }
    }
  `]
})
export class LoaderComponent {
  @Input() size: number = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() message: string = 'Loading...';
}