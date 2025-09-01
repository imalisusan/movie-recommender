import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Movie } from '../../services/tmdb.service';
import { TmdbService } from '../../services/tmdb.service';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="movie-card" [class.loading]="loading">
      <div class="poster-container">
        <img 
          [src]="getPosterUrl()" 
          [alt]="movie.title"
          class="poster"
          (error)="onImageError($event)"
          loading="lazy"
        />
        <div class="rating-badge" *ngIf="movie.vote_average > 0">
          <mat-icon>star</mat-icon>
          <span>{{ movie.vote_average | number:'1.1-1' }}</span>
        </div>
      </div>
      
      <mat-card-content class="content">
        <h3 class="title" [title]="movie.title">{{ movie.title }}</h3>
        <p class="release-date" *ngIf="movie.release_date">
          {{ formatReleaseDate(movie.release_date) }}
        </p>
        <p class="overview" [title]="movie.overview">
          {{ truncateOverview(movie.overview) }}
        </p>
      </mat-card-content>
      
      <mat-card-actions class="actions">
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onViewDetails()"
          [disabled]="loading"
        >
          <mat-icon>info</mat-icon>
          View Details
        </button>
        <button 
          mat-icon-button 
          (click)="onToggleFavorite()"
          [disabled]="loading"
          [class.favorite]="isFavorite"
        >
          <mat-icon>{{ isFavorite ? 'favorite' : 'favorite_border' }}</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .movie-card {
      width: 100%;
      max-width: 300px;
      margin: 16px;
      transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    
    .movie-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
    }
    
    .movie-card.loading {
      opacity: 0.7;
      pointer-events: none;
    }
    
    .poster-container {
      position: relative;
      width: 100%;
      height: 400px;
      overflow: hidden;
    }
    
    .poster {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
    
    .movie-card:hover .poster {
      transform: scale(1.05);
    }
    
    .rating-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 4px 8px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .rating-badge mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #ffd700;
    }
    
    .content {
      padding: 16px;
      flex-grow: 1;
    }
    
    .title {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .release-date {
      margin: 0 0 12px 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
    }
    
    .overview {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
      color: #777;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .actions {
      padding: 8px 16px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .actions button[mat-raised-button] {
      flex: 1;
      margin-right: 8px;
    }
    
    .actions button[mat-icon-button] {
      color: #666;
      transition: color 0.2s ease;
    }
    
    .actions button[mat-icon-button].favorite {
      color: #e91e63;
    }
    
    .actions button[mat-icon-button]:hover {
      color: #e91e63;
    }
    
    @media (max-width: 768px) {
      .movie-card {
        max-width: 100%;
        margin: 8px;
      }
      
      .poster-container {
        height: 300px;
      }
    }
  `]
})
export class MovieCardComponent {
  @Input() movie!: Movie;
  @Input() loading = false;
  @Input() isFavorite = false;
  
  @Output() viewDetails = new EventEmitter<Movie>();
  @Output() toggleFavorite = new EventEmitter<Movie>();
  
  private fallbackImage = 'assets/images/no-poster.jpg';
  
  constructor(private tmdbService: TmdbService) {}
  
  getPosterUrl(): string {
    if (!this.movie.poster_path) {
      return this.fallbackImage;
    }
    return this.tmdbService.getPosterUrl(this.movie.poster_path, 'w500');
  }
  
  onImageError(event: any): void {
    event.target.src = this.fallbackImage;
  }
  
  formatReleaseDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long' 
    };
    
    return date.toLocaleDateString('en-US', options);
  }
  
  truncateOverview(overview: string): string {
    if (!overview) return '';
    const maxLength = 120;
    if (overview.length <= maxLength) return overview;
    return overview.substring(0, maxLength).trim() + '...';
  }
  
  onViewDetails(): void {
    this.viewDetails.emit(this.movie);
  }
  
  onToggleFavorite(): void {
    this.toggleFavorite.emit(this.movie);
  }
}