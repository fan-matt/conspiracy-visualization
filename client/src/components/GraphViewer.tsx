import { useState, useEffect, useRef } from "react";
import ForceGraph2D, { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-2d";
import { GraphData, Link, Node } from "../types";

import {
  LINK_COLOR,
  NODE_HIGHLIGHT_HOVER,
  NODE_HIGHLIGHT_ADJACENT,
  GRAPH_BACKGROUND_COLOR,
} from "../util/DataConsts";


type Props = {
  currentNode: Node | undefined;
  data: GraphData;
  onNodeClick: (node: Node | undefined) => void;
  focusString: string;
  width: number;
  height: number;
};


/**
 * This component serves more as a wrapper for the ForceGraph2D- it hides away a lot of the nitty gritty details
 * and only exposes the width, height, and data to pass in by props.
 *
 * @param {*} props React props
 */
const GraphViewer = ({ currentNode, data, onNodeClick, focusString, width, height }: Props) => {
  let [hoveredNode, setHoveredNode] = useState<Node | undefined>(undefined);
  let [highlightNodes, setHighlightNodes] = useState<Array<Node>>([]);
  let [highlightLinks, setHighlightLinks] = useState<Array<Link>>([]);

  const graphRef = useRef<ForceGraphMethods>();

  useEffect(() => {
    graphRef?.current?.zoom(0.2, 0);
  }, []);

  useEffect(() => {
    if(currentNode) {
      graphRef?.current?.centerAt(currentNode.x, currentNode.y, 1000);
      graphRef?.current?.zoom(0.25, 1000);
    }
  }, [currentNode]);

  useEffect(() => {
    function setForces() {
      // const MAX_NODES = 1100;
      // let numNodes = data.nodes.length;
  
      // Cap the many body (aka charge) force
      // Without this, it reaches too far and starts to push stray nodes very far away
      const MAX_DIST = 700;
  
      if(graphRef && graphRef.current) {
        let chargeForce = graphRef.current.d3Force("charge");
        chargeForce?.distanceMax(MAX_DIST);
        // chargeForce.strength(Math.min(numNodes / MAX_NODES , 1) * (Math.min(numNodes / MAX_NODES , 1) * (-50 + 50) - 50));
        // chargeForce.strength(Math.min(numNodes / MAX_NODES , 1) * (Math.min(numNodes / MAX_NODES , 1) * -80));
        chargeForce?.strength(-300);
  
        if(chargeForce) {
          graphRef.current.d3Force("charge", chargeForce);
        }
  
  
        let strengthForce = graphRef.current.d3Force("center");
        strengthForce?.strength(0);
  
        if(strengthForce) {
          graphRef.current.d3Force("center", strengthForce);
        }
  
        // Make the link forces a bit weaker to push out the nodes
        let linkForce = graphRef.current.d3Force("link");
        linkForce?.strength((link: Link) => {
          let source = String(link.source.id);
          let target = String(link.target.id);
  
          let nodes = data.nodes;
  
          if (source && target) {
            let sourceNode =
              nodes[nodes.findIndex((node: Node) => String(node.id) === source)];
            let targetNode =
              nodes[nodes.findIndex((node: Node) => String(node.id) === target)];
  
            if (sourceNode && targetNode) {
              // return 1 / Math.min(sourceNode.neighbors.length , targetNode.neighbors.length) * (Math.min(numNodes / MAX_NODES , 1) * (0.05 - 0.025) + 0.025);
              return (
                (1 /
                  Math.min(
                    sourceNode.neighbors.length,
                    targetNode.neighbors.length
                  )) *
                0.015
              );
            } else {
              // This is necessary- it prevents the graph from trying to find source/target nodes that no longer exist
              // It can be any value, just has to be something
              return 1;
            }
          }
  
          return 1;
        });
  
        if(linkForce) {
          graphRef.current.d3Force("link", linkForce);
        }
      }
    }

    setForces();
    // graphRef.current.d3ReheatSimulation();
  }, [data]);

  useEffect(() => {
    if (currentNode) {
      highlightNodeNeighbors(currentNode);
    } else {
      // setHighlightLinks([]);
      // setHighlightNodes([]);
    }
  }, [currentNode]);

  function handleNodeClick(node: Node) {
    graphRef?.current?.centerAt(node.x, node.y, 1000);
    graphRef?.current?.zoom(0.25, 1000);

    console.log(node);

    // Callback
    if (onNodeClick) {
      onNodeClick(node);
    }
  }

  // function handleNodeDragEnd(node: Node) {
  //   // Fixes their positions so they don't float around anymore
  //   node.fx = node.x;
  //   node.fy = node.y;
  // }

  /*
        Highlights node, adjacent nodes, and adjacent edges if
        node !== null

        otherwise, unhighlights everything
    */
  function highlightNodeNeighbors(node: Node) {
    if (node) {
      let highlighted = node.neighbors.slice();
      highlighted.push(node);

      setHighlightNodes(highlighted);
      setHighlightLinks(node.links);
      setHoveredNode(node);
    } else {
      setHighlightLinks([]);
      setHighlightNodes([]);
      setHoveredNode(undefined);
    }
  }

  /*
        Highlights link and adjacent nodes if link !== null

        otherwise, unhighlights everything
    */
  function highlightLinkNeighbors(link: Link) {
    if (link) {
      setHighlightLinks([link]);
      setHighlightNodes([link.source, link.target]);
    } else {
      setHighlightLinks([]);
      setHighlightNodes([]);
    }
  }

  function handleNodeHover(node: NodeObject | null) {
    if (!currentNode && node) {
      highlightNodeNeighbors(node as Node);
    }
  }

  function handleLinkHover(link: LinkObject | null) {
    if (!currentNode && link) {
      highlightLinkNeighbors(link as Link);
    }
  }

  function paintNode(node: Node, color: string | undefined, ctx: CanvasRenderingContext2D) {
    const NODE_SIZE = handleNodeSize(node);

    if(node.x && node.y) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_SIZE * 1.1, 0, 2 * Math.PI, false);
      ctx.fillStyle = "black";
      ctx.fill();

      // add ring just for highlighted nodes
      if (highlightNodes.includes(node)) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_SIZE * 1.4, 0, 2 * Math.PI, false);
        ctx.fillStyle =
          node === hoveredNode ? NODE_HIGHLIGHT_HOVER : NODE_HIGHLIGHT_ADJACENT;
        ctx.fill();
      }

      let focusArray = focusString.split(";");

      let existsIn = false;

      focusArray.forEach(element => {
        if(node.node.indexOf(element) > -1) {
          existsIn = true;
        }
      });

      if(focusString === "") {
        existsIn = false;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);

      if(existsIn) {
        ctx.fillStyle = color ? color : "#ffd700";
      } else {
        // forgive me
        ctx.fillStyle = color ? color : (node.__indexColor ? node.__indexColor : "black");
      }

      ctx.fill();
    }

    // ctx.beginPath();
    // ctx.arc(node.x, node.y, NODE_SIZE, 0, 2 * Math.PI, false);
    // ctx.fillStyle = node.color;
    // ctx.fill();
  }

  // function deactivateForces() {
  //   // Don't just set forces to null! This breaks hot reload and maybe other things
  //   function zeroForce(forceName: string) {
  //     let force = graphRef?.current?.d3Force(forceName);
  //     force?.strength(0);

  //     if(force) {
  //       graphRef?.current?.d3Force(forceName, force);
  //     }
  //   }

  //   zeroForce("center");
  //   zeroForce("charge");
  //   zeroForce("link");
  // }

  function handleBackgroundClick() {
    graphRef?.current?.zoomToFit(750, 50);
    onNodeClick(undefined);

    setHighlightNodes([]);
    setHighlightLinks([]);
  }

  function handleNodeSize(node: Node) {
    const MIN_SIZE = 36;
    const MAX_SIZE = 72;
    const MAX_NEIGHBORS = 5;

    let numNeighbors = node.neighbors.length;

    const NODE_SIZE = Math.max(
      Math.min(Math.log(numNeighbors) / MAX_NEIGHBORS, 1) * MAX_SIZE,
      MIN_SIZE
    );

    return NODE_SIZE;
  }

  function fixNode(node: Node) {
    node.fx = node.x;
    node.fy = node.y;
  }

  return (
    <div
      style={{ overflow: "hidden" }}
    >
      <ForceGraph2D
        ref={graphRef}
        backgroundColor={GRAPH_BACKGROUND_COLOR}
        width={width}
        height={height}
        graphData={data}
        onNodeClick={(node, e) => handleNodeClick(node as Node)}
        onNodeHover={handleNodeHover}
        // nodeAutoColorBy="community"
        nodeLabel="node"
        nodeCanvasObject={(node, ctx) => paintNode(node as Node, undefined, ctx)}
        nodePointerAreaPaint={(node, color, ctx) => paintNode(node as Node, color, ctx)}
        onNodeDragEnd={(node) => fixNode(node as Node)}
        onLinkHover={handleLinkHover}
        onLinkClick={(link) => console.log(link)}
        linkDirectionalArrowLength={(link) =>
          highlightLinks.includes(link as Link) ? 0 : 5
        }
        linkDirectionalParticles={4}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={(link) =>
          highlightLinks.includes(link as Link) ? 4 : 0
        }
        linkColor={() => LINK_COLOR}
        linkWidth={(link) => (highlightLinks.includes(link as Link) ? 5 : 1)}
        linkLabel={(link: LinkObject) => {
          let l = link as Link;
          return `${l.source.node} -> ${l.rel} -> ${l.target.node}`;
        }
        }
        linkCurvature="curvature"
        onBackgroundClick={handleBackgroundClick}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.1}
        cooldownTime={3000}
        // onEngineStop={deactivateForces}
      />
    </div>
  );
}

export default GraphViewer;
