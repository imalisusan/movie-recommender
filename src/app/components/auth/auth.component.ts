import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Movie Recommender</mat-card-title>
          <mat-card-subtitle>Sign in to get personalized recommendations</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <mat-tab-group>
            <mat-tab label="Sign In">
              <form (ngSubmit)="signIn()" #signInForm="ngForm" class="auth-form">
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" [(ngModel)]="signInData.email" name="email" required>
                  <mat-icon matSuffix>email</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Password</mat-label>
                  <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="signInData.password" name="password" required>
                  <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                    <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                </mat-form-field>
                
                <button mat-raised-button color="primary" type="submit" [disabled]="!signInForm.form.valid || isLoading" class="auth-button">
                  {{isLoading ? 'Signing In...' : 'Sign In'}}
                </button>
              </form>
            </mat-tab>
            
            <mat-tab label="Sign Up">
              <form (ngSubmit)="signUp()" #signUpForm="ngForm" class="auth-form">
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput type="email" [(ngModel)]="signUpData.email" name="email" required>
                  <mat-icon matSuffix>email</mat-icon>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Password</mat-label>
                  <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="signUpData.password" name="password" required minlength="6">
                  <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                    <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                  <mat-hint>Password must be at least 6 characters</mat-hint>
                </mat-form-field>
                
                <mat-form-field appearance="outline">
                  <mat-label>Confirm Password</mat-label>
                  <input matInput [type]="hidePassword ? 'password' : 'text'" [(ngModel)]="signUpData.confirmPassword" name="confirmPassword" required>
                  <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
                    <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
                  </button>
                </mat-form-field>
                
                <button mat-raised-button color="primary" type="submit" [disabled]="!signUpForm.form.valid || signUpData.password !== signUpData.confirmPassword || isLoading" class="auth-button">
                  {{isLoading ? 'Creating Account...' : 'Sign Up'}}
                </button>
              </form>
            </mat-tab>
          </mat-tab-group>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .auth-card {
      width: 100%;
      max-width: 400px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border-radius: 16px;
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 20px 0;
    }
    
    .auth-button {
      height: 48px;
      font-size: 16px;
      font-weight: 500;
    }
    
    mat-form-field {
      width: 100%;
    }
    
    mat-card-header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    mat-card-title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
    
    mat-card-subtitle {
      font-size: 14px;
      color: #666;
      margin-top: 8px;
    }
  `]
})
export class AuthComponent {
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  
  hidePassword = true;
  isLoading = false;
  
  signInData = {
    email: '',
    password: ''
  };
  
  signUpData = {
    email: '',
    password: '',
    confirmPassword: ''
  };
  
  async signIn() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    try {
      await this.authService.signIn(
        this.signInData.email,
        this.signInData.password
      );
      this.snackBar.open('Successfully signed in!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Failed to sign in. Please try again.',
        'Close',
        {
          duration: 5000,
          panelClass: ['error-snackbar']
        }
      );
    } finally {
      this.isLoading = false;
    }
  }
  
  async signUp() {
    if (this.isLoading) return;
    
    if (this.signUpData.password !== this.signUpData.confirmPassword) {
      this.snackBar.open('Passwords do not match!', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }
    
    this.isLoading = true;
    try {
      await this.authService.signUp(
        this.signUpData.email,
        this.signUpData.password
      );
      this.snackBar.open('Account created successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      this.snackBar.open(
        error.message || 'Failed to create account. Please try again.',
        'Close',
        {
          duration: 5000,
          panelClass: ['error-snackbar']
        }
      );
    } finally {
      this.isLoading = false;
    }
  }
}