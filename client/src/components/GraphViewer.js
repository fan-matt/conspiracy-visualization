import React , {useState , useEffect , useRef} from 'react';
import ForceGraph2D from 'react-force-graph-2d';

import { 
    LINK_COLOR , 
    NODE_HIGHLIGHT_HOVER , 
    NODE_HIGHLIGHT_ADJACENT , 
    GRAPH_BACKGROUND_COLOR 
    } from './../util/DataConsts';


/**
 * This component serves more as a wrapper for the ForceGraph2D- it hides away a lot of the nitty gritty details
 * and only exposes the width, height, and data to pass in by props.
 * 
 * @param {*} props React props
 */
function GraphViewer(props) {
    let [hoveredNode , setHoveredNode]                  = useState(null);
    let [highlightNodes , setHighlightNodes]            = useState([]);
    let [highlightLinks , setHighlightLinks]            = useState([]);


    const graphRef = useRef(null);

    // This runs exactly once after rendering for the first time
    useEffect(() => {
        // Cap the many body (aka charge) force
        // Without this, it reaches too far and starts to push stray nodes very far away
        const MAX_DIST = 1500;
        let chargeForce = graphRef.current.d3Force('charge');
        chargeForce.distanceMax(MAX_DIST);
        graphRef.current.d3Force('charge' , chargeForce);

        // Make the link forces a bit weaker to push out the nodes
        let linkForce = graphRef.current.d3Force('link');
        let strengthAccessor = linkForce.strength();
        linkForce.strength((link) => {
            let defaultForce = strengthAccessor(link);
            return 0.025 * defaultForce;
        });
        graphRef.current.d3Force('link' , linkForce);
      }, []);


      useEffect(() => {
        if(props.currentNode) {
            highlightNodeNeighbors(props.currentNode);
        } else {
            setHighlightLinks([]);
            setHighlightNodes([]);
        }
      } , [props.currentNode]);

    
    function handleNodeClick(node , e) {
        graphRef.current.centerAt(node.x , node.y , 1000);
        graphRef.current.zoom(0.75 , 1000);

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


    /*
        Highlights node, adjacent nodes, and adjacent edges if
        node !== null

        otherwise, unhighlights everything
    */
    function highlightNodeNeighbors(node) {
        if(node) {
            let highlighted = node.neighbors.slice();
            highlighted.push(node);

            setHighlightNodes(highlighted);
            setHighlightLinks(node.links);
            setHoveredNode(node);
        }
        else {
            setHighlightLinks([]);
            setHighlightNodes([]);
            setHoveredNode(null);
        }
    }


    /*
        Highlights link and adjacent nodes if link !== null

        otherwise, unhighlights everything
    */
    function highlightLinkNeighbors(link) {
        if(link) {
            setHighlightLinks([link]);
            setHighlightNodes([link.source , link.target]);
        }
        else {
            setHighlightLinks([]);
            setHighlightNodes([]);
        }
    }



    function handleNodeHover(node) {
        if(props.currentNode) {
            highlightNodeNeighbors(props.currentNode);
        } else {
            highlightNodeNeighbors(node);
        }
    }


    function handleLinkHover(link) {
        if(props.currentNode) {
            highlightNodeNeighbors(props.currentNode);
        } else {
            highlightLinkNeighbors(link);
        }
    }


    function paintNode(node , color , ctx) {
        // add ring just for highlighted nodes
        if(highlightNodes.includes(node)) {
            ctx.beginPath();
            ctx.arc(node.x, node.y, handleNodeSize(node) * 1.4, 0, 2 * Math.PI, false);
            ctx.fillStyle = (node === hoveredNode) ? NODE_HIGHLIGHT_HOVER : NODE_HIGHLIGHT_ADJACENT;
            ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, handleNodeSize(node), 0, 2 * Math.PI, false);
        ctx.fillStyle = (color) ? color : node.color;
        ctx.fill();
    }


    function deactivateForces() {
        // Don't just set forces to null! This breaks hot reload and maybe other things
        function zeroForce(forceName) {
            let force = graphRef.current.d3Force(forceName);
            force.strength(0);
            graphRef.current.d3Force(forceName , force);
        }

        zeroForce('center');
        zeroForce('charge');
        zeroForce('link');
    }


    function handleBackgroundClick() {
        graphRef.current.zoomToFit(750 , 50);
        props.onNodeClick(null);
    }


    function handleNodeSize(node) {
        const MIN_SIZE = 24;
        const MAX_SIZE = 35;
        const MAX_NEIGHBORS = 5;

        let numNeighbors = node.neighbors.length;

        const NODE_SIZE = Math.max(Math.min(Math.log(numNeighbors) / MAX_NEIGHBORS , 1) * MAX_SIZE , MIN_SIZE);

        return NODE_SIZE;
    }


    return(
        <div className={props.className} width={props.width} height={props.height} style={{overflow: 'hidden'}}>
            <ForceGraph2D 
                ref={graphRef}
                backgroundColor={GRAPH_BACKGROUND_COLOR}

                width={props.width}
                height={props.height}
                graphData={props.data}

                onNodeClick={handleNodeClick}
                onNodeHover={handleNodeHover}
                onNodeDragEnd={handleNodeDragEnd}
                nodeAutoColorBy={(node) => node.community}
                nodeLabel={(node) => node.node}
                // nodeRelSize={(node) => handleNodeSize(node)}
                // nodeCanvasObjectMode={node => highlightNodes.includes(node) ? 'before' : undefined}
                nodeCanvasObject={(node , ctx) => paintNode(node , undefined , ctx)}
                nodePointerAreaPaint={paintNode}

                onLinkHover={handleLinkHover}
                linkDirectionalArrowLength={link => highlightLinks.includes(link) ? 0 : 5}
                linkDirectionalParticles={4}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={link => highlightLinks.includes(link) ? 4 : 0}
                linkColor={() => LINK_COLOR}
                linkWidth={link => highlightLinks.includes(link) ? 5 : 1}
                linkLabel={(link) => `${link.source.node} -> ${link.relation} -> ${link.target.node}`}
                linkCurvature="curvature"

                onBackgroundClick={handleBackgroundClick}

                d3AlphaDecay={0.06}
                d3VelocityDecay={0.1}
                cooldownTime={3000}
                onEngineStop={deactivateForces}
            />
        </div>
    );
}


export default GraphViewer;