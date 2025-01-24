import * as admin from 'firebase-admin';
import * as path from 'path';

// Path to your Firebase service account key JSON
const serviceAccountPath = path.resolve(__dirname, '../../punkty999-31eff-firebase-adminsdk-fbsvc-b617ca8b2b.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath)
});

// Replace with the admin user's UID
const adminUid = 'WlvcmBqfnmUknQGtIIWSH0sttmY2';

async function setAdminRole() {
  try {
    await admin.auth().setCustomUserClaims(adminUid, { role: 'admin' });
    
    const userRef = admin.firestore().collection('users').doc(adminUid);
    await userRef.update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`Admin role set for user ${adminUid}`);
  } catch (error) {
    console.error('Error setting admin role:', error);
  } finally {
    process.exit();
  }
}

setAdminRole();