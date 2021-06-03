import React from 'react';
import styled from 'styled-components';
import { IconContext } from 'react-icons';


let StyledSwitchMenu = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: calc(100% - 100px);
    background-color: #1a1f29;
`;

let StyledMenuBar = styled.div`
    position: relative;
    top: 0;

    display: flex;
    flex-direction: row;

    width: 100%;
    min-height: 50px;
    height: 50px;
    max-height: 50px;
    background-color: #1a1f29;
    border-bottom: solid;
    border-width: 2px;
    border-color: 12151c;
`;

const MenuButton = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    cursor: pointer;
`;

const MenuButtonIndicator = styled.div`
    position: absolute;
    top: 0;
    width: 100%;
    height: 2px;
    background-color: #f7f7f7;
    opacity: ${props => props.current ? '1' : '0'};
`;



/*
    Prop that handles switching pages to display

    Props:
        pages - components that act as pages to be switched
        icons - icon components that represent each page- these go on the menu bar
        pageIndex - index of the page that is displayed
        onIndexChange - callback that is called when the index of the page changes. 
                        Takes a single argument "index" which is the new page index
*/
export default function SwitchMenu(props) {

    let menuButtons = props.icons.map((icon , index) => 
        <MenuButton onClick={() => props.onIndexChange(index)} key={'switchMenuButton' + index}> 
            <MenuButtonIndicator current={index === props.pageIndex} /> 
            {icon} 
        </MenuButton>);

    return (
        <StyledSwitchMenu className={props.className}>
            {/* Configuration: https://github.com/react-icons/react-icons */}
            <IconContext.Provider value={{color: '#f7f7f7' , size: '25px'}}>
                <StyledMenuBar>
                    {menuButtons}
                </StyledMenuBar>
            </IconContext.Provider>


            {props.pages[props.pageIndex]}
        </StyledSwitchMenu>
    );
}