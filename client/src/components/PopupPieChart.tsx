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
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement);


let StyledDiv =  styled.div`
  height: 60%;
  display: flex;
  flex-direction: row;
  padding: 10px;
`

let graphOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Source Distribution',
      color: 'white',
    },
  },
  color: "white",
};

const testData = {labels: ["4chan", "8chan", "twitter", "reddit"], datasets: [{label: "Source Distribution", data: [10, 10, 50, 30]}]};

const PopupPieChart = () =>{
  const [ graphData , setGraphData] = useState<any>(testData);
  
  /*
  function fetchSourceFreq(keywords: string[], startDate: string, numDays: number) {
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
*/
  useEffect(() => {
    console.log("fetching frequency data...");
    // Getting the start and end date in string form

    //fetchTimeSeries(terms, startDate, dateRange);
  }, []);


  return(
    <StyledDiv>
      <Pie data={graphData} options={graphOptions}/>

    </StyledDiv>
    
  );
}

export default PopupPieChart;
