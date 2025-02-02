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
    serverTimestamp, 
    query,
    collection,
    where,
    getDocs,
    updateDoc,
    QueryDocumentSnapshot,
    DocumentData
  } from 'firebase/firestore';
  import { increment, arrayUnion } from 'firebase/firestore';
  export class AuthService {
    private googleProvider: GoogleAuthProvider;
  
    constructor() {
      this.googleProvider = new GoogleAuthProvider();
      this.googleProvider.addScope('email');
      this.googleProvider.addScope('profile');
    }
  
    private generateReferralCode(uid: string): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const prefix = uid.substring(0, 3).toUpperCase();
      const random = Array(4).fill(0)
        .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
        .join('');
      const referralCode = `${prefix}${random}`;
      console.log('Generated Referral Code:', referralCode);
      return referralCode;
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
        // First, attempt the sign in
        const result = await signInWithPopup(auth, this.googleProvider);
        const user = result.user;
    
        // After successful sign in, get the user document reference
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
    
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref');
        let referralPoints = 0;
        let referredBy: string | null = null;
        let referrerDoc: QueryDocumentSnapshot<DocumentData> | undefined;
    
        if (referralCode) {
          const referrerQuery = query(
            collection(db, 'users'), 
            where('referralCode', '==', referralCode)
          );
          const referrerSnapshot = await getDocs(referrerQuery);
    
          if (!referrerSnapshot.empty) {
            referralPoints = 1;
            referredBy = referralCode;
            referrerDoc = referrerSnapshot.docs[0];
          }
        }
    
        if (!userDoc.exists()) {
          // Create new user document with proper initialization
          const newUserData = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'User',
            role: 'student',
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
            referralCode: this.generateReferralCode(user.uid),
            referredBy,
            referralPoints,
            referrals: []
          };
    
          await setDoc(userRef, newUserData);
    
          if (referredBy && referrerDoc) {
            await updateDoc(doc(db, 'users', referrerDoc.id), {
              referralPoints: increment(1),
              referrals: arrayUnion(user.uid)
            });
          }
        }
    
        return result;
      } catch (error) {
        console.error('Google sign in error details:', error);
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
        }
        throw error;
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

