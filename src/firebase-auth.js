// src/firebase-auth.js
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import app from "./firebase-config";

const auth = getAuth(app);

// Function to Sign In
export const login = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Function to Sign Up
export const signup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
