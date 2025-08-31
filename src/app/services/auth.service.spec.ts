import { TestBed } from '@angular/core/testing';
import { Auth, User } from '@angular/fire/auth';
import { of, BehaviorSubject, throwError } from 'rxjs';

import { AuthService, AuthUser } from './auth.service';

// Mock Firebase Auth functions
const mockSignInWithEmailAndPassword = jasmine.createSpy('signInWithEmailAndPassword');
const mockCreateUserWithEmailAndPassword = jasmine.createSpy('createUserWithEmailAndPassword');
const mockSignOut = jasmine.createSpy('signOut');
const mockAuthState = jasmine.createSpy('authState');

// Mock Firebase Auth module
(window as any).signInWithEmailAndPassword = mockSignInWithEmailAndPassword;
(window as any).createUserWithEmailAndPassword = mockCreateUserWithEmailAndPassword;
(window as any).signOut = mockSignOut;
(window as any).authState = mockAuthState;

describe('AuthService', () => {
  let service: AuthService;
  let mockAuth: jasmine.SpyObj<Auth>;
  let userSubject: BehaviorSubject<User | null>;

  const mockFirebaseUser: User = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as any,
    providerData: [],
    refreshToken: 'refresh-token',
    tenantId: null,
    delete: jasmine.createSpy('delete'),
    getIdToken: jasmine.createSpy('getIdToken'),
    getIdTokenResult: jasmine.createSpy('getIdTokenResult'),
    reload: jasmine.createSpy('reload'),
    toJSON: jasmine.createSpy('toJSON'),
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase'
  };

  beforeEach(() => {
    userSubject = new BehaviorSubject<User | null>(null);
    
    const authSpy = jasmine.createSpyObj('Auth', ['signInWithEmailAndPassword', 'createUserWithEmailAndPassword', 'signOut'], {
      currentUser: null
    });

    // Reset mocks
    mockSignInWithEmailAndPassword.calls.reset();
    mockCreateUserWithEmailAndPassword.calls.reset();
    mockSignOut.calls.reset();
    mockAuthState.calls.reset();
    
    // Setup mock returns
    mockSignInWithEmailAndPassword.and.returnValue(Promise.resolve({ user: mockFirebaseUser }));
    mockCreateUserWithEmailAndPassword.and.returnValue(Promise.resolve({ user: mockFirebaseUser }));
    mockSignOut.and.returnValue(Promise.resolve());
    mockAuthState.and.returnValue(userSubject.asObservable());

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: authSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    mockAuth = TestBed.inject(Auth) as jasmine.SpyObj<Auth>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('signIn', () => {
    it('should sign in user with email and password', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const result = await service.signIn(email, password);

      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, email, password);
      expect(result).toBeTruthy();
    });

    it('should handle sign in errors', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const error = new Error('Invalid credentials');
      
      mockSignInWithEmailAndPassword.and.returnValue(Promise.reject(error));

      try {
        await service.signIn(email, password);
        fail('Expected error to be thrown');
      } catch (e) {
        expect(e).toBe(error);
      }
    });
  });

  describe('signUp', () => {
    it('should create new user with email and password', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';

      const result = await service.signUp(email, password);

      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, email, password);
      expect(result).toBeTruthy();
    });

    it('should handle sign up errors', async () => {
      const email = 'existing@example.com';
      const password = 'password123';
      const error = new Error('Email already in use');
      
      mockCreateUserWithEmailAndPassword.and.returnValue(Promise.reject(error));

      try {
        await service.signUp(email, password);
        fail('Expected error to be thrown');
      } catch (e) {
        expect(e).toBe(error);
      }
    });
  });

  describe('signOut', () => {
    it('should sign out current user', async () => {
      await service.signOut();

      expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
    });

    it('should handle sign out errors', async () => {
      const error = new Error('Sign out failed');
      mockSignOut.and.returnValue(Promise.reject(error));

      try {
        await service.signOut();
        fail('Expected error to be thrown');
      } catch (e) {
        expect(e).toBe(error);
      }
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from auth', () => {
      // Mock the currentUser property
      Object.defineProperty(mockAuth, 'currentUser', {
        get: () => mockFirebaseUser,
        configurable: true
      });

      const result = service.getCurrentUser();

      expect(result).toEqual(mockFirebaseUser);
    });

    it('should return null when no user is signed in', () => {
      Object.defineProperty(mockAuth, 'currentUser', {
        get: () => null,
        configurable: true
      });

      const result = service.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is signed in', () => {
      Object.defineProperty(mockAuth, 'currentUser', {
        get: () => mockFirebaseUser,
        configurable: true
      });

      const result = service.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when no user is signed in', () => {
      Object.defineProperty(mockAuth, 'currentUser', {
        get: () => null,
        configurable: true
      });

      const result = service.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getUserData', () => {
    it('should return user data when user is signed in', () => {
      Object.defineProperty(mockAuth, 'currentUser', {
        get: () => mockFirebaseUser,
        configurable: true
      });

      const result = service.getUserData();

      expect(result).toEqual({
        uid: 'test-uid',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null
      });
    });

    it('should return null when no user is signed in', () => {
      Object.defineProperty(mockAuth, 'currentUser', {
        get: () => null,
        configurable: true
      });

      const result = service.getUserData();

      expect(result).toBeNull();
    });
  });

  describe('user$ observable', () => {
    it('should emit user state changes', (done) => {
      const testUser: User = {
        ...mockFirebaseUser,
        uid: 'observable-test-uid'
      };

      service.user$.subscribe(user => {
        if (user) {
          expect(user.uid).toBe('observable-test-uid');
          done();
        }
      });

      userSubject.next(testUser);
    });

    it('should emit null when user signs out', (done) => {
      let emissionCount = 0;
      
      service.user$.subscribe(user => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(user).toEqual(mockFirebaseUser);
        } else if (emissionCount === 2) {
          expect(user).toBeNull();
          done();
        }
      });

      userSubject.next(mockFirebaseUser);
      userSubject.next(null);
    });
  });
});