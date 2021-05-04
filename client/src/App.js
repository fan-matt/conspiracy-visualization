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
    const [splitWidth , setSplitWidth]                      = useState(window.innerWidth);
    const [graphWidth , setGraphWidth]                      = useState(splitWidth / 3 * 2);
    const [graphHeight , setGraphHeight]                    = useState(window.innerHeight - 100);
    const [currentNode , setCurrentNode]                    = useState(null);
    const [currentPageIndex , setCurrentPageIndex]          = useState(0);
    const [data , setData]                                  = useState({nodes:[] , links:[]});
    const [graphDate , setGraphDate]                        = useState(undefined);

    const [neighborhoodSettings , setNeighborhoodSettings]  = useState({
        id: -1 ,
        date: '' ,
        depth: -1
    });

    const [findObjectSettings , setFindObjectSettings]      = useState({
        communities: [] ,
        keywords: []
    });

    const [graphDates , setGraphDates]                      = useState([]);

    const [graphFilters , setGraphFilters]                  = useState({
        nodes: '' ,
        communities: '' ,
    });


    useEffect(() => {
        window.addEventListener('resize' ,  onWindowResize);

        return () => {
            window.removeEventListener('resize' , onWindowResize);
        }
    });

    useEffect(() => {
        fetch('./api/helloworld')
        .then(res => res.text())
        .then(text => console.log(text));

        const fetchLatestGraph = async () => {
            const dates = await fetchDates();
            const datesArray = dates.dates;
            console.log(dates.dates);

            console.log('fetch neigh')
            const subgraph = await fetchNeighborhood({
                id: 1 ,
                date: datesArray[datesArray.length - 1] ,
                depth: -1
            });
            console.log(subgraph);
        }

        fetchLatestGraph();

        // fetchGraph();
        

        // fetchDates().then((dates) => {
        //     console.log(dates);

        //     return dates[dates.length - 1];
        // })
        // .then((date) => {
        //     setNeighborhoodSettings({
        //         id: -1 ,
        //         date: date ,
        //         depth: -1
        //     });

        //     fetchNeighborhood()
        // });
    } , [])


    async function fetchDates() {
        const response = await fetch('./api/graphDates' , 
            {
                method: 'POST'
            });
        
        const dates = await response.json();
        return dates;
    }


    async function fetchNeighborhood(settings) {
        console.log(settings);
        
        const response = await fetch('./api/neighborhood' , 
            {
                method: 'POST' , 
                headers: {
                    'Content-Type': 'application/json'
                } ,
                body: JSON.stringify({input: settings})
            });

        const subgraph = await response.json();
        return subgraph;
    }


    function fetchGraph() {
        fetch('./api/graphDates')
        .then(res => res.json())
        .then(dateJson => {
            let dates = dateJson.Date;
            let mostRecent = dates[dates.length - 1];

            fetch('./api/graph?' + new URLSearchParams({
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

                
                

                // Filter
                if(graphFilters.communities !== '') {
                    let communityFilter = graphFilters.communities.split(';');
                    graphJson.nodes = graphJson.nodes.filter(node => communityFilter.includes(String(node.community)));
                }

                if(graphFilters.nodes !== '') {
                    let nodeFilter = graphFilters.nodes.split(';');

                    console.log(nodeFilter);

                    graphJson.nodes = graphJson.nodes.filter(node => {
                        let found = false;
                        
                        nodeFilter.forEach(searchNode => {
                            found = found || (String(node.node).search(searchNode) !== -1);
                        });

                        return found;
                    });
                }


                // Prune neighborless nodes
                graphJson.nodes = graphJson.nodes.filter(node => node.neighbors.length > 0);


                console.log('FIXED JSON')
                console.log(graphJson);
                setData(graphJson);
                setGraphDate(formatDate(mostRecent));
            })
        });
    }


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
    

    function setGraphFilter(field , value) {
        let filterCopy = Object.assign({} , graphFilters);
        filterCopy[field] = value;
        setGraphFilters(filterCopy);
    }


    function filterGraph() {
        console.log('filter function!');
        console.log(graphFilters);

        fetchGraph();
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
                            filters={graphFilters}    
                            setFilters={setGraphFilter}
                            filter={filterGraph}
                        />
                        <Footer />
                    </MenuAndFooter>
                </StyledSplitPane>
            </MainLayout>
        </div>
    );
}

export default App;
