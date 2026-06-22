import mongoose from "mongoose";


const measurementSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    vitaminB12: {
      type: Number,
      required: true,
    },

    folate: {
      type: Number,
      required: true,
    },

    b12Status: {
      type: String,
      required: true,
    },

    folateStatus: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


const Measurement = mongoose.model(
  "Measurement",
  measurementSchema
);


export default Measurement;