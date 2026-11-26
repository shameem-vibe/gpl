"use client";
/** Browser Firebase SDK. Only public identifiers live here; privileged work happens in /api routes. */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export const isFirebaseClientConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let appCheckStarted = false;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseClientConfigured) throw new Error("Firebase is not configured. See docs/SETUP.md.");
  const app = getApps().length ? getApp() : initializeApp(config);
  const siteKey = process.env.NEXT_PUBLIC_APPCHECK_SITE_KEY;
  if (typeof window !== "undefined" && siteKey && !appCheckStarted) {
    appCheckStarted = true;
    initializeAppCheck(app, { provider: new ReCaptchaV3Provider(siteKey), isTokenAutoRefreshEnabled: true });
  }
  return app;
}
export const getClientAuth = (): Auth => getAuth(getFirebaseApp());
export const getClientFirestore = (): Firestore => getFirestore(getFirebaseApp());
