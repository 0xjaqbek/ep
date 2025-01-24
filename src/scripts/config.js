"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.auth = void 0;
var dotenv = require("dotenv");
var app_1 = require("firebase/app");
var auth_1 = require("firebase/auth");
var firestore_1 = require("firebase/firestore");
dotenv.config({ path: '.env' });
var firebaseConfig = {
    apiKey: "AIzaSyC8zZ9l8X2yU2TaFKaGuXKxqv6qsE2bM_U",
    authDomain: "punkty999-31eff.firebaseapp.com",
    projectId: "punkty999-31eff",
    storageBucket: "punkty999-31eff.firebasestorage.app",
    messagingSenderId: "583933881300",
    appId: "1:583933881300:web:27cb02772e5adc1e4c8441",
    measurementId: "G-RZ6YEM3JFZ"
};
var app = (0, app_1.initializeApp)(firebaseConfig);
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
