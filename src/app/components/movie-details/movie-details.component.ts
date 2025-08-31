import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { LoaderComponent } from '../loader/loader.component';
import { MovieDetails, Cast, Crew } from '../../services/tmdb.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    LoaderComponent
  ],
  template: `
    <div class="movie-details-container">
      <app-loader *ngIf="loading" message="Loading movie details..."></app-loader>
      
      <div *ngIf="!loading && error" class="error-container">
        <mat-icon color="warn">error</mat-icon>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="onRetry()">
          <mat-icon>refresh</mat-icon>
          Retry
        </button>
      </div>
      
      <div *ngIf="!loading && !error && movie" class="movie-content">
        <div class="movie-header">
          <div class="movie-poster">
            <img 
              [src]="getImageUrl(movie.poster_path, 'w500')"
              [alt]="movie.title"
              (error)="onImageError($event)"
              class="poster-image">
          </div>
          
          <div class="movie-info">
            <div class="title-section">
              <h1 class="movie-title">{{ movie.title }}</h1>
              <p class="movie-tagline" *ngIf="movie.tagline">{{ movie.tagline }}</p>
            </div>
            
            <div class="movie-meta">
              <div class="rating-section">
                <div class="rating">
                  <mat-icon color="accent">star</mat-icon>
                  <span class="rating-value">{{ movie.vote_average | number:'1.1-1' }}</span>
                  <span class="rating-count">({{ movie.vote_count | number }} votes)</span>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="movie.vote_average * 10"
                  color="accent"
                  class="rating-bar">
                </mat-progress-bar>
              </div>
              
              <div class="meta-info">
                <div class="meta-item">
                  <mat-icon>calendar_today</mat-icon>
                  <span>{{ formatDate(movie.release_date) }}</span>
                </div>
                <div class="meta-item" *ngIf="movie.runtime">
                  <mat-icon>schedule</mat-icon>
                  <span>{{ formatRuntime(movie.runtime) }}</span>
                </div>
                <div class="meta-item" *ngIf="movie.budget > 0">
                  <mat-icon>attach_money</mat-icon>
                  <span>{{ formatCurrency(movie.budget) }}</span>
                </div>
              </div>
            </div>
            
            <div class="genres" *ngIf="movie.genres?.length">
              <mat-chip-set>
                <mat-chip *ngFor="let genre of movie.genres">{{ genre.name }}</mat-chip>
              </mat-chip-set>
            </div>
            
            <div class="actions">
              <button mat-raised-button color="primary" (click)="onToggleFavorite()">
                <mat-icon>{{ isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
                {{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}
              </button>
              <button mat-stroked-button (click)="onClose()">
                <mat-icon>arrow_back</mat-icon>
                Back to List
              </button>
            </div>
          </div>
        </div>
        
        <mat-divider></mat-divider>
        
        <div class="movie-body">
          <div class="overview-section">
            <h2>Overview</h2>
            <p class="overview-text">{{ movie.overview || 'No overview available.' }}</p>
          </div>
          
          <div class="cast-section" *ngIf="cast?.length">
            <h2>Cast</h2>
            <div class="cast-grid">
              <div *ngFor="let actor of cast.slice(0, 12)" class="cast-member">
                <img 
                  [src]="getImageUrl(actor.profile_path, 'w185')"
                  [alt]="actor.name"
                  (error)="onImageError($event)"
                  class="cast-photo">
                <div class="cast-info">
                  <p class="cast-name">{{ actor.name }}</p>
                  <p class="cast-character">{{ actor.character }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="crew-section" *ngIf="crew?.length">
            <h2>Key Crew</h2>
            <div class="crew-grid">
              <div *ngFor="let member of getKeyCrew()" class="crew-member">
                <p class="crew-name">{{ member.name }}</p>
                <p class="crew-job">{{ member.job }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .movie-details-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
    }
    
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px;
      text-align: center;
    }
    
    .movie-header {
      display: flex;
      gap: 32px;
      margin-bottom: 32px;
    }
    
    .movie-poster {
      flex-shrink: 0;
    }
    
    .poster-image {
      width: 300px;
      height: 450px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    
    .movie-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .movie-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0;
      line-height: 1.2;
    }
    
    .movie-tagline {
      font-style: italic;
      color: #666;
      margin: 8px 0 0 0;
      font-size: 1.1rem;
    }
    
    .rating-section {
      margin-bottom: 16px;
    }
    
    .rating {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .rating-value {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    .rating-count {
      color: #666;
      font-size: 0.9rem;
    }
    
    .rating-bar {
      width: 200px;
      height: 8px;
    }
    
    .meta-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }
    
    .genres {
      margin: 16px 0;
    }
    
    .actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .overview-section {
      margin-bottom: 32px;
    }
    
    .overview-text {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #333;
    }
    
    .cast-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .cast-member {
      text-align: center;
    }
    
    .cast-photo {
      width: 100px;
      height: 150px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    
    .cast-name {
      font-weight: 600;
      margin: 0 0 4px 0;
      font-size: 0.9rem;
    }
    
    .cast-character {
      color: #666;
      margin: 0;
      font-size: 0.8rem;
    }
    
    .crew-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .crew-member {
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .crew-name {
      font-weight: 600;
      margin: 0 0 4px 0;
    }
    
    .crew-job {
      color: #666;
      margin: 0;
      font-size: 0.9rem;
    }
    
    h2 {
      color: #333;
      margin-bottom: 16px;
      font-size: 1.5rem;
    }
    
    @media (max-width: 768px) {
      .movie-details-container {
        padding: 16px;
      }
      
      .movie-header {
        flex-direction: column;
        gap: 24px;
      }
      
      .poster-image {
        width: 200px;
        height: 300px;
        margin: 0 auto;
        display: block;
      }
      
      .movie-title {
        font-size: 2rem;
      }
      
      .cast-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      }
      
      .crew-grid {
        grid-template-columns: 1fr;
      }
      
      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class MovieDetailsComponent implements OnInit, OnDestroy {
  @Input() movie: MovieDetails | null = null;
  @Input() cast: Cast[] = [];
  @Input() crew: Crew[] = [];
  @Input() loading: boolean = false;
  @Input() error: string | null = null;
  @Input() isFavorite: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() toggleFavorite = new EventEmitter<MovieDetails>();
  @Output() retry = new EventEmitter<void>();
  
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    // Component initialization logic if needed
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onClose(): void {
    this.close.emit();
  }
  
  onToggleFavorite(): void {
    if (this.movie) {
      this.toggleFavorite.emit(this.movie);
    }
  }
  
  onRetry(): void {
    this.retry.emit();
  }
  
  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/no-image.svg';
  }
  
  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) {
      return 'assets/images/no-image.svg';
    }
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  formatRuntime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  getKeyCrew(): Crew[] {
    const keyJobs = ['Director', 'Producer', 'Executive Producer', 'Screenplay', 'Writer', 'Music'];
    return this.crew
      .filter(member => keyJobs.includes(member.job))
      .slice(0, 8);
  }
}