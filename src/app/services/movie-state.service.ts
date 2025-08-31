import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Movie, MovieDetails, TMDBResponse } from './tmdb.service';

export interface MovieState {
  movies: Movie[];
  selectedMovie: MovieDetails | null;
  searchQuery: string;
  currentPage: number;
  totalPages: number;
  totalResults: number;
  loading: boolean;
  error: string | null;
  category: 'popular' | 'now_playing' | 'top_rated' | 'upcoming' | 'search';
}

const initialState: MovieState = {
  movies: [],
  selectedMovie: null,
  searchQuery: '',
  currentPage: 1,
  totalPages: 0,
  totalResults: 0,
  loading: false,
  error: null,
  category: 'popular'
};

@Injectable({
  providedIn: 'root'
})
export class MovieStateService {
  private state$ = new BehaviorSubject<MovieState>(initialState);

  constructor() {}

  /**
   * Get current state
   */
  getState(): Observable<MovieState> {
    return this.state$.asObservable();
  }

  /**
   * Get current state value
   */
  getCurrentState(): MovieState {
    return this.state$.value;
  }

  /**
   * Update state
   */
  private updateState(partialState: Partial<MovieState>): void {
    const currentState = this.getCurrentState();
    const newState = { ...currentState, ...partialState };
    this.state$.next(newState);
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  /**
   * Set error
   */
  setError(error: string | null): void {
    this.updateState({ error, loading: false });
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Set movies from API response
   */
  setMovies(response: TMDBResponse<Movie>, append: boolean = false): void {
    const currentMovies = this.getCurrentState().movies;
    const movies = append ? [...currentMovies, ...response.results] : response.results;
    
    this.updateState({
      movies,
      currentPage: response.page,
      totalPages: response.total_pages,
      totalResults: response.total_results,
      loading: false,
      error: null
    });
  }

  /**
   * Set selected movie
   */
  setSelectedMovie(movie: MovieDetails | null): void {
    this.updateState({ selectedMovie: movie });
  }

  /**
   * Set search query
   */
  setSearchQuery(searchQuery: string): void {
    this.updateState({ searchQuery, currentPage: 1 });
  }

  /**
   * Set category
   */
  setCategory(category: MovieState['category']): void {
    this.updateState({ 
      category, 
      currentPage: 1, 
      movies: [], 
      searchQuery: category === 'search' ? this.getCurrentState().searchQuery : '' 
    });
  }

  /**
   * Set current page
   */
  setCurrentPage(page: number): void {
    this.updateState({ currentPage: page });
  }

  /**
   * Reset state
   */
  reset(): void {
    this.state$.next(initialState);
  }

  /**
   * Selectors
   */
  get movies$(): Observable<Movie[]> {
    return this.state$.pipe(map(state => state.movies));
  }

  get selectedMovie$(): Observable<MovieDetails | null> {
    return this.state$.pipe(map(state => state.selectedMovie));
  }

  get loading$(): Observable<boolean> {
    return this.state$.pipe(map(state => state.loading));
  }

  get error$(): Observable<string | null> {
    return this.state$.pipe(map(state => state.error));
  }

  get searchQuery$(): Observable<string> {
    return this.state$.pipe(map(state => state.searchQuery));
  }

  get currentPage$(): Observable<number> {
    return this.state$.pipe(map(state => state.currentPage));
  }

  get totalPages$(): Observable<number> {
    return this.state$.pipe(map(state => state.totalPages));
  }

  get totalResults$(): Observable<number> {
    return this.state$.pipe(map(state => state.totalResults));
  }

  get category$(): Observable<MovieState['category']> {
    return this.state$.pipe(map(state => state.category));
  }

  get hasNextPage$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.currentPage < state.totalPages)
    );
  }

  get hasPreviousPage$(): Observable<boolean> {
    return this.state$.pipe(
      map(state => state.currentPage > 1)
    );
  }

  get pagination$(): Observable<{currentPage: number, totalPages: number, totalResults: number, hasNext: boolean, hasPrevious: boolean}> {
    return combineLatest([
      this.currentPage$,
      this.totalPages$,
      this.totalResults$,
      this.hasNextPage$,
      this.hasPreviousPage$
    ]).pipe(
      map(([currentPage, totalPages, totalResults, hasNext, hasPrevious]) => ({
        currentPage,
        totalPages,
        totalResults,
        hasNext,
        hasPrevious
      }))
    );
  }
}