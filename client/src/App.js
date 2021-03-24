import React , {useState , useEffect} from 'react';
import styled from 'styled-components';

import MainLayout from './layouts/MainLayout';
import GraphViewer from './components/GraphViewer';
import StyledSplitPane from './components/StyledSplitPane';
import GraphSwitchMenu from './components/GraphSwitchMenu';
import Footer from './components/Footer';

import { formatDate } from './util/util';

import DataLoader from './util/DataLoader';

import Data from './data/data.json';


/*
    Currently, this is everything to the right of the graph visualization
*/
let MenuAndFooter = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`;


/*
    The main React application! Holds all the goodies

    Props:
        N/A
*/
function App() {
    let [splitWidth , setSplitWidth]                    = useState(window.innerWidth);
    let [graphWidth , setGraphWidth]                    = useState(splitWidth / 3 * 2);
    let [graphHeight , setGraphHeight]                  = useState(window.innerHeight - 100);
    let [currentNode , setCurrentNode]                  = useState(null);
    let [currentPageIndex , setCurrentPageIndex]        = useState(0);
    let [data , setData]                                = useState({nodes:[] , links:[]});
    const [graphDate , setGraphDate]                    = useState(undefined);

    useEffect(() => {
        window.addEventListener('resize' ,  onWindowResize);

        return () => {
            window.removeEventListener('resize' , onWindowResize);
        }
    });

    useEffect(() => {
        fetch('/api/helloworld')
        .then(res => res.text())
        .then(text => console.log(text));

        fetch('/api/graphDates')
        .then(res => res.json())
        .then(dateJson => {
            let dates = dateJson.Date;
            let mostRecent = dates[dates.length - 1];

            fetch('/api/graph?' + new URLSearchParams({
                date: mostRecent
            }))
            .then(res => res.json())
            .then(graphJson => {
                console.log('RAW JSON');
                console.log(graphJson);

                // Process data

                // Set id field and source/target
                let nodes = graphJson.nodes;
                let links = graphJson.links;

                nodes.forEach(node => {
                    node.id = node.node_id;
                    delete node.node_id;

                    node.neighbors = [];
                    node.links = [];
                });

                links.forEach(link => {
                    link.id = link.rel_id;
                    delete link.rel_id;

                    link.source = nodes.find(node => node.graph_id === link.graph_id && node.id === link.obj1);
                    link.target = nodes.find(node => node.graph_id === link.graph_id && node.id === link.obj2);

                    link.source.neighbors.push(link.target);
                    link.source.links.push(link);
                    
                    if(link.source !== link.target) {
                        link.target.neighbors.push(link.source);
                        link.target.links.push(link);
                    } else {
                        link.curvature = 3;
                    }
                });

                // Prune neighborless nodes
                graphJson.nodes = nodes.filter(node => node.neighbors.length > 0);
                
                console.log('FIXED JSON')
                console.log(graphJson);
                setData(graphJson);
                setGraphDate(formatDate(mostRecent));
            })
        });
    } , [])


    /*
        *************************************************************
        EVENT HANDLERS
        *************************************************************
    */


    function onWindowResize() {
        // Proportional size after resize 
        setGraphWidth(graphWidth / splitWidth * window.innerWidth);
        setGraphHeight(window.innerHeight - 100);

        setSplitWidth(window.innerWidth);
    }


    /*
        This is what gets called when the SplitPane bar is
        moved to resize the panes but not the component
    */
    function onSplitResize(size) {
        setGraphWidth(size);
    }


    function onNodeClick(node , event) {
        setCurrentNode(node);
    }


    function onPageChange(newIndex) {
        setCurrentPageIndex(newIndex)
    }
    

    return (
        <div className="App">
            <MainLayout date={graphDate}>
                <StyledSplitPane split="vertical" minSize={200} defaultSize={window.innerWidth / 3 * 2} onChange={onSplitResize} size={graphWidth} pane2Style={{overflowX: 'auto'}} >
                    <GraphViewer 
                        width={graphWidth}
                        height={graphHeight}
                        data={data}
                        onNodeClick={onNodeClick}
                        currentNode={currentNode}
                    />
                    
                    <MenuAndFooter>
                        <GraphSwitchMenu
                            pageIndex={currentPageIndex} 
                            onIndexChange={onPageChange} 
                            currentNode={currentNode}    
                        />
                        <Footer />
                    </MenuAndFooter>
                </StyledSplitPane>
            </MainLayout>
        </div>
    );
}

export default App;
