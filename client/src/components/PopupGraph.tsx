import { useEffect, useState } from "react";
//import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

let test = {keyword: "trump", startdate: "2021-01-18", enddate: "2021-02-20"};
const graphTerms: string[] = ["parler", "trump", "jfk", "moon landing", "russia"];


type dateFreq = [date: Date, num: number];


type Props = {
  terms: string[];
};

const PopupGraph = ({ terms }: Props) =>{
  const [ graphData , setGraphData] = useState<Array<dateFreq>>([]);
  //const [ searchTerm, setSearchTerm] = useState("trump");
  // Getting the start and end date in string form
  
  function fetchTimeSeries() {
    let currInput = {keyword: "trump", startdate: "2021-01-18", enddate: "2021-02-20"};
    fetch("./api/getTimeSeries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: currInput }),
    })
    .then((response) => response.json())
    .then((response) => {console.log(response); setGraphData(response); console.log(graphData)});
  }

  useEffect(() => {
    //let currDate: Date = new Date("2021-02-20");
    //let endDate: string = dateToString(currDate);
    //currDate.setDate(currDate.getDate()-30);
    //let startDate: string = dateToString(currDate);
    
    console.log("fetching timeseries data...");
    
    
    fetchTimeSeries();
  }, []);

  //Function for getting a string in YYYY-MM-DD format
  const dateToString = graphData.map((dateFreq) => {
    let thisDate = new Date(dateFreq[0]);
    let mm = thisDate.getMonth()+1;
    let dd = thisDate.getDate();
    let dates = [thisDate.getFullYear(), (mm>9 ? "" : "0") + mm,(dd>9 ? "" : "0") + dd].join("-");

    return(
      <p>{dates} {dateFreq[1]}</p>
    );
  })


  return(
    <div>{dateToString}</div>
  );
}

export default PopupGraph;
