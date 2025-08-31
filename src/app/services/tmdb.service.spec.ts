import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TmdbService, Movie, MovieDetails, Credits, TMDBResponse } from './tmdb.service';
import { environment } from '../../environments/environment';

describe('TmdbService', () => {
  let service: TmdbService;
  let httpMock: HttpTestingController;
  
  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test overview',
    poster_path: '/test-poster.jpg',
    backdrop_path: '/test-backdrop.jpg',
    release_date: '2023-01-01',
    vote_average: 8.5,
    vote_count: 1000,
    genre_ids: [28, 12],
    adult: false,
    original_language: 'en',
    original_title: 'Test Movie',
    popularity: 100.5,
    video: false
  };
  
  const mockMovieDetails: MovieDetails = {
    ...mockMovie,
    genres: [{ id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }],
    runtime: 120,
    budget: 100000000,
    revenue: 500000000,
    production_companies: [{
      id: 1,
      logo_path: '/logo.jpg',
      name: 'Test Studios',
      origin_country: 'US'
    }],
    production_countries: [{
      iso_3166_1: 'US',
      name: 'United States of America'
    }],
    spoken_languages: [{
      english_name: 'English',
      iso_639_1: 'en',
      name: 'English'
    }],
    status: 'Released',
    tagline: 'Test tagline',
    homepage: 'https://test-movie.com',
    imdb_id: 'tt1234567'
  };
  
  const mockCredits: Credits = {
    cast: [{
      id: 1,
      name: 'Test Actor',
      character: 'Test Character',
      profile_path: '/actor.jpg',
      order: 0
    }],
    crew: [{
      id: 2,
      name: 'Test Director',
      job: 'Director',
      department: 'Directing',
      profile_path: '/director.jpg'
    }]
  };
  
  const mockTMDBResponse: TMDBResponse<Movie> = {
    page: 1,
    results: [mockMovie],
    total_pages: 10,
    total_results: 200
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TmdbService]
    });
    service = TestBed.inject(TmdbService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    service.clearCache();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPopularMovies', () => {
    it('should fetch popular movies', () => {
      service.getPopularMovies(1).subscribe(response => {
        expect(response).toEqual(mockTMDBResponse);
        expect(response.results.length).toBe(1);
        expect(response.results[0].title).toBe('Test Movie');
      });

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTMDBResponse);
    });

    it('should use default page 1 when no page specified', () => {
      service.getPopularMovies().subscribe();

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTMDBResponse);
    });

    it('should return cached data on second call', () => {
      // First call
      service.getPopularMovies(1).subscribe();
      const req1 = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
      );
      req1.flush(mockTMDBResponse);

      // Second call should use cache
      service.getPopularMovies(1).subscribe(response => {
        expect(response).toEqual(mockTMDBResponse);
      });

      // No additional HTTP request should be made
      httpMock.expectNone(
        `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
      );
    });
  });

  describe('searchMovies', () => {
    it('should search movies by query', () => {
      const query = 'test movie';
      
      service.searchMovies(query, 1).subscribe(response => {
        expect(response).toEqual(mockTMDBResponse);
      });

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/search/movie?api_key=${environment.tmdbApiKey}&query=${encodeURIComponent(query)}&page=1`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTMDBResponse);
    });

    it('should use default page 1 when no page specified', () => {
      const query = 'test';
      
      service.searchMovies(query).subscribe();

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/search/movie?api_key=${environment.tmdbApiKey}&query=${query}&page=1`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTMDBResponse);
    });
  });

  describe('getMovieDetails', () => {
    it('should fetch movie details by ID', () => {
      const movieId = 123;
      
      service.getMovieDetails(movieId).subscribe(response => {
        expect(response).toEqual(mockMovieDetails);
        expect(response.id).toBe(1);
        expect(response.genres.length).toBe(2);
      });

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/${movieId}?api_key=${environment.tmdbApiKey}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockMovieDetails);
    });
  });

  describe('getMovieCredits', () => {
    it('should fetch movie credits by ID', () => {
      const movieId = 123;
      
      service.getMovieCredits(movieId).subscribe(response => {
        expect(response).toEqual(mockCredits);
        expect(response.cast.length).toBe(1);
        expect(response.crew.length).toBe(1);
      });

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/${movieId}/credits?api_key=${environment.tmdbApiKey}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockCredits);
    });
  });

  describe('getNowPlayingMovies', () => {
    it('should fetch now playing movies', () => {
      service.getNowPlayingMovies(1).subscribe(response => {
        expect(response).toEqual(mockTMDBResponse);
      });

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/now_playing?api_key=${environment.tmdbApiKey}&page=1`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTMDBResponse);
    });
  });

  describe('getTopRatedMovies', () => {
    it('should fetch top rated movies', () => {
      service.getTopRatedMovies(2).subscribe(response => {
        expect(response).toEqual(mockTMDBResponse);
      });

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/top_rated?api_key=${environment.tmdbApiKey}&page=2`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTMDBResponse);
    });
  });

  describe('getUpcomingMovies', () => {
    it('should fetch upcoming movies', () => {
      service.getUpcomingMovies(3).subscribe(response => {
        expect(response).toEqual(mockTMDBResponse);
      });

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/upcoming?api_key=${environment.tmdbApiKey}&page=3`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTMDBResponse);
    });
  });

  describe('Image URL methods', () => {
    beforeEach(() => {
      // Mock environment values for testing
      (environment as any).tmdbImageBaseUrl = 'https://image.tmdb.org/t/p';
    });

    describe('getImageUrl', () => {
      it('should return correct image URL with default size', () => {
        const path = '/test-image.jpg';
        const result = service.getImageUrl(path);
        expect(result).toBe('https://image.tmdb.org/t/p/w500/test-image.jpg');
      });

      it('should return correct image URL with custom size', () => {
        const path = '/test-image.jpg';
        const size = 'w300';
        const result = service.getImageUrl(path, size);
        expect(result).toBe('https://image.tmdb.org/t/p/w300/test-image.jpg');
      });

      it('should return empty string for empty path', () => {
        const result = service.getImageUrl('');
        expect(result).toBe('');
      });

      it('should return empty string for null path', () => {
        const result = service.getImageUrl(null as any);
        expect(result).toBe('');
      });
    });

    describe('getPosterUrl', () => {
      it('should return correct poster URL', () => {
        const path = '/poster.jpg';
        const result = service.getPosterUrl(path);
        expect(result).toBe('https://image.tmdb.org/t/p/w500/poster.jpg');
      });

      it('should return correct poster URL with custom size', () => {
        const path = '/poster.jpg';
        const size = 'w300';
        const result = service.getPosterUrl(path, size);
        expect(result).toBe('https://image.tmdb.org/t/p/w300/poster.jpg');
      });
    });

    describe('getBackdropUrl', () => {
      it('should return correct backdrop URL with default size', () => {
        const path = '/backdrop.jpg';
        const result = service.getBackdropUrl(path);
        expect(result).toBe('https://image.tmdb.org/t/p/w1280/backdrop.jpg');
      });

      it('should return correct backdrop URL with custom size', () => {
        const path = '/backdrop.jpg';
        const size = 'w780';
        const result = service.getBackdropUrl(path, size);
        expect(result).toBe('https://image.tmdb.org/t/p/w780/backdrop.jpg');
      });
    });
  });

  describe('Cache functionality', () => {
    it('should clear cache', () => {
      // First call to populate cache
      service.getPopularMovies(1).subscribe();
      const req1 = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
      );
      req1.flush(mockTMDBResponse);

      // Clear cache
      service.clearCache();

      // Second call should make new HTTP request
      service.getPopularMovies(1).subscribe();
      const req2 = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
      );
      req2.flush(mockTMDBResponse);
    });
  });

  describe('Error handling', () => {
    it('should handle HTTP errors gracefully', () => {
      service.getPopularMovies(1).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/movie/popular?api_key=${environment.tmdbApiKey}&page=1`
      );
      req.error(new ErrorEvent('Network error'));
    });

    it('should handle search errors gracefully', () => {
      service.searchMovies('test').subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(
        `${environment.tmdbBaseUrl}/search/movie?api_key=${environment.tmdbApiKey}&query=test&page=1`
      );
      req.error(new ErrorEvent('Network error'));
    });
  });
});