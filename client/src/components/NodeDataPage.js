import React from 'react';

import SwitchMenuPage from './SwitchMenuPage';

import { mapNodeTypeToText } from './../util/DataConsts';


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

                <h2> Course Type: </h2>
                <h3> {mapNodeTypeToText(props.node.type)} </h3>

                <h2> Course Description: </h2>
                <h3> {props.node.description} </h3>

                <h2> Course Taken: </h2>
                <h3> {(props.node.taken) ? 'Taken' : 'Not Taken'} </h3>
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