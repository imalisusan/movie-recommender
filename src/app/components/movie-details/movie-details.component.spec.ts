import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { MovieDetailsComponent } from './movie-details.component';
import { LoaderComponent } from '../loader/loader.component';
import { MovieDetails, Cast, Crew } from '../../services/tmdb.service';

describe('MovieDetailsComponent', () => {
  let component: MovieDetailsComponent;
  let fixture: ComponentFixture<MovieDetailsComponent>;

  const mockMovie: MovieDetails = {
    id: 1,
    title: 'Test Movie',
    overview: 'This is a test movie overview.',
    poster_path: '/test-poster.jpg',
    backdrop_path: '/test-backdrop.jpg',
    release_date: '2023-01-15',
    vote_average: 8.5,
    vote_count: 1500,
    runtime: 120,
    budget: 50000000,
    revenue: 150000000,
    tagline: 'The ultimate test movie',
    homepage: 'https://test-movie.com',
    genre_ids: [1, 2],
    genres: [
      { id: 1, name: 'Action' },
      { id: 2, name: 'Adventure' }
    ],
    production_companies: [],
    production_countries: [],
    spoken_languages: [],
    status: 'Released',
    adult: false,
    popularity: 85.5,
    video: false,
    imdb_id: 'tt1234567',
    original_language: 'en',
    original_title: 'Test Movie'
  };

  const mockCast: Cast[] = [
    {
      id: 1,
      name: 'John Doe',
      character: 'Hero',
      profile_path: '/john-doe.jpg',
      order: 0
    },
    {
      id: 2,
      name: 'Jane Smith',
      character: 'Villain',
      profile_path: '/jane-smith.jpg',
      order: 1
    }
  ];

  const mockCrew: Crew[] = [
    {
      id: 1,
      name: 'Director Name',
      job: 'Director',
      department: 'Directing',
      profile_path: '/director.jpg'
    },
    {
      id: 2,
      name: 'Producer Name',
      job: 'Producer',
      department: 'Production',
      profile_path: '/producer.jpg'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MovieDetailsComponent,
        LoaderComponent,
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatProgressBarModule,
        MatDividerModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.movie).toBeNull();
      expect(component.cast).toEqual([]);
      expect(component.crew).toEqual([]);
      expect(component.loading).toBeFalse();
      expect(component.error).toBeNull();
      expect(component.isFavorite).toBeFalse();
    });

    it('should complete destroy subject on ngOnDestroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });

  describe('Template Rendering', () => {
    it('should show loader when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();

      const loader = fixture.debugElement.query(By.css('app-loader'));
      expect(loader).toBeTruthy();
      expect(loader.componentInstance.message).toBe('Loading movie details...');
    });

    it('should show error state when error exists', () => {
      component.loading = false;
      component.error = 'Failed to load movie details';
      fixture.detectChanges();

      const errorContainer = fixture.debugElement.query(By.css('.error-container'));
      expect(errorContainer).toBeTruthy();
      expect(errorContainer.nativeElement.textContent).toContain('Failed to load movie details');

      const retryButton = fixture.debugElement.query(By.css('.error-container button'));
      expect(retryButton).toBeTruthy();
    });

    it('should show movie content when movie data is available', () => {
      component.loading = false;
      component.error = null;
      component.movie = mockMovie;
      fixture.detectChanges();

      const movieContent = fixture.debugElement.query(By.css('.movie-content'));
      expect(movieContent).toBeTruthy();

      const movieTitle = fixture.debugElement.query(By.css('.movie-title'));
      expect(movieTitle.nativeElement.textContent).toBe('Test Movie');
    });

    it('should display movie poster with correct attributes', () => {
      component.movie = mockMovie;
      fixture.detectChanges();

      const posterImg = fixture.debugElement.query(By.css('.poster-image'));
      expect(posterImg).toBeTruthy();
      expect(posterImg.nativeElement.src).toContain('https://image.tmdb.org/t/p/w500/test-poster.jpg');
      expect(posterImg.nativeElement.alt).toBe('Test Movie');
    });

    it('should display movie tagline when available', () => {
      component.movie = mockMovie;
      fixture.detectChanges();

      const tagline = fixture.debugElement.query(By.css('.movie-tagline'));
      expect(tagline).toBeTruthy();
      expect(tagline.nativeElement.textContent).toBe('The ultimate test movie');
    });

    it('should display rating information', () => {
      component.movie = mockMovie;
      fixture.detectChanges();

      const ratingValue = fixture.debugElement.query(By.css('.rating-value'));
      expect(ratingValue.nativeElement.textContent).toBe('8.5');

      const ratingCount = fixture.debugElement.query(By.css('.rating-count'));
      expect(ratingCount.nativeElement.textContent).toContain('1,500 votes');

      const progressBar = fixture.debugElement.query(By.css('mat-progress-bar'));
      expect(progressBar.componentInstance.value).toBe(85);
    });

    it('should display meta information', () => {
      component.movie = mockMovie;
      fixture.detectChanges();

      const metaItems = fixture.debugElement.queryAll(By.css('.meta-item'));
      expect(metaItems.length).toBeGreaterThan(0);


      const dateItem = metaItems.find(item => 
        item.nativeElement.textContent.includes('January')
      );
      expect(dateItem).toBeTruthy();
    });

    it('should display genres as chips', () => {
      component.movie = mockMovie;
      fixture.detectChanges();

      const chips = fixture.debugElement.queryAll(By.css('mat-chip'));
      expect(chips.length).toBe(2);
      expect(chips[0].nativeElement.textContent).toBe('Action');
      expect(chips[1].nativeElement.textContent).toBe('Adventure');
    });

    it('should display favorite button with correct state', () => {
      component.movie = mockMovie;
      component.isFavorite = false;
      fixture.detectChanges();

      const favoriteButton = fixture.debugElement.query(
        By.css('button[color="primary"]')
      );
      expect(favoriteButton.nativeElement.textContent).toContain('Add to Favorites');

      component.isFavorite = true;
      fixture.detectChanges();

      expect(favoriteButton.nativeElement.textContent).toContain('Remove from Favorites');
    });

    it('should display overview text', () => {
      component.movie = mockMovie;
      fixture.detectChanges();

      const overview = fixture.debugElement.query(By.css('.overview-text'));
      expect(overview.nativeElement.textContent).toBe('This is a test movie overview.');
    });

    it('should display cast members when available', () => {
      component.movie = mockMovie;
      component.cast = mockCast;
      fixture.detectChanges();

      const castSection = fixture.debugElement.query(By.css('.cast-section'));
      expect(castSection).toBeTruthy();

      const castMembers = fixture.debugElement.queryAll(By.css('.cast-member'));
      expect(castMembers.length).toBe(2);

      const firstCastName = fixture.debugElement.query(By.css('.cast-name'));
      expect(firstCastName.nativeElement.textContent).toBe('John Doe');
    });

    it('should display crew members when available', () => {
      component.movie = mockMovie;
      component.crew = mockCrew;
      fixture.detectChanges();

      const crewSection = fixture.debugElement.query(By.css('.crew-section'));
      expect(crewSection).toBeTruthy();

      const crewMembers = fixture.debugElement.queryAll(By.css('.crew-member'));
      expect(crewMembers.length).toBeGreaterThan(0);
    });
  });

  describe('Event Handling', () => {
    it('should emit close event when back button is clicked', () => {
      spyOn(component.close, 'emit');
      component.movie = mockMovie;
      fixture.detectChanges();

      const backButton = fixture.debugElement.query(
        By.css('button[mat-stroked-button]')
      );
      backButton.nativeElement.click();

      expect(component.close.emit).toHaveBeenCalled();
    });

    it('should emit toggleFavorite event when favorite button is clicked', () => {
      spyOn(component.toggleFavorite, 'emit');
      component.movie = mockMovie;
      fixture.detectChanges();

      const favoriteButton = fixture.debugElement.query(
        By.css('button[color="primary"]')
      );
      favoriteButton.nativeElement.click();

      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(mockMovie);
    });

    it('should emit retry event when retry button is clicked', () => {
      spyOn(component.retry, 'emit');
      component.loading = false;
      component.error = 'Test error';
      fixture.detectChanges();

      const retryButton = fixture.debugElement.query(
        By.css('.error-container button')
      );
      retryButton.nativeElement.click();

      expect(component.retry.emit).toHaveBeenCalled();
    });

    it('should handle image error by setting fallback image', () => {
      const mockImg = { src: '' } as HTMLImageElement;
      const mockEvent = { target: mockImg } as unknown as Event;

      component.onImageError(mockEvent);

      expect(mockImg.src).toBe('assets/images/no-image.svg');
    });
  });

  describe('Utility Methods', () => {
    it('should generate correct image URL', () => {
      const url = component.getImageUrl('/test-path.jpg', 'w300');
      expect(url).toBe('https://image.tmdb.org/t/p/w300/test-path.jpg');
    });

    it('should return fallback image for null path', () => {
      const url = component.getImageUrl(null as any);
      expect(url).toBe('assets/images/no-image.svg');
    });

    it('should format date correctly', () => {
      const formattedDate = component.formatDate('2023-01-15');
      expect(formattedDate).toBe('January 15, 2023');
    });

    it('should return "Unknown" for empty date string', () => {
      const formattedDate = component.formatDate('');
      expect(formattedDate).toBe('Unknown');
    });

    it('should format runtime correctly', () => {
      const runtime = component.formatRuntime(125);
      expect(runtime).toBe('2h 5m');
    });

    it('should format currency correctly', () => {
      const currency = component.formatCurrency(50000000);
      expect(currency).toBe('$50,000,000');
    });

    it('should filter and return key crew members', () => {
      component.crew = [
        ...mockCrew,
        {
          id: 3,
          name: 'Random Person',
          job: 'Random Job',
          department: 'Random',
          profile_path: '/random.jpg'
        }
      ];

      const keyCrew = component.getKeyCrew();
      expect(keyCrew.length).toBe(2);
      expect(keyCrew[0].job).toBe('Director');
      expect(keyCrew[1].job).toBe('Producer');
    });
  });

  describe('Component Methods', () => {
    it('should call onClose method', () => {
      spyOn(component, 'onClose');
      component.onClose();
      expect(component.onClose).toHaveBeenCalled();
    });

    it('should call onToggleFavorite method with movie', () => {
      component.movie = mockMovie;
      spyOn(component.toggleFavorite, 'emit');
      
      component.onToggleFavorite();
      
      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(mockMovie);
    });

    it('should not emit toggleFavorite when movie is null', () => {
      component.movie = null;
      spyOn(component.toggleFavorite, 'emit');
      
      component.onToggleFavorite();
      
      expect(component.toggleFavorite.emit).not.toHaveBeenCalled();
    });

    it('should call onRetry method', () => {
      spyOn(component.retry, 'emit');
      component.onRetry();
      expect(component.retry.emit).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for images', () => {
      component.movie = mockMovie;
      component.cast = mockCast;
      fixture.detectChanges();

      const posterImg = fixture.debugElement.query(By.css('.poster-image'));
      expect(posterImg.nativeElement.alt).toBe('Test Movie');

      const castImg = fixture.debugElement.query(By.css('.cast-photo'));
      expect(castImg.nativeElement.alt).toBe('John Doe');
    });

    it('should have proper button labels', () => {
      component.movie = mockMovie;
      fixture.detectChanges();

      const buttons = fixture.debugElement.queryAll(By.css('button'));
      expect(buttons.length).toBeGreaterThan(0);
      
      const favoriteButton = fixture.debugElement.query(
        By.css('button[color="primary"]')
      );
      expect(favoriteButton.nativeElement.textContent).toContain('Favorites');
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive classes', () => {
      component.movie = mockMovie;
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.movie-details-container'));
      expect(container).toBeTruthy();

      const movieHeader = fixture.debugElement.query(By.css('.movie-header'));
      expect(movieHeader).toBeTruthy();
    });
  });
});