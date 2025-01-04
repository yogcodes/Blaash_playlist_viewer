import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { auth } from "./firebase/firebaseConfig";

import { get, ref, set } from "firebase/database";
import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
} from "firebase/auth";

export const getAccesToken = async () => {
  let accessToken = localStorage.getItem("access_token");
  if (accessToken) return accessToken;

  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope("https://www.googleapis.com/auth/youtube.readonly");

  const result = await signInWithPopup(auth, googleProvider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
   accessToken = credential.accessToken; // This is the token to use in API requests
  localStorage.setItem("access_token", accessToken);
  return accessToken;
};
