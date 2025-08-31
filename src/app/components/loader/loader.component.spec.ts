import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  let component: LoaderComponent;
  let fixture: ComponentFixture<LoaderComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoaderComponent,
        MatProgressSpinnerModule,
        MatIconModule,
        BrowserAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoaderComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.size).toBe(50);
    expect(component.color).toBe('primary');
    expect(component.message).toBe('Loading...');
    expect(component.subtitle).toBe('');
    expect(component.icon).toBe('');
    expect(component.overlay).toBe(false);
  });

  describe('Template rendering', () => {
    it('should render loader container', () => {
      const loaderContainer = compiled.querySelector('.loader-container');
      expect(loaderContainer).toBeTruthy();
    });

    it('should render loader content', () => {
      const loaderContent = compiled.querySelector('.loader-content');
      expect(loaderContent).toBeTruthy();
    });

    it('should render spinner wrapper', () => {
      const spinnerWrapper = compiled.querySelector('.spinner-wrapper');
      expect(spinnerWrapper).toBeTruthy();
    });

    it('should render mat-spinner with default properties', () => {
      const spinner = compiled.querySelector('mat-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should render default loading message', () => {
      const loaderText = compiled.querySelector('.loader-text');
      expect(loaderText).toBeTruthy();
      expect(loaderText?.textContent).toBe('Loading...');
    });

    it('should not render subtitle when empty', () => {
      const loaderSubtitle = compiled.querySelector('.loader-subtitle');
      expect(loaderSubtitle).toBeFalsy();
    });

    it('should not render icon when empty', () => {
      const loaderIcon = compiled.querySelector('.loader-icon');
      expect(loaderIcon).toBeFalsy();
    });
  });

  describe('Input properties', () => {
    it('should render custom message', () => {
      component.message = 'Custom loading message';
      fixture.detectChanges();

      const loaderText = compiled.querySelector('.loader-text');
      expect(loaderText?.textContent).toBe('Custom loading message');
    });

    it('should render subtitle when provided', () => {
      component.subtitle = 'Please wait while we fetch your data';
      fixture.detectChanges();

      const loaderSubtitle = compiled.querySelector('.loader-subtitle');
      expect(loaderSubtitle).toBeTruthy();
      expect(loaderSubtitle?.textContent).toBe('Please wait while we fetch your data');
    });

    it('should render icon when provided', () => {
      component.icon = 'movie';
      fixture.detectChanges();

      const loaderIcon = compiled.querySelector('.loader-icon');
      expect(loaderIcon).toBeTruthy();
      expect(loaderIcon?.textContent).toBe('movie');
    });

    it('should apply custom size to spinner', () => {
      component.size = 80;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner.componentInstance.diameter).toBe(80);
    });

    it('should apply custom color to spinner', () => {
      component.color = 'accent';
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner.componentInstance.color).toBe('accent');
    });

    it('should apply overlay class when overlay is true', () => {
      component.overlay = true;
      fixture.detectChanges();

      const loaderContainer = compiled.querySelector('.loader-container');
      expect(loaderContainer?.classList.contains('overlay')).toBe(true);
    });

    it('should not apply overlay class when overlay is false', () => {
      component.overlay = false;
      fixture.detectChanges();

      const loaderContainer = compiled.querySelector('.loader-container');
      expect(loaderContainer?.classList.contains('overlay')).toBe(false);
    });
  });

  describe('Color variants', () => {
    it('should handle primary color', () => {
      component.color = 'primary';
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner.componentInstance.color).toBe('primary');
    });

    it('should handle accent color', () => {
      component.color = 'accent';
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner.componentInstance.color).toBe('accent');
    });

    it('should handle warn color', () => {
      component.color = 'warn';
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner.componentInstance.color).toBe('warn');
    });
  });

  describe('Size variants', () => {
    it('should handle small size', () => {
      component.size = 30;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner.componentInstance.diameter).toBe(30);
    });

    it('should handle large size', () => {
      component.size = 100;
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(By.css('mat-spinner'));
      expect(spinner.componentInstance.diameter).toBe(100);
    });
  });

  describe('Complete loader configurations', () => {
    it('should render full loader with all properties', () => {
      component.size = 60;
      component.color = 'accent';
      component.message = 'Loading movies...';
      component.subtitle = 'This may take a few seconds';
      component.icon = 'local_movies';
      component.overlay = true;
      fixture.detectChanges();

      const loaderContainer = compiled.querySelector('.loader-container');
      const loaderText = compiled.querySelector('.loader-text');
      const loaderSubtitle = compiled.querySelector('.loader-subtitle');
      const loaderIcon = compiled.querySelector('.loader-icon');
      const spinner = fixture.debugElement.query(By.css('mat-spinner'));

      expect(loaderContainer?.classList.contains('overlay')).toBe(true);
      expect(loaderText?.textContent).toBe('Loading movies...');
      expect(loaderSubtitle?.textContent).toBe('This may take a few seconds');
      expect(loaderIcon?.textContent).toBe('local_movies');
      expect(spinner.componentInstance.diameter).toBe(60);
      expect(spinner.componentInstance.color).toBe('accent');
    });

    it('should render minimal loader with only spinner', () => {
      component.message = '';
      component.subtitle = '';
      component.icon = '';
      component.overlay = false;
      fixture.detectChanges();

      const loaderContainer = compiled.querySelector('.loader-container');
      const loaderText = compiled.querySelector('.loader-text');
      const loaderSubtitle = compiled.querySelector('.loader-subtitle');
      const loaderIcon = compiled.querySelector('.loader-icon');
      const spinner = compiled.querySelector('mat-spinner');

      expect(loaderContainer?.classList.contains('overlay')).toBe(false);
      expect(loaderText).toBeFalsy();
      expect(loaderSubtitle).toBeFalsy();
      expect(loaderIcon).toBeFalsy();
      expect(spinner).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have proper structure for screen readers', () => {
      component.message = 'Loading content';
      component.subtitle = 'Please wait';
      fixture.detectChanges();

      const loaderText = compiled.querySelector('.loader-text');
      const loaderSubtitle = compiled.querySelector('.loader-subtitle');

      expect(loaderText).toBeTruthy();
      expect(loaderSubtitle).toBeTruthy();
    });

    it('should provide meaningful text content', () => {
      component.message = 'Fetching movie data';
      component.subtitle = 'This should only take a moment';
      fixture.detectChanges();

      const loaderText = compiled.querySelector('.loader-text');
      const loaderSubtitle = compiled.querySelector('.loader-subtitle');

      expect(loaderText?.textContent).toContain('Fetching movie data');
      expect(loaderSubtitle?.textContent).toContain('This should only take a moment');
    });
  });

  describe('Styling and layout', () => {
    it('should have correct CSS classes applied', () => {
      const loaderContainer = compiled.querySelector('.loader-container');
      const loaderContent = compiled.querySelector('.loader-content');
      const spinnerWrapper = compiled.querySelector('.spinner-wrapper');

      expect(loaderContainer).toBeTruthy();
      expect(loaderContent).toBeTruthy();
      expect(spinnerWrapper).toBeTruthy();
    });

    it('should apply overlay styles when overlay is enabled', () => {
      component.overlay = true;
      fixture.detectChanges();

      const loaderContainer = compiled.querySelector('.loader-container.overlay');
      expect(loaderContainer).toBeTruthy();
    });

    it('should position icon correctly within spinner', () => {
      component.icon = 'refresh';
      fixture.detectChanges();

      const spinnerWrapper = compiled.querySelector('.spinner-wrapper');
      const loaderIcon = compiled.querySelector('.loader-icon');

      expect(spinnerWrapper).toBeTruthy();
      expect(loaderIcon).toBeTruthy();
      expect(spinnerWrapper?.contains(loaderIcon as Node)).toBe(true);
    });
  });

  describe('Dynamic updates', () => {
    it('should update message dynamically', () => {
      component.message = 'Initial message';
      fixture.detectChanges();

      let loaderText = compiled.querySelector('.loader-text');
      expect(loaderText?.textContent).toBe('Initial message');

      component.message = 'Updated message';
      fixture.detectChanges();

      loaderText = compiled.querySelector('.loader-text');
      expect(loaderText?.textContent).toBe('Updated message');
    });

    it('should toggle overlay mode dynamically', () => {
      component.overlay = false;
      fixture.detectChanges();

      let loaderContainer = compiled.querySelector('.loader-container');
      expect(loaderContainer?.classList.contains('overlay')).toBe(false);

      component.overlay = true;
      fixture.detectChanges();

      loaderContainer = compiled.querySelector('.loader-container');
      expect(loaderContainer?.classList.contains('overlay')).toBe(true);
    });

    it('should show/hide icon dynamically', () => {
      component.icon = '';
      fixture.detectChanges();

      let loaderIcon = compiled.querySelector('.loader-icon');
      expect(loaderIcon).toBeFalsy();

      component.icon = 'star';
      fixture.detectChanges();

      loaderIcon = compiled.querySelector('.loader-icon');
      expect(loaderIcon).toBeTruthy();
      expect(loaderIcon?.textContent).toBe('star');
    });
  });
});