import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';

import { MovieCardComponent } from '../movie-card/movie-card.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { LoaderComponent } from '../loader/loader.component';
import { TmdbService, Movie } from '../../services/tmdb.service';
import { MovieStateService } from '../../services/movie-state.service';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MovieCardComponent,
    PaginationComponent,
    LoaderComponent
  ],
  template: `
    <div class="movie-list-container">
      <!-- Loading State -->
      <app-loader *ngIf="loading && movies.length === 0"></app-loader>
      
      <!-- Error State -->
      <div class="error-state" *ngIf="error && movies.length === 0">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h3>Oops! Something went wrong</h3>
        <p>{{ error }}</p>
        <button mat-raised-button color="primary" (click)="retry()">
          <mat-icon>refresh</mat-icon>
          Try Again
        </button>
      </div>
      
      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && !error && movies.length === 0">
        <mat-icon class="empty-icon">movie</mat-icon>
        <h3>No movies found</h3>
        <p>Try adjusting your search criteria or browse different categories.</p>
      </div>
      
      <!-- Movies Grid -->
      <div class="movies-grid" *ngIf="movies.length > 0">
        <app-movie-card
          *ngFor="let movie of movies; trackBy: trackByMovieId"
          [movie]="movie"
          [loading]="loading"
          [isFavorite]="isFavorite(movie)"
          (viewDetails)="onViewDetails($event)"
          (toggleFavorite)="onToggleFavorite($event)"
        ></app-movie-card>
      </div>
      
      <!-- Load More Button (for infinite scroll alternative) -->
      <div class="load-more-container" *ngIf="movies.length > 0 && hasNextPage && !loading">
        <button 
          mat-raised-button 
          color="primary" 
          (click)="loadMore()"
          class="load-more-btn"
        >
          <mat-icon>expand_more</mat-icon>
          Load More Movies
        </button>
      </div>
      
      <!-- Loading More Indicator -->
      <div class="loading-more" *ngIf="loading && movies.length > 0">
        <mat-spinner diameter="40"></mat-spinner>
        <span>Loading more movies...</span>
      </div>
      
      <!-- Pagination -->
      <app-pagination
        *ngIf="movies.length > 0 && totalPages > 1"
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        [totalResults]="totalResults"
        [pageSize]="pageSize"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
      ></app-pagination>
    </div>
  `,
  styles: [`
    .movie-list-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .movies-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      justify-items: center;
      margin-bottom: 40px;
    }
    
    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      min-height: 400px;
    }
    
    .error-icon,
    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
      opacity: 0.6;
    }
    
    .error-icon {
      color: #f44336;
    }
    
    .empty-icon {
      color: #9e9e9e;
    }
    
    .error-state h3,
    .empty-state h3 {
      margin: 0 0 12px 0;
      font-size: 24px;
      font-weight: 500;
    }
    
    .error-state p,
    .empty-state p {
      margin: 0 0 24px 0;
      color: #666;
      max-width: 400px;
      line-height: 1.5;
    }
    
    .load-more-container {
      display: flex;
      justify-content: center;
      margin: 40px 0;
    }
    
    .load-more-btn {
      padding: 12px 32px;
      font-size: 16px;
    }
    
    .loading-more {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 40px;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .movie-list-container {
        padding: 16px;
      }
      
      .movies-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
      
      .error-state,
      .empty-state {
        padding: 40px 20px;
        min-height: 300px;
      }
      
      .error-icon,
      .empty-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
    }
    
    @media (max-width: 480px) {
      .movies-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MovieListComponent implements OnInit, OnDestroy {
  @Input() movies: Movie[] = [];
  @Input() loading = false;
  @Input() error: string | null = null;
  @Input() currentPage = 1;
  @Input() totalPages = 0;
  @Input() totalResults = 0;
  @Input() pageSize = 20;
  @Input() hasNextPage = false;
  @Input() hasPreviousPage = false;
  
  @Output() movieSelect = new EventEmitter<Movie>();
  @Output() toggleFavorite = new EventEmitter<Movie>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  
  private destroy$ = new Subject<void>();
  private favorites = new Set<number>();
  
  constructor(
    private tmdbService: TmdbService,
    private movieState: MovieStateService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.subscribeToState();
    this.loadInitialMovies();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private subscribeToState(): void {
    combineLatest([
      this.movieState.movies$,
      this.movieState.loading$,
      this.movieState.error$,
      this.movieState.pagination$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([movies, loading, error, pagination]) => {
      this.movies = movies;
      this.loading = loading;
      this.error = error;
      this.currentPage = pagination.currentPage;
      this.totalPages = pagination.totalPages;
      this.totalResults = pagination.totalResults || 0;
      this.hasNextPage = pagination.hasNext;
      this.hasPreviousPage = pagination.hasPrevious;
    });
  }
  
  private loadInitialMovies(): void {
    this.movieState.setLoading(true);
    this.movieState.setCategory('popular');
    
    this.tmdbService.getPopularMovies(1).subscribe({
      next: (response) => {
        this.movieState.setMovies(response);
      },
      error: (error) => {
        this.movieState.setError('Failed to load movies. Please try again.');
        console.error('Error loading movies:', error);
      }
    });
  }
  
  trackByMovieId(index: number, movie: Movie): number {
    return movie.id;
  }
  
  isFavorite(movie: Movie): boolean {
    return this.favorites.has(movie.id);
  }
  
  onViewDetails(movie: Movie): void {
    this.movieSelect.emit(movie);
  }
  
  onToggleFavorite(movie: Movie): void {
    this.toggleFavorite.emit(movie);
    if (this.favorites.has(movie.id)) {
      this.favorites.delete(movie.id);
      this.snackBar.open(`Removed "${movie.title}" from favorites`, 'Close', {
        duration: 3000
      });
    } else {
      this.favorites.add(movie.id);
      this.snackBar.open(`Added "${movie.title}" to favorites`, 'Close', {
        duration: 3000
      });
    }
  }
  
  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
  
  onPageSizeChange(newPageSize: number): void {
    this.pageSizeChange.emit(newPageSize);
  }
  
  onNextPage(): void {
    if (this.hasNextPage) {
      this.loadMoviesForPage(this.currentPage + 1);
    }
  }
  
  onPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.loadMoviesForPage(this.currentPage - 1);
    }
  }
  
  loadMore(): void {
    if (this.hasNextPage && !this.loading) {
      this.loadMoviesForPage(this.currentPage + 1, true);
    }
  }
  
  private loadMoviesForPage(page: number, append: boolean = false): void {
    this.movieState.setLoading(true);
    this.movieState.setCurrentPage(page);
    
    const currentState = this.movieState.getCurrentState();
    let request$;
    
    switch (currentState.category) {
      case 'search':
        request$ = this.tmdbService.searchMovies(currentState.searchQuery, page);
        break;
      case 'now_playing':
        request$ = this.tmdbService.getNowPlayingMovies(page);
        break;
      case 'top_rated':
        request$ = this.tmdbService.getTopRatedMovies(page);
        break;
      case 'upcoming':
        request$ = this.tmdbService.getUpcomingMovies(page);
        break;
      default:
        request$ = this.tmdbService.getPopularMovies(page);
    }
    
    request$.subscribe({
      next: (response) => {
        this.movieState.setMovies(response, append);
      },
      error: (error) => {
        this.movieState.setError('Failed to load movies. Please try again.');
        console.error('Error loading movies:', error);
      }
    });
  }
  
  retry(): void {
    this.movieState.clearError();
    this.loadInitialMovies();
  }
}