import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MovieListComponent } from './components/movie-list/movie-list.component';
import { MovieDetailsComponent } from './components/movie-details/movie-details.component';
import { SearchComponent } from './components/search/search.component';
import { AuthComponent } from './components/auth/auth.component';
import { TmdbService, Movie, MovieDetails, Cast, Crew, TMDBResponse } from './services/tmdb.service';
import { AuthService } from './services/auth.service';
import { MovieStateService } from './services/movie-state.service';
import { Subject, takeUntil, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MovieListComponent,
    MovieDetailsComponent,
    SearchComponent,
    AuthComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  currentView: 'movies' | 'search' | 'favorites' = 'movies';
  selectedCategory: string = 'popular';
  
  // Movie data
  movies: Movie[] = [];
  searchResults: Movie[] = [];
  favorites: Movie[] = [];
  selectedMovie: Movie | null = null;
  selectedMovieDetails: MovieDetails | null = null;
  selectedMovieCast: Cast[] = [];
  selectedMovieCrew: Crew[] = [];
  
  // UI state
  loading: boolean = false;
  error: string | null = null;
  movieDetailsLoading: boolean = false;
  movieDetailsError: string | null = null;
  
  // Pagination
  currentPage: number = 1;
  totalPages: number = 1;
  totalResults: number = 0;
  pageSize: number = 20;
  
  // Authentication
  isAuthenticated: boolean = false;
  showAuthModal: boolean = false;
  
  movieCategories = [
    { key: 'popular', label: 'Popular' },
    { key: 'now_playing', label: 'Now Playing' },
    { key: 'top_rated', label: 'Top Rated' },
    { key: 'upcoming', label: 'Upcoming' }
  ];
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private tmdbService: TmdbService,
    private authService: AuthService,
    private movieStateService: MovieStateService
  ) {}
  
  ngOnInit(): void {
    // Subscribe to authentication state
    this.authService.user$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.isAuthenticated = !!user;
      this.showAuthModal = false; // Hide auth modal when user state changes
      if (this.isAuthenticated) {
        this.loadFavorites();
      }
    });
    
    this.loadMovies();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  setView(view: 'movies' | 'search' | 'favorites'): void {
    this.currentView = view;
    if (view === 'movies') {
      this.loadMovies();
    } else if (view === 'favorites') {
      this.loadFavorites();
    }
  }
  
  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.loadMovies();
  }
  
  async loadMovies(): Promise<void> {
    this.loading = true;
    this.error = null;
    
    try {
      const response = await this.getMoviesByCategory(this.selectedCategory, this.currentPage).toPromise();
      if (response) {
        this.movies = response.results;
        this.totalPages = Math.min(response.total_pages, 500); // TMDB limits to 500 pages
        this.totalResults = response.total_results;
      }
    } catch (error) {
      this.error = 'Failed to load movies. Please try again.';
      console.error('Error loading movies:', error);
    } finally {
      this.loading = false;
    }
  }
  
  private getMoviesByCategory(category: string, page: number): Observable<TMDBResponse<Movie>> {
    switch (category) {
      case 'popular':
        return this.tmdbService.getPopularMovies(page);
      case 'now_playing':
        return this.tmdbService.getNowPlayingMovies(page);
      case 'top_rated':
        return this.tmdbService.getTopRatedMovies(page);
      case 'upcoming':
        return this.tmdbService.getUpcomingMovies(page);
      default:
        return this.tmdbService.getPopularMovies(page);
    }
  }
  
  async onSearch(query: string): Promise<void> {
    this.loading = true;
    this.error = null;
    this.currentPage = 1;
    
    try {
      const response = await this.tmdbService.searchMovies(query, this.currentPage).toPromise();
      if (response) {
        this.searchResults = response.results;
        this.totalPages = Math.min(response.total_pages, 500);
        this.totalResults = response.total_results;
      }
    } catch (error) {
      this.error = 'Failed to search movies. Please try again.';
      console.error('Error searching movies:', error);
    } finally {
      this.loading = false;
    }
  }
  
  onClearSearch(): void {
    this.searchResults = [];
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalResults = 0;
  }
  
  async onPageChange(page: number): Promise<void> {
    this.currentPage = page;
    if (this.currentView === 'search' && this.searchResults.length > 0) {
      // Re-run search with new page
      const lastQuery = ''; // You might want to store the last search query
      await this.onSearch(lastQuery);
    } else {
      await this.loadMovies();
    }
  }
  
  async onPageSizeChange(newPageSize: number): Promise<void> {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    await this.loadMovies();
  }
  
  async onMovieSelect(movie: Movie): Promise<void> {
    this.selectedMovie = movie;
    await this.loadMovieDetails(movie.id);
  }
  
  async loadMovieDetails(movieId: number): Promise<void> {
    this.movieDetailsLoading = true;
    this.movieDetailsError = null;
    
    try {
      const [details, credits] = await Promise.all([
        this.tmdbService.getMovieDetails(movieId).toPromise(),
        this.tmdbService.getMovieCredits(movieId).toPromise()
      ]);
      
      if (details && credits) {
        this.selectedMovieDetails = details;
        this.selectedMovieCast = credits.cast;
        this.selectedMovieCrew = credits.crew;
      }
    } catch (error) {
      this.movieDetailsError = 'Failed to load movie details. Please try again.';
      console.error('Error loading movie details:', error);
    } finally {
      this.movieDetailsLoading = false;
    }
  }
  
  closeMovieDetails(): void {
    this.selectedMovie = null;
    this.selectedMovieDetails = null;
    this.selectedMovieCast = [];
    this.selectedMovieCrew = [];
    this.movieDetailsError = null;
  }
  
  onToggleFavorite(movie: Movie): void {
    const isFavorite = this.isMovieFavorite(movie);
    
    if (isFavorite) {
      this.favorites = this.favorites.filter(fav => fav.id !== movie.id);
    } else {
      this.favorites.push(movie);
    }
    
    this.saveFavorites();
  }
  
  isMovieFavorite(movie: Movie): boolean {
    return this.favorites.some(fav => fav.id === movie.id);
  }
  
  private loadFavorites(): void {
    try {
      const saved = localStorage.getItem('movieapp_favorites');
      if (saved) {
        this.favorites = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load favorites:', error);
      this.favorites = [];
    }
  }
  
  private saveFavorites(): void {
    try {
      localStorage.setItem('movieapp_favorites', JSON.stringify(this.favorites));
    } catch (error) {
      console.warn('Failed to save favorites:', error);
    }
  }
  
  showAuthForm(): void {
    this.showAuthModal = true;
  }
  
  hideAuthForm(): void {
    this.showAuthModal = false;
  }
  
  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }
}
