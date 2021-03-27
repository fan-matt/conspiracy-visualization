import React from 'react';
import styled from 'styled-components';

import SwitchMenuPage from './SwitchMenuPage';


const StyledField = styled.h3`
    overflow-wrap: break-word;
`;

const IndicatorDot = styled.div`
    height: ${props => props.size};
    width: ${props => props.size};
    border-radius: ${props => 'calc(' + props.size + ' / 2)'};
    background-color: ${props => props.color};
    display: inline-block;
    margin-left: 20px;
`;

/*
    A page that displays details about a node

    Props:
        node - a node object to display information about
*/
export default function NodeDataPage(props) {
    let pageContent = (
        <> </>
    )

    let pageStyle = {
        width: '100%' ,
        height: '100%' ,
    }

    if(props.node === null) {
        pageStyle = Object.assign(pageStyle , {display: 'flex' , flexDirection: 'column' , justifyContent: 'center' , alignItems: 'center'})

        pageContent = (
            <React.Fragment>
                <h1> Click on a node to see its details. </h1>
                <div style={{height: '20px'}}> </div>
                <h1> Click on the background to zoom and pan to fit. </h1>
            </React.Fragment>
        );
    }
    else {
        pageContent = (
            <React.Fragment>
                <h1 style={{fontSize: '25px' , marginBottom: '50px'}}>
                    {props.node.name}
                </h1>

                <h2> Node: </h2>
                <StyledField> {props.node.node} </StyledField>

                <h2> Community: </h2>
                <h3 style={{display: 'flex' , alignItems: 'center'}}> 
                    {props.node.community === -1 ? 'None' : props.node.community} <IndicatorDot color={props.node.color} size='20px' /> 
                </h3>

                <h2> Neighbors: </h2>
                <h3> Under construction :) </h3>
            </React.Fragment>
        );
    }

    return (
        <SwitchMenuPage>
            <div style={pageStyle}>
                {pageContent}
            </div>
        </SwitchMenuPage>
    );
}