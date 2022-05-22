import { useState } from "react";
//import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

let test = {keyword: "trump", startdate: "2021-01-18", enddate: "2021-02-20"};
const graphTerms: string[] = ["parler", "trump", "jfk", "moon landing", "russia"];

//Function for getting a string in YYYY-MM-DD format
function dateToString(date: Date){
  let mm = date.getMonth()+1;
  let dd = date.getDate();
  let dateParts = [date.getFullYear(), (mm>9 ? "" : "0") + mm,(dd>9 ? "" : "0") + dd];
  return dateParts.join("-");
}

type dateFreq = {
  date: Date,
  frequency: number,
};

type Props = {
  terms: string[];
};

const PopupGraph = ({ terms }: Props) =>{
  const [ graphData , setGraphData] = useState<Array<dateFreq>>([]);
  // Getting the start and end date in string form
  let currDate: Date = new Date("2021-02-20");
  let endDate: string = dateToString(currDate)
  currDate.setDate(currDate.getDate()-30);
  let startDate: string = dateToString(currDate);
  function fetchData(term: string) {
    console.log("Fetching Data!")
    let currInput = {keyword: term, startdate: startDate, enddate: endDate}
    fetch("./api/getTimeSeries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: currInput }),
    })
    .then((response) => response.json())
    .then((response) => {setGraphData(response); console.log(response); console.log("We got the data!")});
    console.log("Finished fetching data!");
  }
  fetchData("trump");
  return(
    <div>{graphData.map((dateFreq) => {return <p>{dateToString(dateFreq.date)} {dateFreq.frequency}</p>})}</div>
  );
}

export default PopupGraph;
