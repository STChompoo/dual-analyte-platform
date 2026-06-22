import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  DecodedIdToken,
} from "firebase-admin/auth";

import { adminAuth } from "../firebaseAdmin";


export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}


export async function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {

  try {

    const header = req.headers.authorization;


    if (!header || !header.startsWith("Bearer ")) {

      res.status(401).json({
        message: "Unauthorized",
      });

      return;
    }


    const token = header.split(" ")[1];


    const decodedToken =
      await adminAuth.verifyIdToken(token);


    req.user = decodedToken;


    next();

  }
  catch (error) {

    res.status(401).json({
      message: "Invalid token",
    });

  }

}