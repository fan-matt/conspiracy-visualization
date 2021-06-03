import { MouseEventHandler } from 'react';
import styled from 'styled-components';


const StyledButton = styled.button`
    padding: 8px;
    border-width: 2.5px;
    border-radius: 4px;
    border-style: solid;
    border-color: white;
    background-color: #323949;
    color: white;
    font-family: 'Courier New', Courier, monospace;
    transition: 0.5s;
    cursor: pointer;

    &:hover {
        border-color: #95ecf4;
    }
`;


type Props = {
    className?: string ,
    onClick?: MouseEventHandler ,
    children: any ,
};


export default function Button({className , onClick , children}: Props) {
    return(
        <StyledButton className={className} onClick={onClick} >
            {children}
        </StyledButton>
    );
}