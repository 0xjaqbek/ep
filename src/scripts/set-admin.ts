import * as admin from 'firebase-admin';
const serviceAccount = require('../../punkty999-31eff-firebase-adminsdk-fbsvc-b617ca8b2b.json');

admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
 databaseURL: "https://punkty999-31eff.firebaseio.com"
});

const targetUid = 'WlvcmBqfnmUknQGtIIWSH0sttmY2';

async function setAdminRole(): Promise<void> {
 try {
   await admin.auth().setCustomUserClaims(targetUid, {role: 'admin'});
   
   const userRef = admin.firestore().collection('users').doc(targetUid);
   await userRef.update({
     role: 'admin',
     updatedAt: admin.firestore.FieldValue.serverTimestamp()
   });
   
   console.log(`Admin role set for user ${targetUid}`);
 } catch (error) {
   console.error('Error:', error);
 } finally {
   process.exit();
 }
}

setAdminRole();