import styled from 'styled-components';


let StyledModal = styled.div`
  position: absolute; 
  z-index: 10; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  background-color: rgb(0,0,0); /* Fallback color */
  background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
`;

let StyledModalContainer = styled.div`
  background-color: #283d5e;
  margin: 10% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
  font-family: 'Courier New', Courier, monospace;
  color: #f7f7f7;
`
let StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
`

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
        <span onClick={() => setPopup(false)}>&times;</span>
      </StyledHeader>
    </StyledModalContainer>
  </StyledModal>
  );
}

export default Popup;