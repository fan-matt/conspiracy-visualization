import React , {useState , useEffect , useRef} from 'react';
import { ForceGraph2D } from 'react-force-graph';

import DataLoader from './util/DataLoader';

import Data from './data/data.json';


function Graph() {
    let [graphWidth , setGraphWidth] = useState(window.innerWidth / 2);
    let [graphHeight , setGraphHeight] = useState(window.innerHeight - 100);
    let [showOnlyTaken , setShowOnlyTaken] = useState(false);

    const graphRef = useRef(null);

    useEffect(() => {
        window.addEventListener('resize' ,  setDim);

        return () => {
            window.removeEventListener('resize' , setDim);
        }
    });

    useEffect(() => {
        // tune down many body (aka charge) force
        let chargeForce = graphRef.current.d3Force('charge');
        chargeForce.distanceMax(150);   // Number that makes the graph look nice :)
        graphRef.current.d3Force('charge' , chargeForce);
      }, []);


    function setDim() {
        setGraphWidth(window.innerWidth / 2)
        setGraphHeight(window.innerHeight - 100)
    }


    let dataLoader = new DataLoader();
    dataLoader.load(Data);


    function handleNodeClick(node , e) {
        graphRef.current.centerAt(node.x , node.y , 750);
        graphRef.current.zoom(3 , 750);
    }


    function handleNodeDragEnd(node) {
        // Fixes their positions so they don't float around anymore
        node.fx = node.x;
        node.fy = node.y;
    }


    function handleNodeColor(node) {
        switch(node.type) {
            case 'required':
                return 'green';
            
            case 'cseonly':
                return 'pink';
            
            case 'notoffered':
                return 'gray';
            
            case 'elective':
                return 'white';

            case 'capstone':
                return 'blue';

            case 'optional':
                return 'lightgreen';
            
            default:
                return 'black';
        }
    }

    return (
        /* 
            This div exists for the express purpose of overflow: hidden
            This is due to ForceGraph2D not passing className prop for styled-components
            Don't remove it!
        */
        <div style={{'overflow': 'hidden'}}>
            <ForceGraph2D 
                ref={graphRef}
                width={graphWidth} 
                height={graphHeight} 
                graphData={dataLoader.getData()}
                backgroundColor='#9e9e9e'
                onNodeClick={handleNodeClick}
                onNodeDragEnd={handleNodeDragEnd}
                nodeColor={handleNodeColor}
                nodeRelSize={8}
                linkDirectionalArrowLength={5}
            />
        </div>
    );
}

export default Graph;
