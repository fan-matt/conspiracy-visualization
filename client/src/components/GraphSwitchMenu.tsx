import styled from 'styled-components';

import SwitchMenu from './SwitchMenu';
import NodeDataPage from './NodeDataPage';
import GraphFilterPage from './GraphFilterPage';
import GraphGraphsPage from './GraphGraphsPage';

import { NeighborhoodSearchSettings, Node, RawNode } from './../types';

const IconText = styled.h1`
    font-family: 'Courier New', Courier, monospace;
    color: white;
`;


type Props = {
    currentNode: Node | undefined ,
    setCurrentNode: (node: Node) => void ,
    updateSubgraph: (settings: NeighborhoodSearchSettings , nodeId: number) => void ,
    getCommunityMembers: (node: Node) => Array<Node>,
    filters: {
        keywords: string ,
    }
    setFilters: (field: string , value: string) => void ,
    filter: () => void ,
    searchedNodes: Array<RawNode> ,
    pageIndex: number ,
    onIndexChange: (index: number) => void ,
    voteNode: (node: Node , vote: boolean) => void,
    focusGraph: (focus: string) => void,
    setGraph: (id: number, name: string) => void
}


/*
    A specific-usecase wrapper around the generalized SwitchMenu component.
    In the UI, this is the menu to the right of the visualizer but above the footer.

    props:
        pageIndex - index of the page that is displayed
        onIndexChange - callback that is called when the index of the page changes
        currentNode - current node object
*/
const GraphSwitchMenu = ({ currentNode, setCurrentNode, updateSubgraph, getCommunityMembers, 
    filters, setFilters, filter, searchedNodes, pageIndex, onIndexChange, voteNode, 
    focusGraph, setGraph }: Props) => {

    let pages = [
        <GraphFilterPage 
            filters={filters} 
            setFilters={setFilters} 
            filter={filter} 
            searchedNodes={searchedNodes} 
            updateSubgraph={updateSubgraph} 
            focusGraph={focusGraph}
        /> ,
        <NodeDataPage 
            node={currentNode} 
            updateNode={setCurrentNode} 
            updateSubgraph={updateSubgraph} 
            getCommunityMembers={getCommunityMembers} 
            voteNode={voteNode}
        /> ,
        <GraphGraphsPage 
            setGraph={setGraph}
        />
    ];

    let icons = [
        <IconText> Filter </IconText> ,
        <IconText> Details </IconText> ,
        <IconText> Graphs </IconText>
    ]

    return (
        <SwitchMenu
            pageIndex={pageIndex}
            onIndexChange={onIndexChange}
            pages={pages}
            icons={icons}
        />
    );
}

export default GraphSwitchMenu;