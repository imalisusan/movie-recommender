import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number;
  budget: number;
  revenue: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string;
  homepage: string;
  imdb_id: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
  order: number;
}

export interface Crew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string;
}

export interface Credits {
  cast: Cast[];
  crew: Crew[];
}

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private readonly baseUrl = environment.tmdbBaseUrl;
  private readonly imageBaseUrl = environment.tmdbImageBaseUrl;
  private readonly apiKey = environment.tmdbApiKey;
  
  private cache = new Map<string, any>();
  private readonly cacheExpiry = 5 * 60 * 1000;

  constructor(private http: HttpClient) {}


  getPopularMovies(page: number = 1): Observable<TMDBResponse<Movie>> {
    const cacheKey = `popular_movies_${page}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());

    return this.http.get<TMDBResponse<Movie>>(`${this.baseUrl}/movie/popular`, { params })
      .pipe(
        tap(response => this.setCache(cacheKey, response)),
        catchError(this.handleError<TMDBResponse<Movie>>('getPopularMovies'))
      );
  }

  /**
   * Search movies by query
   */
  searchMovies(query: string, page: number = 1): Observable<TMDBResponse<Movie>> {
    const cacheKey = `search_${query}_${page}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString());

    return this.http.get<TMDBResponse<Movie>>(`${this.baseUrl}/search/movie`, { params })
      .pipe(
        tap(response => this.setCache(cacheKey, response)),
        catchError(this.handleError<TMDBResponse<Movie>>('searchMovies'))
      );
  }

  /**
   * Get movie details by ID
   */
  getMovieDetails(movieId: number): Observable<MovieDetails> {
    const cacheKey = `movie_details_${movieId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    const params = new HttpParams().set('api_key', this.apiKey);

    return this.http.get<MovieDetails>(`${this.baseUrl}/movie/${movieId}`, { params })
      .pipe(
        tap(response => this.setCache(cacheKey, response)),
        catchError(this.handleError<MovieDetails>('getMovieDetails'))
      );
  }

  /**
   * Get movie credits (cast and crew)
   */
  getMovieCredits(movieId: number): Observable<Credits> {
    const cacheKey = `movie_credits_${movieId}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    const params = new HttpParams().set('api_key', this.apiKey);

    return this.http.get<Credits>(`${this.baseUrl}/movie/${movieId}/credits`, { params })
      .pipe(
        tap(response => this.setCache(cacheKey, response)),
        catchError(this.handleError<Credits>('getMovieCredits'))
      );
  }

  /**
   * Get now playing movies
   */
  getNowPlayingMovies(page: number = 1): Observable<TMDBResponse<Movie>> {
    const cacheKey = `now_playing_${page}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());

    return this.http.get<TMDBResponse<Movie>>(`${this.baseUrl}/movie/now_playing`, { params })
      .pipe(
        tap(response => this.setCache(cacheKey, response)),
        catchError(this.handleError<TMDBResponse<Movie>>('getNowPlayingMovies'))
      );
  }

  /**
   * Get top rated movies
   */
  getTopRatedMovies(page: number = 1): Observable<TMDBResponse<Movie>> {
    const cacheKey = `top_rated_${page}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());

    return this.http.get<TMDBResponse<Movie>>(`${this.baseUrl}/movie/top_rated`, { params })
      .pipe(
        tap(response => this.setCache(cacheKey, response)),
        catchError(this.handleError<TMDBResponse<Movie>>('getTopRatedMovies'))
      );
  }

  /**
   * Get upcoming movies
   */
  getUpcomingMovies(page: number = 1): Observable<TMDBResponse<Movie>> {
    const cacheKey = `upcoming_${page}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return of(cached);
    }

    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('page', page.toString());

    return this.http.get<TMDBResponse<Movie>>(`${this.baseUrl}/movie/upcoming`, { params })
      .pipe(
        tap(response => this.setCache(cacheKey, response)),
        catchError(this.handleError<TMDBResponse<Movie>>('getUpcomingMovies'))
      );
  }

  /**
   * Get full image URL
   */
  getImageUrl(path: string, size: string = 'w500'): string {
    if (!path) return '';
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  /**
   * Get poster URL
   */
  getPosterUrl(path: string, size: string = 'w500'): string {
    return this.getImageUrl(path, size);
  }

  /**
   * Get backdrop URL
   */
  getBackdropUrl(path: string, size: string = 'w1280'): string {
    return this.getImageUrl(path, size);
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Error handling
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}