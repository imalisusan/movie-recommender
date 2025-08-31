import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  template: `
    <div class="pagination-container" *ngIf="totalPages > 1">
      <div class="pagination-info">
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <span class="total-results">{{ totalResults }} results</span>
      </div>
      
      <div class="pagination-controls">
        <button 
          mat-icon-button 
          [disabled]="currentPage === 1"
          (click)="onPageChange(1)"
          aria-label="First page">
          <mat-icon>first_page</mat-icon>
        </button>
        
        <button 
          mat-icon-button 
          [disabled]="currentPage === 1"
          (click)="onPageChange(currentPage - 1)"
          aria-label="Previous page">
          <mat-icon>chevron_left</mat-icon>
        </button>
        
        <div class="page-numbers">
          <button 
            *ngFor="let page of getVisiblePages()"
            mat-button
            [class.current]="page === currentPage"
            [disabled]="page === '...'"
            (click)="page !== '...' && onPageChange(+page)">
            {{ page }}
          </button>
        </div>
        
        <button 
          mat-icon-button 
          [disabled]="currentPage === totalPages"
          (click)="onPageChange(currentPage + 1)"
          aria-label="Next page">
          <mat-icon>chevron_right</mat-icon>
        </button>
        
        <button 
          mat-icon-button 
          [disabled]="currentPage === totalPages"
          (click)="onPageChange(totalPages)"
          aria-label="Last page">
          <mat-icon>last_page</mat-icon>
        </button>
      </div>
      
      <div class="page-size-selector">
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Per page</mat-label>
          <mat-select [value]="pageSize" (selectionChange)="onPageSizeChange($event.value)">
            <mat-option [value]="10">10</mat-option>
            <mat-option [value]="20">20</mat-option>
            <mat-option [value]="50">50</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 0;
      margin-top: 24px;
      border-top: 1px solid #e0e0e0;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .pagination-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 14px;
      color: #666;
    }
    
    .total-results {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .page-numbers {
      display: flex;
      gap: 4px;
    }
    
    .page-numbers button {
      min-width: 40px;
      height: 40px;
    }
    
    .page-numbers button.current {
      background-color: #1976d2;
      color: white;
    }
    
    .page-size-selector {
      min-width: 120px;
    }
    
    .page-size-selector mat-form-field {
      width: 100%;
    }
    
    @media (max-width: 768px) {
      .pagination-container {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }
      
      .pagination-controls {
        justify-content: center;
      }
      
      .page-numbers {
        display: none;
      }
      
      .pagination-info {
        text-align: center;
      }
    }
  `]
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalResults: number = 0;
  @Input() pageSize: number = 20;
  
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
  
  onPageSizeChange(newPageSize: number): void {
    this.pageSizeChange.emit(newPageSize);
  }
  
  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }
}