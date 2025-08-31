import { TestBed } from '@angular/core/testing';
import { MovieStateService, MovieState } from './movie-state.service';
import { Movie, MovieDetails, TMDBResponse } from './tmdb.service';
import { take } from 'rxjs/operators';

describe('MovieStateService', () => {
  let service: MovieStateService;
  
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
    genres: [{ id: 28, name: 'Action' }],
    runtime: 120,
    budget: 100000000,
    revenue: 500000000,
    production_companies: [],
    production_countries: [],
    spoken_languages: [],
    status: 'Released',
    tagline: 'Test tagline',
    homepage: 'https://test-movie.com',
    imdb_id: 'tt1234567'
  };
  
  const mockTMDBResponse: TMDBResponse<Movie> = {
    page: 1,
    results: [mockMovie],
    total_pages: 10,
    total_results: 200
  };
  
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MovieStateService]
    });
    service = TestBed.inject(MovieStateService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      service.getState().pipe(take(1)).subscribe(state => {
        expect(state).toEqual(initialState);
      });
    });

    it('should return current state value', () => {
      const currentState = service.getCurrentState();
      expect(currentState).toEqual(initialState);
    });
  });

  describe('Loading State', () => {
    it('should set loading state to true', () => {
      service.setLoading(true);
      
      service.loading$.pipe(take(1)).subscribe(loading => {
        expect(loading).toBe(true);
      });
    });

    it('should set loading state to false', () => {
      service.setLoading(true);
      service.setLoading(false);
      
      service.loading$.pipe(take(1)).subscribe(loading => {
        expect(loading).toBe(false);
      });
    });
  });

  describe('Error State', () => {
    it('should set error message and stop loading', () => {
      const errorMessage = 'Test error';
      service.setLoading(true);
      service.setError(errorMessage);
      
      service.error$.pipe(take(1)).subscribe(error => {
        expect(error).toBe(errorMessage);
      });
      
      service.loading$.pipe(take(1)).subscribe(loading => {
        expect(loading).toBe(false);
      });
    });

    it('should clear error', () => {
      service.setError('Test error');
      service.clearError();
      
      service.error$.pipe(take(1)).subscribe(error => {
        expect(error).toBeNull();
      });
    });
  });

  describe('Movies Management', () => {
    it('should set movies from API response', () => {
      service.setMovies(mockTMDBResponse);
      
      service.movies$.pipe(take(1)).subscribe(movies => {
        expect(movies).toEqual([mockMovie]);
      });
      
      service.currentPage$.pipe(take(1)).subscribe(page => {
        expect(page).toBe(1);
      });
      
      service.totalPages$.pipe(take(1)).subscribe(totalPages => {
        expect(totalPages).toBe(10);
      });
      
      service.totalResults$.pipe(take(1)).subscribe(totalResults => {
        expect(totalResults).toBe(200);
      });
    });

    it('should append movies when append flag is true', () => {
      const firstResponse: TMDBResponse<Movie> = {
        page: 1,
        results: [mockMovie],
        total_pages: 10,
        total_results: 200
      };
      
      const secondMovie: Movie = { ...mockMovie, id: 2, title: 'Second Movie' };
      const secondResponse: TMDBResponse<Movie> = {
        page: 2,
        results: [secondMovie],
        total_pages: 10,
        total_results: 200
      };
      
      service.setMovies(firstResponse);
      service.setMovies(secondResponse, true);
      
      service.movies$.pipe(take(1)).subscribe(movies => {
        expect(movies.length).toBe(2);
        expect(movies[0]).toEqual(mockMovie);
        expect(movies[1]).toEqual(secondMovie);
      });
    });

    it('should replace movies when append flag is false', () => {
      const firstResponse: TMDBResponse<Movie> = {
        page: 1,
        results: [mockMovie],
        total_pages: 10,
        total_results: 200
      };
      
      const secondMovie: Movie = { ...mockMovie, id: 2, title: 'Second Movie' };
      const secondResponse: TMDBResponse<Movie> = {
        page: 2,
        results: [secondMovie],
        total_pages: 10,
        total_results: 200
      };
      
      service.setMovies(firstResponse);
      service.setMovies(secondResponse, false);
      
      service.movies$.pipe(take(1)).subscribe(movies => {
        expect(movies.length).toBe(1);
        expect(movies[0]).toEqual(secondMovie);
      });
    });
  });

  describe('Selected Movie', () => {
    it('should set selected movie', () => {
      service.setSelectedMovie(mockMovieDetails);
      
      service.selectedMovie$.pipe(take(1)).subscribe(movie => {
        expect(movie).toEqual(mockMovieDetails);
      });
    });

    it('should clear selected movie', () => {
      service.setSelectedMovie(mockMovieDetails);
      service.setSelectedMovie(null);
      
      service.selectedMovie$.pipe(take(1)).subscribe(movie => {
        expect(movie).toBeNull();
      });
    });
  });

  describe('Search Query', () => {
    it('should set search query and reset page to 1', () => {
      service.setCurrentPage(5);
      service.setSearchQuery('test query');
      
      service.searchQuery$.pipe(take(1)).subscribe(query => {
        expect(query).toBe('test query');
      });
      
      service.currentPage$.pipe(take(1)).subscribe(page => {
        expect(page).toBe(1);
      });
    });
  });

  describe('Category Management', () => {
    it('should set category and reset state', () => {
      service.setMovies(mockTMDBResponse);
      service.setCurrentPage(3);
      service.setCategory('top_rated');
      
      service.category$.pipe(take(1)).subscribe(category => {
        expect(category).toBe('top_rated');
      });
      
      service.currentPage$.pipe(take(1)).subscribe(page => {
        expect(page).toBe(1);
      });
      
      service.movies$.pipe(take(1)).subscribe(movies => {
        expect(movies).toEqual([]);
      });
    });

    it('should preserve search query when setting search category', () => {
      service.setSearchQuery('test query');
      service.setCategory('search');
      
      service.searchQuery$.pipe(take(1)).subscribe(query => {
        expect(query).toBe('test query');
      });
    });

    it('should clear search query when setting non-search category', () => {
      service.setSearchQuery('test query');
      service.setCategory('popular');
      
      service.searchQuery$.pipe(take(1)).subscribe(query => {
        expect(query).toBe('');
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      const response: TMDBResponse<Movie> = {
        page: 3,
        results: [mockMovie],
        total_pages: 10,
        total_results: 200
      };
      service.setMovies(response);
    });

    it('should set current page', () => {
      service.setCurrentPage(5);
      
      service.currentPage$.pipe(take(1)).subscribe(page => {
        expect(page).toBe(5);
      });
    });

    it('should calculate hasNextPage correctly', () => {
      service.hasNextPage$.pipe(take(1)).subscribe(hasNext => {
        expect(hasNext).toBe(true); // page 3 of 10
      });
      
      service.setCurrentPage(10);
      service.hasNextPage$.pipe(take(1)).subscribe(hasNext => {
        expect(hasNext).toBe(false); // page 10 of 10
      });
    });

    it('should calculate hasPreviousPage correctly', () => {
      service.hasPreviousPage$.pipe(take(1)).subscribe(hasPrevious => {
        expect(hasPrevious).toBe(true); // page 3
      });
      
      service.setCurrentPage(1);
      service.hasPreviousPage$.pipe(take(1)).subscribe(hasPrevious => {
        expect(hasPrevious).toBe(false); // page 1
      });
    });

    it('should provide complete pagination info', () => {
      service.pagination$.pipe(take(1)).subscribe(pagination => {
        expect(pagination).toEqual({
          currentPage: 3,
          totalPages: 10,
          totalResults: 200,
          hasNext: true,
          hasPrevious: true
        });
      });
    });
  });

  describe('State Reset', () => {
    it('should reset state to initial values', () => {
      service.setMovies(mockTMDBResponse);
      service.setSelectedMovie(mockMovieDetails);
      service.setSearchQuery('test');
      service.setLoading(true);
      service.setError('test error');
      service.setCategory('search');
      
      service.reset();
      
      service.getState().pipe(take(1)).subscribe(state => {
        expect(state).toEqual(initialState);
      });
    });
  });

  describe('Observable Selectors', () => {
    it('should emit state changes through observables', () => {
      let movieCount = 0;
      let loadingStates: boolean[] = [];
      
      service.movies$.subscribe(movies => {
        movieCount = movies.length;
      });
      
      service.loading$.subscribe(loading => {
        loadingStates.push(loading);
      });
      
      service.setLoading(true);
      service.setMovies(mockTMDBResponse);
      
      expect(movieCount).toBe(1);
      expect(loadingStates).toContain(true);
      expect(loadingStates).toContain(false); // setMovies sets loading to false
    });
  });
});