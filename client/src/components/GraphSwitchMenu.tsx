import { FC } from 'react';
import styled from 'styled-components';
import { NodeObject } from 'react-force-graph-2d';
import { BsCardHeading , BsFilter , BsGear } from 'react-icons/bs';

import SwitchMenu from './SwitchMenu';
import NodeDataPage from './NodeDataPage';
import GraphFilterPage from './GraphFilterPage';
import GraphSettingsPage from './GraphSettingsPage';


const IconText = styled.h1`
    font-family: 'Courier New', Courier, monospace;
    color: white;
`;


type Props = {
    currentNode: any ,
    setCurrentNode: (node: any) => void ,
    updateSubgraph: (settings: {
        id: number ,
        date: string ,
        depth: number
    } , nodeId: number) => void ,
    communityMembers: any[] ,
    filters: {
        keywords: string ,
    }
    setFilters: (field: string , value: string) => void ,
    filter: () => void ,
    searchedNodes: any[] ,
    pageIndex: number ,
    onIndexChange: (index: number) => void ,
    voteNode: (node: any , vote: boolean) => void
}


/*
    A specific-usecase wrapper around the generalized SwitchMenu component.
    In the UI, this is the menu to the right of the visualizer but above the footer.

    props:
        pageIndex - index of the page that is displayed
        onIndexChange - callback that is called when the index of the page changes
        currentNode - current node object
*/
const GraphSwitchMenu: FC <Props> = (props) => {
    let pages = [
        <NodeDataPage 
            node={props.currentNode} 
            updateNode={props.setCurrentNode} 
            updateSubgraph={props.updateSubgraph} 
            communityMembers={props.communityMembers} 
            voteNode={props.voteNode}
        /> ,
        <GraphFilterPage 
            filters={props.filters} 
            setFilters={props.setFilters} 
            filter={props.filter} 
            searchedNodes={props.searchedNodes} 
            updateSubgraph={props.updateSubgraph} 
        /> ,
        <GraphSettingsPage />
    ];

    // let icons = [
    //     <BsCardHeading /> ,
    //     <BsFilter /> ,
    //     <BsGear /> ,
    // ];

    let icons = [
        <IconText> Details </IconText> ,
        <IconText> Filter </IconText> ,
        <IconText> Settings </IconText>
    ]

    return (
        <SwitchMenu
            pageIndex={props.pageIndex}
            onIndexChange={props.onIndexChange}
            pages={pages}
            icons={icons}
        />
    );
}


export default GraphSwitchMenu;