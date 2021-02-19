import React , {useState , useEffect} from 'react';
import styled from 'styled-components';

import MainLayout from './layouts/MainLayout';
import GraphViewer from './components/GraphViewer';
import StyledSplitPane from './components/StyledSplitPane';
import GraphSwitchMenu from './components/GraphSwitchMenu';
import Footer from './components/Footer';

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

    useEffect(() => {
        window.addEventListener('resize' ,  onWindowResize);

        return () => {
            window.removeEventListener('resize' , onWindowResize);
        }
    });

    useEffect(() => {
        /*
            Replace this later with a real data loader, once we have real data
        */
        let dataLoader = new DataLoader();
        dataLoader.load(Data);
        setData(dataLoader.getData())
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
            <MainLayout>
                <StyledSplitPane split="vertical" minSize={200} defaultSize={window.innerWidth / 3 * 2} onChange={onSplitResize} size={graphWidth} >
                    <GraphViewer 
                        width={graphWidth}
                        height={graphHeight}
                        data={data}
                        onNodeClick={onNodeClick}
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
