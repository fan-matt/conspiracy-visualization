import React , {useEffect , useRef} from 'react';
import { ForceGraph2D } from 'react-force-graph';


/**
 * This component serves more as a wrapper for the ForceGraph2D- it hides away a lot of the nitty gritty details
 * and only exposes the width, height, and data to pass in by props.
 * 
 * @param {*} props React props
 */
function GraphViewer(props) {
    const graphRef = useRef(null);


    // This runs exactly once after rendering for the first time
    useEffect(() => {
        // Cap the many body (aka charge) force
        // Without this, it reaches too far and starts to push stray nodes very far away
        const MAX_DIST = 150;
        let chargeForce = graphRef.current.d3Force('charge');
        chargeForce.distanceMax(MAX_DIST);
        graphRef.current.d3Force('charge' , chargeForce);

        // Make the link forces a bit weaker to push out the nodes
        let linkForce = graphRef.current.d3Force('link');
        let strengthAccessor = linkForce.strength();
        linkForce.strength((link) => {
            let defaultForce = strengthAccessor(link);
            return 0.1 * defaultForce;
        });
        graphRef.current.d3Force('link' , linkForce);

      }, []);

    
    function handleNodeClick(node , e) {
        graphRef.current.centerAt(node.x , node.y , 750);
        graphRef.current.zoom(3 , 750);

        // Callback
        if(props.onNodeClick) {
            props.onNodeClick(node , e);
        }
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
                return 'lightcoral';
            
            case 'notoffered':
                return 'gray';
            
            case 'elective':
                return 'white';

            case 'capstone':
                return 'aqua';

            case 'optional':
                return 'lawngreen';
            
            default:
                return 'black';
        }
    }


    function deactivateForces() {
        graphRef.current.d3Force('center' , null);
        graphRef.current.d3Force('charge' , null);
        graphRef.current.d3Force('link' , null);
    }


    function handleBackgroundClick(event) {
        graphRef.current.zoomToFit(500 , 50);
        props.onNodeClick(null);
    }


    return(
        <div className={props.className} width={props.width} height={props.height} style={{overflow: 'hidden'}}>
            <ForceGraph2D 
                ref={graphRef}
                backgroundColor='#232834'

                width={props.width}
                height={props.height}
                graphData={props.data}

                onNodeClick={handleNodeClick}
                onNodeDragEnd={handleNodeDragEnd}
                nodeColor={handleNodeColor}
                nodeRelSize={8}

                linkDirectionalArrowLength={5}
                linkColor={() => 'rgba(255,255,255,0.2)'}

                onBackgroundClick={handleBackgroundClick}

                d3AlphaDecay={0.04}
                d3VelocityDecay={0.2}
                cooldownTime={2500}
                onEngineStop={deactivateForces}
            />
        </div>
    );
}


export default GraphViewer;