import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { ServiceAccount } from "firebase-admin";

import serviceAccount from "../serviceAccountKey.json";


const app = initializeApp({
  credential: cert(
    serviceAccount as unknown as ServiceAccount
  ),
});


export const adminAuth = getAuth(app);