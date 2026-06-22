import {
  useEffect,
  useState,
} from "react";

import {
  getMeasurements,
} from "../services/measurement";
import "./History.css";

interface Measurement {

  _id: string;

  vitaminB12: number;

  folate: number;

  b12Status: string;

  folateStatus: string;

  createdAt: string;
}


export default function History() {


  const [history, setHistory] =
    useState<Measurement[]>([]);


  const [loading, setLoading] =
    useState(true);



  useEffect(() => {


    async function loadHistory() {

      try {

        const data =
          await getMeasurements();


        setHistory(data);


      } catch (error) {


        console.error(
          "Cannot load history",
          error
        );


      } finally {


        setLoading(false);


      }

    }


    loadHistory();


  }, []);



  if (loading) {

    return (
      <h2>
        Loading history...
      </h2>
    );

  }

  function getStatusClass(status:string){

  const text = status.toLowerCase();

  if(text === "normal")
    return "badge normal";

  if(text === "borderline")
    return "badge borderline";

  return "badge deficient";
}

  return (
<div className="history-page">


<div className="history-header">

<h1 className="history-title">
Measurement History
</h1>

<p className="history-subtitle">
Previous Vitamin B12 & Folate Analysis
</p>

</div>


{history.length === 0 ? (

<p className="empty">
No previous measurements
</p>

) : (

history.map(item => (

<div
className="history-card"
key={item._id}
>

<div className="date">

🕒 {
new Date(item.createdAt)
.toLocaleString()
}

</div>


<div className="result-grid">


<div className="result-box">

<div className="result-label">
Vitamin B12
</div>


<div className="result-value">
{item.vitaminB12.toFixed(2)}
 pg/mL
</div>


<div className={getStatusClass(item.b12Status)}>
{item.b12Status}
</div>

</div>



<div className="result-box">

<div className="result-label">
Folate
</div>


<div className="result-value">
{item.folate.toFixed(2)}
 ng/mL
</div>


<div className={getStatusClass(item.folateStatus)}>
{item.folateStatus}
</div>


</div>


</div>

</div>

))

)}

</div>
);

}