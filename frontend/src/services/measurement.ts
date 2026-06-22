import api from "./api";


interface MeasurementData {
  vitaminB12: number;
  folate: number;
  b12Status: string;
  folateStatus: string;
}


export async function saveMeasurement(
  data: MeasurementData
) {

  const response = await api.post(
    "/api/measurements",
    data
  );


  return response.data;
}
export async function getMeasurements() {

  const response = await api.get(
    "/api/measurements"
  );

  return response.data;

}