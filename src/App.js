import React , {useState , useEffect} from 'react';
import styled from 'styled-components';

import MainLayout from './layouts/MainLayout';
import GraphViewer from './components/GraphViewer';
import StyledSplitPane from './components/StyledSplitPane';
import SwitchMenu from './components/SwitchMenu';
import Footer from './components/Footer';

import DataLoader from './util/DataLoader';

import Data from './data/data.json';


let MenuAndFooter = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
`;


let SwitchMenuPage = styled.div`
    width: calc(100% - 100px);
    height: 100%;
    color: #f7f7f7;
    font-family: 'Courier New', Courier, monospace;

    padding: 50px;

    h2 {
        font-weight: bold;
        font-size: 20px;
        margin-bottom: 15px;
    }

    h3 {
        font-size: 20px;
        line-height: 30px;
        margin-bottom: 45px;
    }
`;


function App() {
    let [splitWidth , setSplitWidth] = useState(window.innerWidth);
    let [graphWidth , setGraphWidth] = useState(splitWidth / 3 * 2);
    let [graphHeight , setGraphHeight] = useState(window.innerHeight - 100);
    let [currentNode , setCurrentNode] = useState(null);


    useEffect(() => {
        window.addEventListener('resize' ,  onWindowResize);

        return () => {
            window.removeEventListener('resize' , onWindowResize);
        }
    });


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


    let dataLoader = new DataLoader();
    dataLoader.load(Data);


    function onNodeClick(node , event) {
        setCurrentNode(node);
    }


    let NodeDataPage = () => {
        let pageContent;

        if(currentNode === null) {
            pageContent = (
                <SwitchMenuPage style={{display: 'flex' , flexDirection: 'column' , justifyContent: 'center' , alignItems: 'center'}}>
                    <h1> Click on a node to see its details. </h1>
                    <div style={{height: '20px'}}> </div>
                    <h1> Click on the background to zoom and pan to fit. </h1>
                </SwitchMenuPage>
            );
        }
        else {
            let courseType = 'Unknown';

            switch(currentNode.type) {
                case 'required':
                    courseType = 'Required';
                    break;
                
                case 'elective':
                    courseType = 'Elective';
                    break;
                
                case 'cseonly':
                    courseType = 'CSE Major Requirement Only';
                    break;
                
                case 'notoffered':
                    courseType = 'Not Offered This Year';
                    break;
                
                case 'capstone':
                    courseType = 'Computer Science Capstone';
                    break;
                
                case 'optional':
                    courseType = 'Optional';
                    break;
                
                default:
                    courseType = 'Unknown';
            }

            pageContent = (
                <SwitchMenuPage>
                    <h1 style={{fontSize: '25px' , marginBottom: '50px'}}>
                        {currentNode.name}
                    </h1>

                    <h2> Course Type: </h2>
                    <h3> {courseType} </h3>

                    <h2> Course Description: </h2>
                    <h3> {currentNode.description} </h3>

                    <h2> Course Taken: </h2>
                    <h3> {(currentNode.taken) ? 'Taken' : 'Not Taken'} </h3>
                </SwitchMenuPage>
            );
        }

        return pageContent;
    }

    let pages = [NodeDataPage()];

    return (
        <div className="App">
            <MainLayout>
                <StyledSplitPane split="vertical" minSize={200} defaultSize={window.innerWidth / 3 * 2} onChange={onSplitResize} size={graphWidth} >
                    <GraphViewer 
                        width={graphWidth}
                        height={graphHeight}
                        data={dataLoader.getData()}
                        onNodeClick={onNodeClick}
                    />
                    <MenuAndFooter>
                        <SwitchMenu pages={pages} pageIndex={0}>

                        </SwitchMenu>       

                        <Footer />
                    </MenuAndFooter>
                </StyledSplitPane>
            </MainLayout>
        </div>
    );
}

export default App;
