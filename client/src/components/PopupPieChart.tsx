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
import { setLabels } from 'react-chartjs-2/dist/utils';

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

type graphData = {labels: string[], datasets: [{label: string, data: number[], backgroundColor: string[], hoverOffset: number}]};

const testData = {labels: ["4chan", "8chan", "twitter", "reddit"], datasets: [{label: "Source Distribution", data: [10, 10, 50, 30]}]};
const colors = ["#FFCC0D", "#FF7326", "#FF194D", "#BF2669", "#702A8C", "#468c2a",  "#26b2ff"];

const PopupPieChart = () =>{
  const [ graphData , setGraphData] = useState<any>(testData);
  
  async function fetchDates() {
    const response = await fetch("./api/graphDates", {
      method: "POST",
    });

    const dates = await response.json();
    return dates;
  }

  function fetchSourceFreq(startDate: string, numDays: number) {
    let termInput = {startDate: startDate, numDays: numDays};
    fetch("./api/getNumSources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: termInput }),
    })
    .then((response) => response.json())
    .then((response) => {
      let data: graphData = {labels: [], datasets: [{label: "Source Distribution", data: [], backgroundColor: [], hoverOffset: 4}]};
      let count = 0;
      for (var key in response) {
        data.labels.push(key);
        data.datasets[0].data.push(response[key]);
        data.datasets[0].backgroundColor.push(colors[count % colors.length]);
        count++;
      }
      setGraphData(data);
      console.log(data);
      console.log(`Got freq!`);
    });
  }

  useEffect(() => {
    console.log("fetching frequency data...");
    
    const setSourceFreq = async () => {
      const dates = await fetchDates();
      const datesArray = dates.Date;
      const latestDate = datesArray[datesArray.length - 1];
      fetchSourceFreq(latestDate, 1);
    }
    setSourceFreq();
  }, []);


  return(
    <StyledDiv>
      <Pie data={graphData} options={graphOptions}/>
    </StyledDiv>
    
  );
}

export default PopupPieChart;
