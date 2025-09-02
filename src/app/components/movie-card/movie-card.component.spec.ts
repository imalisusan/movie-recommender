import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { MovieCardComponent } from './movie-card.component';
import { Movie, TmdbService } from '../../services/tmdb.service';

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;
  let compiled: HTMLElement;
  let mockTmdbService: jasmine.SpyObj<TmdbService>;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'This is a test movie overview that is quite long and should be truncated when displayed in the movie card component to ensure proper layout.',
    poster_path: '/test-poster.jpg',
    backdrop_path: '/test-backdrop.jpg',
    release_date: '2023-06-15',
    vote_average: 8.5,
    vote_count: 1000,
    genre_ids: [28, 12],
    adult: false,
    original_language: 'en',
    original_title: 'Test Movie',
    popularity: 100,
    video: false
  };

  beforeEach(async () => {
    const tmdbServiceSpy = jasmine.createSpyObj('TmdbService', ['getPosterUrl']);
    tmdbServiceSpy.getPosterUrl.and.returnValue('https://image.tmdb.org/t/p/w500/test-poster.jpg');

    await TestBed.configureTestingModule({
      imports: [
        MovieCardComponent,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: TmdbService, useValue: tmdbServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    mockTmdbService = TestBed.inject(TmdbService) as jasmine.SpyObj<TmdbService>;

    component.movie = mockMovie;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Inputs', () => {
    it('should accept movie input', () => {
      expect(component.movie).toEqual(mockMovie);
    });

    it('should accept loading input', () => {
      component.loading = true;
      expect(component.loading).toBe(true);
    });

    it('should accept isFavorite input', () => {
      component.isFavorite = true;
      expect(component.isFavorite).toBe(true);
    });
  });

  describe('Movie Display', () => {
    it('should display movie title', () => {
      const titleElement = compiled.querySelector('.title');
      expect(titleElement?.textContent?.trim()).toBe(mockMovie.title);
    });

    it('should display movie overview (truncated)', () => {
      const overviewElement = compiled.querySelector('.overview');
      expect(overviewElement?.textContent?.trim()).toContain('This is a test movie overview');
    });

    it('should display formatted release date', () => {
      const releaseDateElement = compiled.querySelector('.release-date');
      expect(releaseDateElement?.textContent?.trim()).toBe('June 2023');
    });

    it('should display rating badge when vote_average > 0', () => {
      const ratingBadge = compiled.querySelector('.rating-badge');
      expect(ratingBadge).toBeTruthy();
      expect(ratingBadge?.textContent?.trim()).toContain('8.5');
    });

    it('should not display rating badge when vote_average is 0', () => {
      component.movie = { ...mockMovie, vote_average: 0 };
      fixture.detectChanges();

      const ratingBadge = compiled.querySelector('.rating-badge');
      expect(ratingBadge).toBeFalsy();
    });

    it('should not display release date when not available', () => {
      component.movie = { ...mockMovie, release_date: '' };
      fixture.detectChanges();

      const releaseDateElement = compiled.querySelector('.release-date');
      expect(releaseDateElement).toBeFalsy();
    });
  });

  describe('Poster Image', () => {
    it('should display poster image with correct src', () => {
      const posterImg = compiled.querySelector('.poster') as HTMLImageElement;
      expect(posterImg).toBeTruthy();
      expect(posterImg.src).toContain('https://image.tmdb.org/t/p/w500/test-poster.jpg');
    });

    it('should have correct alt text', () => {
      const posterImg = compiled.querySelector('.poster') as HTMLImageElement;
      expect(posterImg.alt).toBe(mockMovie.title);
    });

    it('should have lazy loading attribute', () => {
      const posterImg = compiled.querySelector('.poster') as HTMLImageElement;
      expect(posterImg.loading).toBe('lazy');
    });

    it('should handle image error by setting fallback image', () => {
      const posterImg = compiled.querySelector('.poster') as HTMLImageElement;
      const errorEvent = new Event('error');
      
      posterImg.dispatchEvent(errorEvent);
      
      expect(posterImg.src).toContain('assets/images/no-poster.jpg');
    });
  });

  describe('Action Buttons', () => {
    it('should display View Details button', () => {
      const viewDetailsBtn = compiled.querySelector('button[mat-raised-button]');
      expect(viewDetailsBtn).toBeTruthy();
      expect(viewDetailsBtn?.textContent?.trim()).toContain('View Details');
    });

    it('should display favorite button', () => {
      const favoriteBtn = compiled.querySelector('button[mat-icon-button]');
      expect(favoriteBtn).toBeTruthy();
    });

    it('should show favorite_border icon when not favorite', () => {
      component.isFavorite = false;
      fixture.detectChanges();

      const favoriteIcon = compiled.querySelector('button[mat-icon-button] mat-icon');
      expect(favoriteIcon?.textContent?.trim()).toBe('favorite_border');
    });

    it('should show favorite icon when is favorite', () => {
      component.isFavorite = true;
      fixture.detectChanges();

      const favoriteIcon = compiled.querySelector('button[mat-icon-button] mat-icon');
      expect(favoriteIcon?.textContent?.trim()).toBe('favorite');
    });

    it('should add favorite class when is favorite', () => {
      component.isFavorite = true;
      fixture.detectChanges();

      const favoriteBtn = compiled.querySelector('button[mat-icon-button]');
      expect(favoriteBtn?.classList.contains('favorite')).toBe(true);
    });

    it('should disable buttons when loading', () => {
      component.loading = true;
      fixture.detectChanges();

      const viewDetailsBtn = compiled.querySelector('button[mat-raised-button]') as HTMLButtonElement;
      const favoriteBtn = compiled.querySelector('button[mat-icon-button]') as HTMLButtonElement;
      
      expect(viewDetailsBtn.disabled).toBe(true);
      expect(favoriteBtn.disabled).toBe(true);
    });
  });

  describe('Event Emissions', () => {
    it('should emit viewDetails when View Details button is clicked', () => {
      spyOn(component.viewDetails, 'emit');
      
      const viewDetailsBtn = compiled.querySelector('button[mat-raised-button]') as HTMLButtonElement;
      viewDetailsBtn.click();
      
      expect(component.viewDetails.emit).toHaveBeenCalledWith(mockMovie);
    });

    it('should emit toggleFavorite when favorite button is clicked', () => {
      spyOn(component.toggleFavorite, 'emit');
      
      const favoriteBtn = compiled.querySelector('button[mat-icon-button]') as HTMLButtonElement;
      favoriteBtn.click();
      
      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(mockMovie);
    });

    it('should call onViewDetails when method is invoked', () => {
      spyOn(component.viewDetails, 'emit');
      
      component.onViewDetails();
      
      expect(component.viewDetails.emit).toHaveBeenCalledWith(mockMovie);
    });

    it('should call onToggleFavorite when method is invoked', () => {
      spyOn(component.toggleFavorite, 'emit');
      
      component.onToggleFavorite();
      
      expect(component.toggleFavorite.emit).toHaveBeenCalledWith(mockMovie);
    });
  });

  describe('Utility Methods', () => {
    it('should get poster URL correctly', () => {
      const posterPath = '/test-poster.jpg';
      const expectedUrl = 'https://image.tmdb.org/t/p/w500/test-poster.jpg';
      
      tmdbServiceSpy.getPosterUrl.and.returnValue(expectedUrl);
      
      const result = component.getPosterUrl(posterPath);
      
      expect(result).toBe(expectedUrl);
      expect(tmdbServiceSpy.getPosterUrl).toHaveBeenCalledWith(posterPath, 'w500');
    });

    it('should return fallback image when no poster_path', () => {
      component.movie = { ...mockMovie, poster_path: null as any };
      
      const posterUrl = component.getPosterUrl();
      expect(posterUrl).toBe('assets/images/no-poster.jpg');
    });

    it('should format release date correctly', () => {
      const formattedDate = component.formatReleaseDate('2023-06-15');
      expect(formattedDate).toBe('June 2023');
    });

    it('should handle invalid date format', () => {
      const formattedDate = component.formatReleaseDate('invalid-date');
      expect(formattedDate).toBe('invalid-date');
    });

    it('should truncate long overview text', () => {
      const longOverview = 'This is a very long overview that should be truncated because it exceeds the maximum length allowed for display in the movie card component.';
      const truncated = component.truncateOverview(longOverview);
      
      expect(truncated.length).toBeLessThanOrEqual(150);
      expect(truncated).toContain('...');
    });

    it('should not truncate short overview text', () => {
      const shortOverview = 'Short overview';
      const result = component.truncateOverview(shortOverview);
      
      expect(result).toBe(shortOverview);
      expect(result).not.toContain('...');
    });

    it('should handle empty overview', () => {
      const result = component.truncateOverview('');
      expect(result).toBe('');
    });
  });

  describe('Loading State', () => {
    it('should add loading class when loading is true', () => {
      component.loading = true;
      fixture.detectChanges();

      const movieCard = compiled.querySelector('.movie-card');
      expect(movieCard?.classList.contains('loading')).toBe(true);
    });

    it('should not add loading class when loading is false', () => {
      component.loading = false;
      fixture.detectChanges();

      const movieCard = compiled.querySelector('.movie-card');
      expect(movieCard?.classList.contains('loading')).toBe(false);
    });
  });

  describe('Accessibility', () => {
    it('should have proper title attributes for truncated text', () => {
      const titleElement = compiled.querySelector('.title') as HTMLElement;
      const overviewElement = compiled.querySelector('.overview') as HTMLElement;
      
      expect(titleElement.title).toBe(mockMovie.title);
      expect(overviewElement.title).toBe(mockMovie.overview);
    });

    it('should have proper alt text for poster image', () => {
      const posterImg = compiled.querySelector('.poster') as HTMLImageElement;
      expect(posterImg.alt).toBe(mockMovie.title);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive movie-card class', () => {
      const movieCard = compiled.querySelector('.movie-card');
      expect(movieCard).toBeTruthy();
      expect(movieCard?.classList.contains('movie-card')).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle onImageError correctly', () => {
      const mockEvent = {
        target: {
          src: 'original-url'
        }
      };
      
      component.onImageError(mockEvent);
      
      expect(mockEvent.target.src).toBe('assets/images/no-poster.jpg');
    });
  });
});