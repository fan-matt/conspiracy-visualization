import styled from 'styled-components';
import Button from './Button';
import PopupGraph from './PopupGraph';
import PopupPieChart from './PopupPieChart';


let StyledModal = styled.div`
  position: fixed; 
  z-index: 5; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.6); /* Black w/ opacity */
`;

let StyledModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  justify-content: space-between;
  background-color: #283d5e;
  margin: 5% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
  height: 80%;

  font-family: 'Courier New', Courier, monospace;
  color: #f7f7f7;
`;
let StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
`;


const graphTerms: string[] = ["parler", "trump", "jfk", "moon landing", "russia", "roe", "court"];


/*
let test = {keyword: "trump", startdate: "2021-01-18", enddate: "2021-02-20"};

const getfreq = async () => {
  fetch("./api/getTimeSeries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: test }),
  })
  .then((response) => response.json())
  .then((response) => console.log(response));
}
getfreq();
*/


type Props = {
  setPopup: (hasPopup: boolean) => void
};

const Popup = ({ setPopup }: Props) => {
  return (
    <StyledModal>
      <StyledModalContainer>
        <StyledHeader>
          <p></p>
          <h1 className='flex-grow: 2;'>Analytics coming soon!</h1>
          <p></p>
        </StyledHeader>
        <PopupGraph terms={graphTerms}/>
        <PopupPieChart /> 

        <StyledHeader>
        <p></p>
        <Button onClick={() => setPopup(false)}>Main Page</Button>
        <p></p>
        </StyledHeader>
      </StyledModalContainer>
    </StyledModal>
  );
}

export default Popup;