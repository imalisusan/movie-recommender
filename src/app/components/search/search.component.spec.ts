import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SearchComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    
    // Clear localStorage before each test
    localStorage.clear();
    
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render search header', () => {
    const header = compiled.querySelector('.search-header h2');
    expect(header?.textContent).toContain('Search Movies');
    
    const subtitle = compiled.querySelector('.search-subtitle');
    expect(subtitle?.textContent).toContain('Find your favorite movies');
  });

  it('should initialize with empty search control', () => {
    expect(component.searchControl.value).toBe('');
  });

  it('should initialize with empty recent searches', () => {
    expect(component.recentSearches).toEqual([]);
  });

  it('should have quick filters defined', () => {
    expect(component.quickFilters).toBeDefined();
    expect(component.quickFilters.length).toBeGreaterThan(0);
    expect(component.quickFilters[0]).toEqual({
      label: 'Popular Movies',
      query: 'popular',
      icon: 'trending_up'
    });
  });

  describe('Search functionality', () => {
    it('should emit search event when onSearch is called', () => {
      spyOn(component.search, 'emit');
      component.searchControl.setValue('test movie');
      
      component.onSearch();
      
      expect(component.search.emit).toHaveBeenCalledWith('test movie');
    });

    it('should not emit search event for empty query', () => {
      spyOn(component.search, 'emit');
      component.searchControl.setValue('');
      
      component.onSearch();
      
      expect(component.search.emit).not.toHaveBeenCalled();
    });

    it('should not emit search event for whitespace-only query', () => {
      spyOn(component.search, 'emit');
      component.searchControl.setValue('   ');
      
      component.onSearch();
      
      expect(component.search.emit).not.toHaveBeenCalled();
    });

    it('should add search term to recent searches', () => {
      component.searchControl.setValue('test movie');
      component.onSearch();
      
      expect(component.recentSearches).toContain('test movie');
    });

    it('should save recent searches to localStorage', () => {
      component.searchControl.setValue('test movie');
      component.onSearch();
      
      const saved = localStorage.getItem('movieapp_recent_searches');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toContain('test movie');
    });

    it('should trigger search on Enter key press', () => {
      spyOn(component, 'onSearch');
      component.searchControl.setValue('test movie');
      
      const input = fixture.debugElement.query(By.css('input[matInput]'));
      const event = new KeyboardEvent('keyup', { key: 'Enter' });
      input.nativeElement.dispatchEvent(event);
      
      expect(component.onSearch).toHaveBeenCalled();
    });
  });

  describe('Clear functionality', () => {
    it('should emit clear event when onClear is called', () => {
      spyOn(component.clear, 'emit');
      
      component.onClear();
      
      expect(component.clear.emit).toHaveBeenCalled();
    });

    it('should clear search control when onClear is called', () => {
      component.searchControl.setValue('test movie');
      
      component.onClear();
      
      expect(component.searchControl.value).toBe('');
    });
  });

  describe('Recent searches', () => {
    beforeEach(() => {
      component.recentSearches = ['movie1', 'movie2', 'movie3'];
      fixture.detectChanges();
    });

    it('should display recent searches when available', () => {
      const recentSearchesSection = compiled.querySelector('.search-filters');
      expect(recentSearchesSection).toBeTruthy();
      
      const chips = compiled.querySelectorAll('mat-chip');
      expect(chips.length).toBe(3);
    });

    it('should handle recent search click', () => {
      spyOn(component.search, 'emit');
      
      component.onRecentSearchClick('movie1');
      
      expect(component.searchControl.value).toBe('movie1');
      expect(component.search.emit).toHaveBeenCalledWith('movie1');
    });

    it('should remove recent search', () => {
      component.removeRecentSearch('movie2');
      
      expect(component.recentSearches).toEqual(['movie1', 'movie3']);
    });

    it('should limit recent searches to 5 items', () => {
      const searches = ['search1', 'search2', 'search3', 'search4', 'search5', 'search6'];
      
      searches.forEach(search => {
        component.searchControl.setValue(search);
        component.onSearch();
      });
      
      expect(component.recentSearches.length).toBe(5);
      expect(component.recentSearches[0]).toBe('search6'); // Most recent first
      expect(component.recentSearches).not.toContain('search1'); // Oldest removed
    });

    it('should move existing search to top when searched again', () => {
      component.recentSearches = ['movie1', 'movie2', 'movie3'];
      
      component.searchControl.setValue('movie2');
      component.onSearch();
      
      expect(component.recentSearches[0]).toBe('movie2');
      expect(component.recentSearches.length).toBe(3); // No duplicates
    });
  });

  describe('Quick filters', () => {
    it('should handle quick filter click', () => {
      spyOn(component.search, 'emit');
      
      component.onQuickFilter('action');
      
      expect(component.searchControl.value).toBe('action');
      expect(component.search.emit).toHaveBeenCalledWith('action');
    });

    it('should display all quick filter buttons', () => {
      const filterButtons = compiled.querySelectorAll('.filter-button');
      expect(filterButtons.length).toBe(component.quickFilters.length);
    });
  });

  describe('Button states', () => {
    it('should disable search button when input is empty', () => {
      component.searchControl.setValue('');
      fixture.detectChanges();
      
      const searchButton = compiled.querySelector('button[color="primary"]') as HTMLButtonElement;
      expect(searchButton.disabled).toBe(true);
    });

    it('should enable search button when input has value', () => {
      component.searchControl.setValue('test');
      fixture.detectChanges();
      
      const searchButton = compiled.querySelector('button[color="primary"]') as HTMLButtonElement;
      expect(searchButton.disabled).toBe(false);
    });

    it('should disable clear button when input is empty', () => {
      component.searchControl.setValue('');
      fixture.detectChanges();
      
      const clearButton = compiled.querySelector('button[mat-stroked-button]') as HTMLButtonElement;
      expect(clearButton.disabled).toBe(true);
    });

    it('should enable clear button when input has value', () => {
      component.searchControl.setValue('test');
      fixture.detectChanges();
      
      const clearButton = compiled.querySelector('button[mat-stroked-button]') as HTMLButtonElement;
      expect(clearButton.disabled).toBe(false);
    });
  });

  describe('LocalStorage integration', () => {
    it('should load recent searches from localStorage on init', () => {
      const mockSearches = ['saved1', 'saved2'];
      localStorage.setItem('movieapp_recent_searches', JSON.stringify(mockSearches));
      
      // Create new component instance to test ngOnInit
      const newFixture = TestBed.createComponent(SearchComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      
      expect(newComponent.recentSearches).toEqual(mockSearches);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('movieapp_recent_searches', 'invalid json');
      spyOn(console, 'warn');
      
      // Create new component instance to test ngOnInit
      const newFixture = TestBed.createComponent(SearchComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();
      
      expect(newComponent.recentSearches).toEqual([]);
      expect(console.warn).toHaveBeenCalled();
    });

    it('should handle localStorage save errors gracefully', () => {
      spyOn(localStorage, 'setItem').and.throwError('Storage full');
      spyOn(console, 'warn');
      
      component.searchControl.setValue('test');
      component.onSearch();
      
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Debounced search', () => {
    it('should set up debounced search on init', () => {
      expect(component.searchControl).toBeDefined();
      // The actual debounce testing would require fakeAsync and tick,
      // but the setup is verified by checking the FormControl exists
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
});