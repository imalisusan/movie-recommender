import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { AuthComponent } from './auth.component';
import { AuthService } from '../../services/auth.service';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn', 'signUp']);
    const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        AuthComponent,
        BrowserAnimationsModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTabsModule,
        MatIconModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.hidePassword).toBeTrue();
      expect(component.isLoading).toBeFalse();
      expect(component.signInData).toEqual({ email: '', password: '' });
      expect(component.signUpData).toEqual({ email: '', password: '', confirmPassword: '' });
    });

    it('should display the correct title and subtitle', () => {
      const title = fixture.debugElement.query(By.css('mat-card-title'));
      const subtitle = fixture.debugElement.query(By.css('mat-card-subtitle'));

      expect(title.nativeElement.textContent).toBe('Movie Recommender');
      expect(subtitle.nativeElement.textContent).toBe('Sign in to get personalized recommendations');
    });

    it('should display both Sign In and Sign Up tabs', () => {
      const tabs = fixture.debugElement.queryAll(By.css('mat-tab'));
      expect(tabs.length).toBe(2);
      expect(tabs[0].attributes['label']).toBe('Sign In');
      expect(tabs[1].attributes['label']).toBe('Sign Up');
    });
  });

  describe('Sign In Form', () => {
    it('should render sign in form elements', () => {
      const emailInput = fixture.debugElement.query(By.css('mat-tab[label="Sign In"] input[type="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('mat-tab[label="Sign In"] input[name="password"]'));
      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign In"] button[type="submit"]'));

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(submitButton).toBeTruthy();
    });

    it('should bind form data to component properties', async () => {
      const emailInput = fixture.debugElement.query(By.css('mat-tab[label="Sign In"] input[type="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('mat-tab[label="Sign In"] input[name="password"]'));

      emailInput.nativeElement.value = 'test@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      passwordInput.nativeElement.value = 'password123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.signInData.email).toBe('test@example.com');
      expect(component.signInData.password).toBe('password123');
    });

    it('should disable submit button when form is invalid', () => {
      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign In"] button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should enable submit button when form is valid', async () => {
      component.signInData.email = 'test@example.com';
      component.signInData.password = 'password123';
      fixture.detectChanges();
      await fixture.whenStable();

      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign In"] button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalse();
    });

    it('should show loading state during sign in', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign In"] button[type="submit"]'));
      expect(submitButton.nativeElement.textContent.trim()).toBe('Signing In...');
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });
  });

  describe('Sign Up Form', () => {
    beforeEach(() => {
      // Switch to Sign Up tab
      const signUpTab = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"]'));
      signUpTab.nativeElement.click();
      fixture.detectChanges();
    });

    it('should render sign up form elements', () => {
      const emailInput = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] input[type="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] input[name="password"]'));
      const confirmPasswordInput = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] input[name="confirmPassword"]'));
      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] button[type="submit"]'));

      expect(emailInput).toBeTruthy();
      expect(passwordInput).toBeTruthy();
      expect(confirmPasswordInput).toBeTruthy();
      expect(submitButton).toBeTruthy();
    });

    it('should bind form data to component properties', async () => {
      const emailInput = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] input[type="email"]'));
      const passwordInput = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] input[name="password"]'));
      const confirmPasswordInput = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] input[name="confirmPassword"]'));

      emailInput.nativeElement.value = 'test@example.com';
      emailInput.nativeElement.dispatchEvent(new Event('input'));
      passwordInput.nativeElement.value = 'password123';
      passwordInput.nativeElement.dispatchEvent(new Event('input'));
      confirmPasswordInput.nativeElement.value = 'password123';
      confirmPasswordInput.nativeElement.dispatchEvent(new Event('input'));
      
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.signUpData.email).toBe('test@example.com');
      expect(component.signUpData.password).toBe('password123');
      expect(component.signUpData.confirmPassword).toBe('password123');
    });

    it('should disable submit button when passwords do not match', async () => {
      component.signUpData.email = 'test@example.com';
      component.signUpData.password = 'password123';
      component.signUpData.confirmPassword = 'different';
      fixture.detectChanges();
      await fixture.whenStable();

      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should enable submit button when form is valid and passwords match', async () => {
      component.signUpData.email = 'test@example.com';
      component.signUpData.password = 'password123';
      component.signUpData.confirmPassword = 'password123';
      fixture.detectChanges();
      await fixture.whenStable();

      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeFalse();
    });

    it('should show loading state during sign up', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] button[type="submit"]'));
      expect(submitButton.nativeElement.textContent.trim()).toBe('Creating Account...');
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', () => {
      expect(component.hidePassword).toBeTrue();

      const toggleButton = fixture.debugElement.query(By.css('button[matSuffix]'));
      toggleButton.nativeElement.click();

      expect(component.hidePassword).toBeFalse();
    });

    it('should show correct icon based on password visibility', () => {
      component.hidePassword = true;
      fixture.detectChanges();

      let icon = fixture.debugElement.query(By.css('button[matSuffix] mat-icon'));
      expect(icon.nativeElement.textContent).toBe('visibility_off');

      component.hidePassword = false;
      fixture.detectChanges();

      icon = fixture.debugElement.query(By.css('button[matSuffix] mat-icon'));
      expect(icon.nativeElement.textContent).toBe('visibility');
    });

    it('should change input type based on password visibility', () => {
      const passwordInput = fixture.debugElement.query(By.css('input[name="password"]'));

      component.hidePassword = true;
      fixture.detectChanges();
      expect(passwordInput.nativeElement.type).toBe('password');

      component.hidePassword = false;
      fixture.detectChanges();
      expect(passwordInput.nativeElement.type).toBe('text');
    });
  });

  describe('Authentication Methods', () => {
    describe('signIn', () => {
      beforeEach(() => {
        component.signInData = { email: 'test@example.com', password: 'password123' };
      });

      it('should call authService.signIn with correct parameters', async () => {
        authService.signIn.and.returnValue(Promise.resolve());

        await component.signIn();

        expect(authService.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });

      it('should show success message on successful sign in', async () => {
        authService.signIn.and.returnValue(Promise.resolve());

        await component.signIn();

        expect(snackBar.open).toHaveBeenCalledWith(
          'Successfully signed in!',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      });

      it('should show error message on sign in failure', async () => {
        const error = new Error('Invalid credentials');
        authService.signIn.and.returnValue(Promise.reject(error));

        await component.signIn();

        expect(snackBar.open).toHaveBeenCalledWith(
          'Invalid credentials',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      });

      it('should handle loading state correctly', async () => {
        let resolvePromise: () => void;
        const promise = new Promise<void>((resolve) => {
          resolvePromise = resolve;
        });
        authService.signIn.and.returnValue(promise);

        const signInPromise = component.signIn();
        expect(component.isLoading).toBeTrue();

        resolvePromise!();
        await signInPromise;
        expect(component.isLoading).toBeFalse();
      });

      it('should not proceed if already loading', async () => {
        component.isLoading = true;
        authService.signIn.and.returnValue(Promise.resolve());

        await component.signIn();

        expect(authService.signIn).not.toHaveBeenCalled();
      });
    });

    describe('signUp', () => {
      beforeEach(() => {
        component.signUpData = {
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123'
        };
      });

      it('should call authService.signUp with correct parameters', async () => {
        authService.signUp.and.returnValue(Promise.resolve());

        await component.signUp();

        expect(authService.signUp).toHaveBeenCalledWith('test@example.com', 'password123');
      });

      it('should show success message on successful sign up', async () => {
        authService.signUp.and.returnValue(Promise.resolve());

        await component.signUp();

        expect(snackBar.open).toHaveBeenCalledWith(
          'Account created successfully!',
          'Close',
          { duration: 3000, panelClass: ['success-snackbar'] }
        );
      });

      it('should show error message on sign up failure', async () => {
        const error = new Error('Email already exists');
        authService.signUp.and.returnValue(Promise.reject(error));

        await component.signUp();

        expect(snackBar.open).toHaveBeenCalledWith(
          'Email already exists',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      });

      it('should show error when passwords do not match', async () => {
        component.signUpData.confirmPassword = 'different';

        await component.signUp();

        expect(snackBar.open).toHaveBeenCalledWith(
          'Passwords do not match!',
          'Close',
          { duration: 3000, panelClass: ['error-snackbar'] }
        );
        expect(authService.signUp).not.toHaveBeenCalled();
      });

      it('should handle loading state correctly', async () => {
        let resolvePromise: () => void;
        const promise = new Promise<void>((resolve) => {
          resolvePromise = resolve;
        });
        authService.signUp.and.returnValue(promise);

        const signUpPromise = component.signUp();
        expect(component.isLoading).toBeTrue();

        resolvePromise!();
        await signUpPromise;
        expect(component.isLoading).toBeFalse();
      });

      it('should not proceed if already loading', async () => {
        component.isLoading = true;
        authService.signUp.and.returnValue(Promise.resolve());

        await component.signUp();

        expect(authService.signUp).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should require email and password for sign in', async () => {
      component.signInData = { email: '', password: '' };
      fixture.detectChanges();
      await fixture.whenStable();

      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign In"] button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should require minimum password length for sign up', async () => {
      component.signUpData = {
        email: 'test@example.com',
        password: '123',
        confirmPassword: '123'
      };
      fixture.detectChanges();
      await fixture.whenStable();

      const submitButton = fixture.debugElement.query(By.css('mat-tab[label="Sign Up"] button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBeTrue();
    });

    it('should show password hint for sign up', () => {
      const hint = fixture.debugElement.query(By.css('mat-hint'));
      expect(hint.nativeElement.textContent).toBe('Password must be at least 6 characters');
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      const labels = fixture.debugElement.queryAll(By.css('mat-label'));
      const labelTexts = labels.map(label => label.nativeElement.textContent);
      
      expect(labelTexts).toContain('Email');
      expect(labelTexts).toContain('Password');
      expect(labelTexts).toContain('Confirm Password');
    });

    it('should have proper button types', () => {
      const submitButtons = fixture.debugElement.queryAll(By.css('button[type="submit"]'));
      expect(submitButtons.length).toBe(2);

      const toggleButtons = fixture.debugElement.queryAll(By.css('button[type="button"]'));
      expect(toggleButtons.length).toBeGreaterThan(0);
    });
  });

  describe('UI Styling', () => {
    it('should apply correct CSS classes', () => {
      const container = fixture.debugElement.query(By.css('.auth-container'));
      const card = fixture.debugElement.query(By.css('.auth-card'));
      const forms = fixture.debugElement.queryAll(By.css('.auth-form'));
      const buttons = fixture.debugElement.queryAll(By.css('.auth-button'));

      expect(container).toBeTruthy();
      expect(card).toBeTruthy();
      expect(forms.length).toBe(2);
      expect(buttons.length).toBe(2);
    });
  });
});