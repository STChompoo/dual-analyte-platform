import express from "express";

import Measurement from "../models/Measurement";

import {
  verifyToken,
  AuthRequest,
} from "../middleware/auth";


const router = express.Router();


/*
--------------------------
SAVE NEW MEASUREMENT
POST /api/measurements
--------------------------
*/

router.post(
  "/",
  verifyToken,
  async (req: AuthRequest, res) => {

    try {

      const {
        vitaminB12,
        folate,
        b12Status,
        folateStatus,
      } = req.body;


      const newMeasurement =
        new Measurement({

          uid: req.user?.uid,

          email: req.user?.email,

          vitaminB12,

          folate,

          b12Status,

          folateStatus,

        });


      await newMeasurement.save();


      res.status(201).json({
        message: "Measurement saved",
        data: newMeasurement,
      });

    }
    catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error",
      });

    }

  }
);



/*
--------------------------
GET USER HISTORY
GET /api/measurements
--------------------------
*/

router.get(
  "/",
  verifyToken,
  async (req: AuthRequest, res) => {

    try {

      const history =
        await Measurement.find({
          uid: req.user?.uid,
        })
        .sort({
          createdAt: -1,
        });


      res.json(history);

    }
    catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server error",
      });

    }

  }
);


export default router;