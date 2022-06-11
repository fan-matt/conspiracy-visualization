import styled from 'styled-components';
import Button from './Button';
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

let StyledDiv =  styled.div`
  height: 70%;
`

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
let testData = {"labels":["2022-02-19","2022-02-20","2022-02-21","2022-02-22","2022-02-23","2022-02-24","2022-02-25","2022-02-26","2022-02-27","2022-02-28","2022-03-01","2022-03-02","2022-03-03","2022-03-04","2022-03-05","2022-03-06","2022-03-07","2022-03-08","2022-03-09","2022-03-10","2022-03-11","2022-03-12","2022-03-13","2022-03-14","2022-03-15","2022-03-16","2022-03-17","2022-03-18","2022-03-19","2022-03-20"],"datasets":[{"label":"parler","data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"label":"trump","data":[2,1,8,0,4,8,6,11,11,1,1,5,4,9,0,7,6,8,13,8,0,5,5,8,6,0,5,0,5,5]},{"label":"jfk","data":[0,0,0,0,1,0,1,1,1,0,0,1,1,0,0,0,1,2,0,0,0,1,1,0,1,0,0,0,0,0]},{"label":"moon landing","data":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]},{"label":"russia","data":[3,0,6,0,13,20,19,19,25,4,11,26,42,42,0,9,16,30,29,36,0,43,43,48,21,0,15,0,23,20]}]}



let graphOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Frequency of Terms (past '+30+' days)',
      color: 'white',
    },
  },
  scales: {
    yAxes: {
      ticks: {
        color: 'white',
      },
    },
    xAxes: {
      ticks: {
        color: 'white',
      },
    },
  },
  color: "white",
};


type dateFreq = [date: Date, freq: number];


type Props = {
  terms: string[];
};


const PopupGraph = ({ terms }: Props) =>{
  const [ graphData , setGraphData] = useState<any>(testData);
  const [ dateRange, setDateRange ] = useState(30);
  // Function for getting a string in YYYY-MM-DD format
  function dateToString(date: Date){
    let mm = date.getMonth()+1;
    let dd = date.getDate();
    let dateString: string = [date.getFullYear(), (mm>9 ? "" : "0") + mm,(dd>9 ? "" : "0") + dd].join("-")
    return dateString;
  }
  
  
  // Function for getting each of the terms data over the time period
  function fetchTimeSeries(keywords: string[], startDate: string, numDays: number) {
    let termInput = {keywords: keywords, startDate: startDate, numDays: numDays};
    console.log(`Input: ${JSON.stringify(termInput)}`);
    fetch("./api/getPastDaysTimeSeries", {
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
      console.log(`Got Data!`);
    });
  }

  useEffect(() => {
    console.log("fetching timeseries data...");
    // Getting the start and end date in string form
    let currDate: Date = new Date();
    currDate.setDate(currDate.getDate() - dateRange);
    console.log(currDate);
    let startDate: string = dateToString(currDate);
    graphOptions.plugins.title.text = 'Frequency of Terms (past '+dateRange+' days)';
    fetchTimeSeries(terms, startDate, dateRange);
  }, [terms, dateRange]);


  return(
    <StyledDiv>
      <Button onClick={() => setDateRange(30)}>30 days</Button>
      <Button onClick={() => setDateRange(180)}>6 months</Button>
      <Line options={graphOptions} data={graphData} />
    </StyledDiv>
  );
}


export default PopupGraph;
