import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatChipsModule
  ],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h2>Search Movies</h2>
        <p class="search-subtitle">Find your favorite movies by title, keyword, or genre</p>
      </div>
      
      <div class="search-form">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search movies...</mat-label>
          <input 
            matInput 
            [formControl]="searchControl"
            placeholder="Enter movie title or keyword"
            (keyup.enter)="onSearch()"
            autocomplete="off">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>
        
        <div class="search-actions">
          <button 
            mat-raised-button 
            color="primary"
            (click)="onSearch()"
            [disabled]="!searchControl.value?.trim()">
            <mat-icon>search</mat-icon>
            Search
          </button>
          
          <button 
            mat-stroked-button
            (click)="onClear()"
            [disabled]="!searchControl.value">
            <mat-icon>clear</mat-icon>
            Clear
          </button>
        </div>
      </div>
      
      <div class="search-filters" *ngIf="recentSearches.length > 0">
        <h3>Recent Searches</h3>
        <mat-chip-set>
          <mat-chip 
            *ngFor="let search of recentSearches" 
            (click)="onRecentSearchClick(search)"
            class="recent-search-chip">
            {{ search }}
            <mat-icon matChipRemove (click)="removeRecentSearch(search); $event.stopPropagation()">
              cancel
            </mat-icon>
          </mat-chip>
        </mat-chip-set>
      </div>
      
      <div class="quick-filters">
        <h3>Quick Filters</h3>
        <div class="filter-buttons">
          <button 
            *ngFor="let filter of quickFilters"
            mat-stroked-button
            (click)="onQuickFilter(filter.query)"
            class="filter-button">
            <mat-icon>{{ filter.icon }}</mat-icon>
            {{ filter.label }}
          </button>
        </div>
      </div>
      
      <div class="search-tips">
        <h3>Search Tips</h3>
        <ul class="tips-list">
          <li>Use specific movie titles for best results</li>
          <li>Try searching by actor names or director names</li>
          <li>Use keywords like "action", "comedy", "thriller" for genre-based searches</li>
          <li>Search for movie series like "Marvel" or "Star Wars"</li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px;
    }
    
    .search-header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .search-header h2 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 2rem;
    }
    
    .search-subtitle {
      color: #666;
      margin: 0;
      font-size: 1.1rem;
    }
    
    .search-form {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 32px;
    }
    
    .search-field {
      flex: 1;
    }
    
    .search-field mat-form-field {
      width: 100%;
    }
    
    .search-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
    
    .search-filters {
      margin-bottom: 32px;
    }
    
    .search-filters h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .recent-search-chip {
      cursor: pointer;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    
    .recent-search-chip:hover {
      background-color: #e3f2fd;
    }
    
    .quick-filters {
      margin-bottom: 32px;
    }
    
    .quick-filters h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .filter-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .filter-button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .search-tips {
      background: #f5f5f5;
      padding: 24px;
      border-radius: 8px;
    }
    
    .search-tips h3 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 1.2rem;
    }
    
    .tips-list {
      margin: 0;
      padding-left: 20px;
      color: #666;
    }
    
    .tips-list li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
    
    @media (max-width: 768px) {
      .search-container {
        padding: 16px;
      }
      
      .search-form {
        flex-direction: column;
        gap: 16px;
      }
      
      .search-actions {
        width: 100%;
        justify-content: stretch;
      }
      
      .search-actions button {
        flex: 1;
      }
      
      .filter-buttons {
        flex-direction: column;
      }
      
      .filter-button {
        width: 100%;
        justify-content: center;
      }
      
      .search-header h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  
  searchControl = new FormControl('');
  recentSearches: string[] = [];
  
  quickFilters = [
    { label: 'Popular Movies', query: 'popular', icon: 'trending_up' },
    { label: 'Action Movies', query: 'action', icon: 'local_fire_department' },
    { label: 'Comedy Movies', query: 'comedy', icon: 'sentiment_very_satisfied' },
    { label: 'Drama Movies', query: 'drama', icon: 'theater_comedy' },
    { label: 'Horror Movies', query: 'horror', icon: 'psychology' },
    { label: 'Sci-Fi Movies', query: 'science fiction', icon: 'rocket_launch' },
    { label: 'Romance Movies', query: 'romance', icon: 'favorite' },
    { label: 'Thriller Movies', query: 'thriller', icon: 'flash_on' }
  ];
  
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.loadRecentSearches();
    
    // Auto-search with debounce
    this.searchControl.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        if (value && value.trim().length > 2) {
          this.performSearch(value.trim());
        }
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  onSearch(): void {
    const query = this.searchControl.value?.trim();
    if (query) {
      this.performSearch(query);
    }
  }
  
  onClear(): void {
    this.searchControl.setValue('');
    this.clear.emit();
  }
  
  onRecentSearchClick(searchTerm: string): void {
    this.searchControl.setValue(searchTerm);
    this.performSearch(searchTerm);
  }
  
  onQuickFilter(query: string): void {
    this.searchControl.setValue(query);
    this.performSearch(query);
  }
  
  removeRecentSearch(searchTerm: string): void {
    this.recentSearches = this.recentSearches.filter(term => term !== searchTerm);
    this.saveRecentSearches();
  }
  
  private performSearch(query: string): void {
    this.addToRecentSearches(query);
    this.search.emit(query);
  }
  
  private addToRecentSearches(searchTerm: string): void {
    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(term => term !== searchTerm);
    
    // Add to beginning
    this.recentSearches.unshift(searchTerm);
    
    // Keep only last 5 searches
    this.recentSearches = this.recentSearches.slice(0, 5);
    
    this.saveRecentSearches();
  }
  
  private loadRecentSearches(): void {
    try {
      const saved = localStorage.getItem('movieapp_recent_searches');
      if (saved) {
        this.recentSearches = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load recent searches:', error);
      this.recentSearches = [];
    }
  }
  
  private saveRecentSearches(): void {
    try {
      localStorage.setItem('movieapp_recent_searches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.warn('Failed to save recent searches:', error);
    }
  }
}