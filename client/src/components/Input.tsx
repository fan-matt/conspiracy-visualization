import styled from 'styled-components';


const StyledInput = styled.input`
    padding: 8px;
    border-width: 2.5px;
    border-radius: 4px;
    border-style: solid;
    border-color: white;
    background-color: #323949;
    color: white;
    font-family: 'Courier New', Courier, monospace;
    transition: 0.5s;


    &:focus {
        border-color: #95ecf4;
        outline: none;
    }
`;

export default function Input({...props}) {
    return(
        <StyledInput 
            {... props}
        />
    );
}