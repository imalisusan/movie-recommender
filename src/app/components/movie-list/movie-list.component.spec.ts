import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, BehaviorSubject } from 'rxjs';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { MovieListComponent } from './movie-list.component';
import { TmdbService, Movie } from '../../services/tmdb.service';
import { MovieStateService } from '../../services/movie-state.service';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { LoaderComponent } from '../loader/loader.component';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let compiled: HTMLElement;
  let mockTmdbService: jasmine.SpyObj<TmdbService>;
  let mockMovieStateService: jasmine.SpyObj<MovieStateService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Test Movie 1',
      overview: 'Test overview 1',
      poster_path: '/test1.jpg',
      backdrop_path: '/backdrop1.jpg',
      release_date: '2023-01-01',
      vote_average: 8.5,
      vote_count: 1000,
      genre_ids: [28, 12],
      adult: false,
      original_language: 'en',
      original_title: 'Test Movie 1',
      popularity: 100,
      video: false
    },
    {
      id: 2,
      title: 'Test Movie 2',
      overview: 'Test overview 2',
      poster_path: '/test2.jpg',
      backdrop_path: '/backdrop2.jpg',
      release_date: '2023-02-01',
      vote_average: 7.5,
      vote_count: 800,
      genre_ids: [35, 18],
      adult: false,
      original_language: 'en',
      original_title: 'Test Movie 2',
      popularity: 90,
      video: false
    }
  ];

  const mockStateSubject = new BehaviorSubject({
    movies: mockMovies,
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 5,
    totalResults: 100,
    searchQuery: '',
    category: 'popular',
    selectedMovie: null
  });

  beforeEach(async () => {
    const tmdbServiceSpy = jasmine.createSpyObj('TmdbService', [
      'getPopularMovies',
      'searchMovies',
      'getNowPlayingMovies',
      'getTopRatedMovies',
      'getUpcomingMovies'
    ]);

    const movieStateServiceSpy = jasmine.createSpyObj('MovieStateService', [
      'getState',
      'setLoading',
      'setError',
      'setMovies',
      'appendMovies',
      'setCurrentPage',
      'setSelectedMovie',
      'setCategory'  // Add this missing method
    ], {
      state$: mockStateSubject.asObservable(),
      movies$: of(mockMovies),
      loading$: of(false),
      error$: of(null),
      currentPage$: of(1),
      totalPages$: of(5),
      totalResults$: of(100),
      hasNextPage$: of(true),
      hasPreviousPage$: of(false)
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        MovieListComponent,
        MovieCardComponent,
        PaginationComponent,
        LoaderComponent,
        MatProgressSpinnerModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatGridListModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: TmdbService, useValue: tmdbServiceSpy },
        { provide: MovieStateService, useValue: movieStateServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    
    mockTmdbService = TestBed.inject(TmdbService) as jasmine.SpyObj<TmdbService>;
    mockMovieStateService = TestBed.inject(MovieStateService) as jasmine.SpyObj<MovieStateService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockSnackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Inputs', () => {
    it('should accept movies input', () => {
      component.movies = mockMovies;
      expect(component.movies).toEqual(mockMovies);
    });

    it('should accept loading input', () => {
      component.loading = true;
      expect(component.loading).toBe(true);
    });

    it('should accept error input', () => {
      component.error = 'Test error';
      expect(component.error).toBe('Test error');
    });

    it('should accept pagination inputs', () => {
      component.currentPage = 2;
      component.totalPages = 10;
      component.totalResults = 200;
      component.pageSize = 20;
      component.hasNextPage = true;
      component.hasPreviousPage = true;

      expect(component.currentPage).toBe(2);
      expect(component.totalPages).toBe(10);
      expect(component.totalResults).toBe(200);
      expect(component.pageSize).toBe(20);
      expect(component.hasNextPage).toBe(true);
      expect(component.hasPreviousPage).toBe(true);
    });
  });

  describe('Display States', () => {
    it('should show loader when loading and no movies', () => {
      component.loading = true;
      component.movies = [];
      fixture.detectChanges();

      const loader = compiled.querySelector('app-loader');
      expect(loader).toBeTruthy();
    });

    it('should show error state when error and no movies', () => {
      component.loading = false;
      component.error = 'Test error message';
      component.movies = [];
      fixture.detectChanges();

      const errorState = compiled.querySelector('.error-state');
      expect(errorState).toBeTruthy();
      expect(errorState?.textContent).toContain('Test error message');
    });

    it('should show empty state when no loading, no error, and no movies', () => {
      component.loading = false;
      component.error = null;
      component.movies = [];
      fixture.detectChanges();

      const emptyState = compiled.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState?.textContent).toContain('No movies found');
    });

    it('should show movies grid when movies are available', () => {
      component.movies = mockMovies;
      component.loading = false;
      component.error = null;
      fixture.detectChanges();

      const moviesGrid = compiled.querySelector('.movies-grid');
      expect(moviesGrid).toBeTruthy();
      
      const movieCards = compiled.querySelectorAll('app-movie-card');
      expect(movieCards.length).toBe(mockMovies.length);
    });

    it('should show load more button when has next page and not loading', () => {
      component.movies = mockMovies;
      component.hasNextPage = true;
      component.loading = false;
      fixture.detectChanges();

      const loadMoreContainer = compiled.querySelector('.load-more-container');
      expect(loadMoreContainer).toBeTruthy();
      
      const loadMoreBtn = compiled.querySelector('.load-more-btn');
      expect(loadMoreBtn).toBeTruthy();
    });

    it('should show loading more indicator when loading and has movies', () => {
      component.movies = mockMovies;
      component.loading = true;
      fixture.detectChanges();

      const loadingMore = compiled.querySelector('.loading-more');
      expect(loadingMore).toBeTruthy();
      expect(loadingMore?.textContent).toContain('Loading more movies');
    });

    it('should show pagination when movies exist and total pages > 1', () => {
      component.movies = mockMovies;
      component.totalPages = 5;
      fixture.detectChanges();

      const pagination = compiled.querySelector('app-pagination');
      expect(pagination).toBeTruthy();
    });

    it('should not show pagination when total pages <= 1', () => {
      component.movies = mockMovies;
      component.totalPages = 1;
      fixture.detectChanges();

      const pagination = compiled.querySelector('app-pagination');
      expect(pagination).toBeFalsy();
    });
  });

  describe('Event Handlers', () => {
    it('should emit movieSelect when onViewDetails is called', () => {
      spyOn(component.movieSelect, 'emit');
      
      component.onViewDetails(mockMovies[0]);
      
      expect(component.movieSelect.emit).toHaveBeenCalledWith(mockMovies[0]);
    });

    it('should navigate to movie details on view details', () => {
      component.onViewDetails(mockMovies[0]);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/movie', mockMovies[0].id]);
    });

    it('should emit toggleFavorite when onToggleFavorite is called', () => {
      spyOn(component.toggleFavorite, 'emit');
      
      component.onToggleFavorite(mockMovies[0]);
      
      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(mockMovies[0]);
    });

    it('should show snackbar message when toggling favorite', () => {
      component.onToggleFavorite(mockMovies[0]);
      
      expect(mockSnackBar.open).toHaveBeenCalled();
    });

    it('should emit pageChange when onPageChange is called', () => {
      spyOn(component.pageChange, 'emit');
      
      component.onPageChange(3);
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(3);
    });

    it('should emit pageSizeChange when onPageSizeChange is called', () => {
      spyOn(component.pageSizeChange, 'emit');
      
      component.onPageSizeChange(40);
      
      expect(component.pageSizeChange.emit).toHaveBeenCalledWith(40);
    });

    it('should handle next page correctly', () => {
      spyOn(component.pageChange, 'emit');
      component.currentPage = 2;
      component.hasNextPage = true;
      
      component.onNextPage();
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(3);
    });

    it('should not go to next page if no next page available', () => {
      spyOn(component.pageChange, 'emit');
      component.currentPage = 5;
      component.hasNextPage = false;
      
      component.onNextPage();
      
      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });

    it('should handle previous page correctly', () => {
      spyOn(component.pageChange, 'emit');
      component.currentPage = 3;
      component.hasPreviousPage = true;
      
      component.onPreviousPage();
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(2);
    });

    it('should not go to previous page if no previous page available', () => {
      spyOn(component.pageChange, 'emit');
      component.currentPage = 1;
      component.hasPreviousPage = false;
      
      component.onPreviousPage();
      
      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });
  });

  describe('Favorites functionality', () => {
    it('should track favorite movies', () => {
      expect(component.isFavorite(mockMovies[0])).toBe(false);
      
      component.onToggleFavorite(mockMovies[0]);
      
      expect(component.isFavorite(mockMovies[0])).toBe(true);
    });

    it('should remove from favorites when toggled again', () => {
      component.onToggleFavorite(mockMovies[0]); // Add to favorites
      expect(component.isFavorite(mockMovies[0])).toBe(true);
      
      component.onToggleFavorite(mockMovies[0]); // Remove from favorites
      expect(component.isFavorite(mockMovies[0])).toBe(false);
    });
  });

  describe('TrackBy function', () => {
    it('should return movie id for trackBy', () => {
      const result = component.trackByMovieId(0, mockMovies[0]);
      expect(result).toBe(mockMovies[0].id);
    });
  });

  describe('Load More functionality', () => {
    it('should call loadMore when load more button is clicked', () => {
      spyOn(component, 'loadMore');
      component.movies = mockMovies;
      component.hasNextPage = true;
      component.loading = false;
      fixture.detectChanges();

      const loadMoreBtn = compiled.querySelector('.load-more-btn') as HTMLButtonElement;
      loadMoreBtn.click();

      expect(component.loadMore).toHaveBeenCalled();
    });

    it('should increment page and emit pageChange on loadMore', () => {
      spyOn(component.pageChange, 'emit');
      component.currentPage = 2;
      
      component.loadMore();
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(3);
    });
  });

  describe('Retry functionality', () => {
    it('should call retry when retry button is clicked', () => {
      spyOn(component, 'retry');
      component.error = 'Test error';
      component.movies = [];
      component.loading = false;
      fixture.detectChanges();

      const retryBtn = compiled.querySelector('.error-state button') as HTMLButtonElement;
      retryBtn.click();

      expect(component.retry).toHaveBeenCalled();
    });
  });

  describe('Component lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Responsive behavior', () => {
    it('should have responsive grid classes', () => {
      component.movies = mockMovies;
      fixture.detectChanges();

      const moviesGrid = compiled.querySelector('.movies-grid');
      expect(moviesGrid).toBeTruthy();
      expect(moviesGrid?.classList.contains('movies-grid')).toBe(true);
    });
  });
});