import React from 'react';
import { BsCardHeading , BsGear } from 'react-icons/bs';

import SwitchMenu from './SwitchMenu';
import NodeDataPage from './NodeDataPage';
import GraphSettingsPage from './GraphSettingsPage';


/*
    A specific-usecase wrapper around the generalized SwitchMenu component.
    In the UI, this is the menu to the right of the visualizer but above the footer.

    props:
        pageIndex - index of the page that is displayed
        onIndexChange - callback that is called when the index of the page changes
        currentNode - current node object
*/
export default function GraphSwitchMenu(props) {
    let pages = [
        <NodeDataPage node={props.currentNode} /> ,
        <GraphSettingsPage />
    ];

    let icons = [
        <BsCardHeading /> ,
        <BsGear /> ,
    ];

    return (
        <SwitchMenu
            pageIndex={props.pageIndex}
            onIndexChange={props.onIndexChange}
            pages={pages}
            icons={icons}
        />
    );
}