// src/services/AuthService.ts
import { 
    auth, 
    db 
  } from '../../firebase/config.ts';
  import { 
    signInWithEmailAndPassword, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup,
    sendPasswordResetEmail 
  } from 'firebase/auth';
  import { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp 
  } from 'firebase/firestore';
  
  export class AuthService {
    private googleProvider: GoogleAuthProvider;
  
    constructor() {
      this.googleProvider = new GoogleAuthProvider();
      // Add additional scopes if needed
      this.googleProvider.addScope('email');
      this.googleProvider.addScope('profile');
    }
  
    async login(email: string, password: string) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
      } catch (error: any) {
        throw this.handleAuthError(error);
      }
    }
  
    async loginWithGoogle() {
      try {
        const result = await signInWithPopup(auth, this.googleProvider);
        const user = result.user;
    
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
    
        if (!userDoc.exists()) {
          // Create new user document with default 'student' role
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'User',
            role: 'student', // Default role
            phoneNumber: user.phoneNumber || '',
            address: {
              street: '',
              city: '',
              postalCode: '',
              country: 'Poland'
            },
            purchasedCourses: [],
            completedCourses: [],
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            provider: 'google'
          });
        } else {
          // Preserve existing role when logging in
          const existingUserData = userDoc.data();
          await setDoc(userRef, {
            lastLoginAt: serverTimestamp(),
            role: existingUserData?.role || 'student' // Preserve existing role
          }, { merge: true });
        }
    
        return user;
      } catch (error: any) {
        console.error('Google sign in error:', error);
        throw this.handleAuthError(error);
      }
    }
  
    async logout() {
      try {
        await signOut(auth);
      } catch (error: any) {
        throw this.handleAuthError(error);
      }
    }
  
    async resetPassword(email: string) {
      try {
        await sendPasswordResetEmail(auth, email);
      } catch (error: any) {
        throw this.handleAuthError(error);
      }
    }
  
    private handleAuthError(error: any): Error {
      let message = 'An unexpected error occurred';
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'No user found with this email';
          break;
        case 'auth/wrong-password':
          message = 'Invalid password';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email address';
          break;
        case 'auth/email-already-in-use':
          message = 'Email already in use';
          break;
        case 'auth/popup-closed-by-user':
          message = 'Sign-in popup was closed before completing';
          break;
        case 'auth/cancelled-popup-request':
          message = 'Another sign-in popup is already open';
          break;
        case 'auth/popup-blocked':
          message = 'Sign-in popup was blocked by the browser';
          break;
        case 'auth/network-request-failed':
          message = 'Network error occurred. Please check your connection';
          break;
        default:
          message = error.message || 'Authentication error occurred';
      }
      
      return new Error(message);
    }
  }