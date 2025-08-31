import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PaginationComponent,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.currentPage).toBe(1);
    expect(component.totalPages).toBe(1);
    expect(component.totalResults).toBe(0);
    expect(component.pageSize).toBe(20);
  });

  describe('Template rendering', () => {
    it('should not render pagination when totalPages <= 1', () => {
      component.totalPages = 1;
      fixture.detectChanges();

      const paginationContainer = compiled.querySelector('.pagination-container');
      expect(paginationContainer).toBeFalsy();
    });

    it('should render pagination when totalPages > 1', () => {
      component.totalPages = 5;
      component.totalResults = 100;
      fixture.detectChanges();

      const paginationContainer = compiled.querySelector('.pagination-container');
      expect(paginationContainer).toBeTruthy();
    });

    it('should display current page and total pages info', () => {
      component.currentPage = 3;
      component.totalPages = 10;
      component.totalResults = 200;
      fixture.detectChanges();

      const pageInfo = compiled.querySelector('.pagination-info');
      expect(pageInfo?.textContent).toContain('Page 3 of 10');
      expect(pageInfo?.textContent).toContain('200 results');
    });

    it('should disable first and previous buttons on first page', () => {
      component.currentPage = 1;
      component.totalPages = 5;
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll('.pagination-controls button');
      const firstPageBtn = buttons[0] as HTMLButtonElement;
      const prevPageBtn = buttons[1] as HTMLButtonElement;
      
      expect(firstPageBtn.disabled).toBe(true);
      expect(prevPageBtn.disabled).toBe(true);
    });

    it('should disable next and last buttons on last page', () => {
      component.currentPage = 5;
      component.totalPages = 5;
      fixture.detectChanges();

      const buttons = compiled.querySelectorAll('.pagination-controls button');
      const nextPageBtn = buttons[buttons.length - 2] as HTMLButtonElement;
      const lastPageBtn = buttons[buttons.length - 1] as HTMLButtonElement;
      
      expect(nextPageBtn.disabled).toBe(true);
      expect(lastPageBtn.disabled).toBe(true);
    });

    it('should highlight current page button', () => {
      component.currentPage = 3;
      component.totalPages = 5;
      fixture.detectChanges();

      const pageButtons = compiled.querySelectorAll('.page-numbers button');
      const currentPageBtn = Array.from(pageButtons).find(btn => 
        btn.textContent?.trim() === '3'
      ) as HTMLElement;
      
      expect(currentPageBtn?.classList.contains('current')).toBe(true);
    });

    it('should render page size selector with correct value', () => {
      component.pageSize = 20;
      component.totalPages = 5;
      fixture.detectChanges();

      const select = compiled.querySelector('mat-select');
      expect(select).toBeTruthy();
    });
  });

  describe('Page navigation', () => {
    beforeEach(() => {
      component.totalPages = 10;
      component.currentPage = 5;
      fixture.detectChanges();
    });

    it('should emit pageChange when onPageChange is called with valid page', () => {
      spyOn(component.pageChange, 'emit');
      
      component.onPageChange(7);
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(7);
    });

    it('should not emit pageChange when page is same as current', () => {
      spyOn(component.pageChange, 'emit');
      
      component.onPageChange(5);
      
      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });

    it('should not emit pageChange when page is out of bounds', () => {
      spyOn(component.pageChange, 'emit');
      
      component.onPageChange(0);
      component.onPageChange(11);
      
      expect(component.pageChange.emit).not.toHaveBeenCalled();
    });

    it('should navigate to first page when first page button is clicked', () => {
      spyOn(component.pageChange, 'emit');
      
      const firstPageBtn = compiled.querySelector('.pagination-controls button') as HTMLButtonElement;
      firstPageBtn.click();
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(1);
    });

    it('should navigate to previous page when previous button is clicked', () => {
      spyOn(component.pageChange, 'emit');
      
      const buttons = compiled.querySelectorAll('.pagination-controls button');
      const prevPageBtn = buttons[1] as HTMLButtonElement;
      prevPageBtn.click();
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(4);
    });

    it('should navigate to next page when next button is clicked', () => {
      spyOn(component.pageChange, 'emit');
      
      const buttons = compiled.querySelectorAll('.pagination-controls button');
      const nextPageBtn = buttons[buttons.length - 2] as HTMLButtonElement;
      nextPageBtn.click();
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(6);
    });

    it('should navigate to last page when last page button is clicked', () => {
      spyOn(component.pageChange, 'emit');
      
      const buttons = compiled.querySelectorAll('.pagination-controls button');
      const lastPageBtn = buttons[buttons.length - 1] as HTMLButtonElement;
      lastPageBtn.click();
      
      expect(component.pageChange.emit).toHaveBeenCalledWith(10);
    });
  });

  describe('Page size changes', () => {
    it('should emit pageSizeChange when onPageSizeChange is called', () => {
      spyOn(component.pageSizeChange, 'emit');
      
      component.onPageSizeChange(50);
      
      expect(component.pageSizeChange.emit).toHaveBeenCalledWith(50);
    });
  });

  describe('getVisiblePages', () => {
    it('should return all pages when totalPages <= 5', () => {
      component.totalPages = 4;
      
      const visiblePages = component.getVisiblePages();
      
      expect(visiblePages).toEqual([1, 2, 3, 4]);
    });

    it('should return pages with ellipsis when currentPage is near beginning', () => {
      component.totalPages = 10;
      component.currentPage = 2;
      
      const visiblePages = component.getVisiblePages();
      
      expect(visiblePages).toEqual([1, 2, 3, 4, '...', 10]);
    });

    it('should return pages with ellipsis when currentPage is near end', () => {
      component.totalPages = 10;
      component.currentPage = 9;
      
      const visiblePages = component.getVisiblePages();
      
      expect(visiblePages).toEqual([1, '...', 7, 8, 9, 10]);
    });

    it('should return pages with ellipsis on both sides when currentPage is in middle', () => {
      component.totalPages = 10;
      component.currentPage = 5;
      
      const visiblePages = component.getVisiblePages();
      
      expect(visiblePages).toEqual([1, '...', 4, 5, 6, '...', 10]);
    });

    it('should handle edge case with exactly 5 pages', () => {
      component.totalPages = 5;
      component.currentPage = 3;
      
      const visiblePages = component.getVisiblePages();
      
      expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle single page', () => {
      component.totalPages = 1;
      component.currentPage = 1;
      
      const visiblePages = component.getVisiblePages();
      
      expect(visiblePages).toEqual([1]);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      component.totalPages = 5;
      fixture.detectChanges();
    });

    it('should have proper aria-labels for navigation buttons', () => {
      const buttons = compiled.querySelectorAll('.pagination-controls button');
      
      expect(buttons[0].getAttribute('aria-label')).toBe('First page');
      expect(buttons[1].getAttribute('aria-label')).toBe('Previous page');
      expect(buttons[buttons.length - 2].getAttribute('aria-label')).toBe('Next page');
      expect(buttons[buttons.length - 1].getAttribute('aria-label')).toBe('Last page');
    });

    it('should disable ellipsis buttons', () => {
      component.totalPages = 10;
      component.currentPage = 5;
      fixture.detectChanges();

      const pageButtons = compiled.querySelectorAll('.page-numbers button');
      const ellipsisButtons = Array.from(pageButtons).filter(btn => 
        btn.textContent?.trim() === '...'
      ) as HTMLButtonElement[];
      
      ellipsisButtons.forEach(btn => {
        expect(btn.disabled).toBe(true);
      });
    });
  });

  describe('Responsive behavior', () => {
    it('should have responsive CSS classes', () => {
      component.totalPages = 5;
      fixture.detectChanges();

      const container = compiled.querySelector('.pagination-container');
      expect(container).toBeTruthy();
      
      const pageNumbers = compiled.querySelector('.page-numbers');
      expect(pageNumbers).toBeTruthy();
    });
  });
});