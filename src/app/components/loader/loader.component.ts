import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="loader-container" [class.overlay]="overlay">
      <div class="loader-content">
        <div class="spinner-wrapper">
          <mat-spinner [diameter]="size" [color]="color"></mat-spinner>
          <mat-icon *ngIf="icon" class="loader-icon">{{ icon }}</mat-icon>
        </div>
        <p class="loader-text" *ngIf="message">{{ message }}</p>
        <p class="loader-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
      </div>
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
      position: relative;
    }
    
    .loader-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 1000;
      min-height: 100vh;
    }
    
    .loader-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 32px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
    
    .spinner-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .loader-icon {
      position: absolute;
      color: rgba(255, 255, 255, 0.8);
      font-size: 24px;
      width: 24px;
      height: 24px;
      animation: pulse 2s infinite;
    }
    
    .loader-text {
      margin-top: 20px;
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 500;
      text-align: center;
      letter-spacing: 0.5px;
    }
    
    .loader-subtitle {
      margin-top: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      text-align: center;
      max-width: 300px;
      line-height: 1.4;
    }
    
    @keyframes pulse {
      0%, 100% {
        opacity: 0.6;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
    }
    
    @media (max-width: 768px) {
      .loader-container {
        padding: 20px;
        min-height: 150px;
      }
      
      .loader-content {
        padding: 24px;
      }
      
      .loader-text {
        font-size: 14px;
      }
      
      .loader-subtitle {
        font-size: 12px;
      }
    }
  `]
})
export class LoaderComponent {
  @Input() size: number = 50;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() message: string = 'Loading...';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() overlay: boolean = false;
}