import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

//let test = {keyword: "trump", startdate: "2021-01-18", enddate: "2021-02-20"};

const graphOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Frequency of Terms (past 30 days)',
    },
  },
};


type dateFreq = [date: Date, freq: number];


type Props = {
  terms: string[];
};


const PopupGraph = ({ terms }: Props) =>{
  const [ graphData , setGraphData] = useState<any>([]);
  // Function for getting a string in YYYY-MM-DD format
  function dateToString(date: Date){
    let mm = date.getMonth()+1;
    let dd = date.getDate();
    let dateString: string = [date.getFullYear(), (mm>9 ? "" : "0") + mm,(dd>9 ? "" : "0") + dd].join("-")
    return dateString;
  }
  
  
  // Function for getting each of the terms data over the time period
  function fetchTimeSeries(keywords: string[], startDate: string, endDate: string) {
    keywords.forEach((term: string) => {
      let termInput = {keyword: term, startdate: startDate, enddate: endDate};
      console.log(`Input: ${JSON.stringify(termInput)}`);
      fetch("./api/getTimeSeries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: termInput }),
      })
      .then((response) => response.json())
      .then((response) => {
        setGraphData(response);
        console.log(response);
        console.log(`Got ${term}`);
      });
    });
  }

  useEffect(() => {
    console.log("fetching timeseries data...");
    // Getting the start and end date in string form
    let currDate: Date = new Date("2022-02-20");
    let startDate: string = dateToString(currDate);
    let lastDate: Date = new Date(currDate.valueOf());
    lastDate.setDate(currDate.getDate() + 30);
    let endDate: string = dateToString(lastDate);
    let dates: string[] = [];
    // Makes an array of dates for labels on the graph
    while (lastDate <= currDate){
      dates.push(dateToString(lastDate));
      lastDate.setDate(lastDate.getDate()+1);
    }
    
    fetchTimeSeries(terms, startDate, endDate);
  }, []);


  return(
    <p>{JSON.stringify(graphData)}</p>
  );
}

export default PopupGraph;
