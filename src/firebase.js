import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNwcVs6LG_Qerhvee5R-33Lxo05i6NAMQ",
  authDomain: "personal-tasks-f6553.firebaseapp.com",
  projectId: "personal-tasks-f6553",
  storageBucket: "personal-tasks-f6553.appspot.com",
  messagingSenderId: "383611478586",
  appId: "1:383611478586:web:6a0d57c23bd037d3024b03",
  measurementId: "G-E3H1E6HJK5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
