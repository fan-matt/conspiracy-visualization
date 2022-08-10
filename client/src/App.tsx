import { useState, useEffect } from "react";
import styled from "styled-components";

import MainLayout from "./layouts/MainLayout";
import GraphViewer from "./components/GraphViewer";
import StyledSplitPane from "./components/StyledSplitPane";
import GraphSwitchMenu from "./components/GraphSwitchMenu";
import Footer from "./components/Footer";
import Popup from "./components/Popup";

import { formatDate } from "./util/util";

import { Node, Link, RawGraphData, GraphData, GraphFilter, NeighborhoodSearchSettings, ObjectSearchSettings, RawNode, RawLink } from "./types";

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
const App = () => {
  const [splitWidth, setSplitWidth] = useState(window.innerWidth);
  const [graphWidth, setGraphWidth] = useState((splitWidth / 3) * 2);
  const [graphHeight, setGraphHeight] = useState(window.innerHeight - 100);
  const [currentNode, setCurrentNode] = useState<Node | undefined>(undefined);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const [graphDate, setGraphDate] = useState<string>('');

  const [hasPopup, setPopup] = useState(true);

  const [focusString, setFocusString] = useState("");

  const [searchedObjects, setSearchedObjects] = useState({
    nodes: [],
    links: [],
  });

  const [graphFilters, setGraphFilters] = useState<GraphFilter>({
    keywords: '',
    communities: '',
  });

  useEffect(() => {
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
    };
  });

  useEffect(() => {
    fetch("./api/helloworld")
      .then((res) => res.text())
      .then((text) => console.log(text));

    const fetchLatestGraph = async () => {
      const dates = await fetchDates();
      const datesArray = dates.Date;
      const latestDate = datesArray[datesArray.length - 1];

      setGraphDate(formatDate(latestDate));

      console.log("latest date");
      console.log(latestDate);

      const subgraph = await fetchNeighborhood({
        id: 1,
        date: datesArray[datesArray.length - 1],
        depth: 20,
      });

      console.log(subgraph);

      setData(processGraph(subgraph));
    };

    fetchLatestGraph();
  }, []);

  async function fetchDates() {
    const response = await fetch("./api/graphDates", {
      method: "POST",
    });

    const dates = await response.json();

    console.log("Dates:");
    console.log(dates);

    return dates;
  }

  async function fetchNeighborhood(settings: NeighborhoodSearchSettings) {
    console.log("in fetchNeighborhood");
    // console.log(neighborhoodSettings.toObject());

    const response = await fetch("./api/neighborhood", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: settings }),
    });

    const subgraph = await response.json();
    return subgraph;
  }

  async function fetchObjects(settings: ObjectSearchSettings) {
    const response = await fetch("./api/findObject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: settings }),
    });

    const objects = await response.json();
    return objects;
  }

  function processGraph(graphJson: RawGraphData): GraphData {
    console.log("processing graphs");
    console.log(graphJson);

    // Set id field and source/target
    let rawNodes = graphJson.nodes;
    let rawLinks = graphJson.links;

    let nodes: Array<Node> = [];
    let links: Array<Link> = [];

    rawNodes.forEach((node: RawNode) => {
      let newNode: Node = {
        id: node.node_id,
        node: node.node,
        neighbors: [],
        links: [],
        Date: node.Date,
        community: node.community,
        meta: node.meta,
      };

      // Get the rest of the props
      for (let [key, value] of Object.entries(node)) {
        newNode[key] = value;
      }

      nodes.push(newNode);
    });

    rawLinks.forEach((link: RawLink) => {
      let source = nodes.find((node) => node.id === link.obj1);
      let target = nodes.find((node) => node.id === link.obj2);

      let newLink: Link = {
        id: link.rel_id,
        source: source ? source : nodes[0],
        target: target ? target : nodes[0],
        arg1: link.arg1,
        arg2: link.arg2,
        rel: link.rel,
        sentence: link.sentence,
        Date: link.Date
      };

      // Get the rest of the props
      for (let [key, value] of Object.entries(link)) {
        if (key === "source")  // prevent aliasing
          newLink["internet_source"] = value;
        else
          newLink[key] = value;
      }

      if (newLink.source && newLink.target) {
        newLink.source.neighbors.push(newLink.target);
        newLink.source.links.push(newLink);

        if (newLink.source !== newLink.target) {
          newLink.target.neighbors.push(newLink.source);
          newLink.target.links.push(newLink);
        } else {
          newLink.curvature = 3;
        }
      }

      links.push(newLink);
    });

    return { nodes: nodes, links: links };
  }

  async function updateSubgraph(settings: NeighborhoodSearchSettings, focus: number) {
    console.log("settings");
    console.log(settings);

    const subgraph = await fetchNeighborhood(settings);
    const processedSubgraph = processGraph(subgraph);
    console.log("Request data");
    console.log(subgraph);

    setData(processedSubgraph);

    setGraphDate(formatDate(settings.date));

    if (focus) {
      setCurrentNode(processedSubgraph.nodes.find((node) => node.id === focus));
    }
  }

  /*
        *************************************************************
        EVENT HANDLERS
        *************************************************************
    */

  function onWindowResize() {
    // Proportional size after resize
    setGraphWidth((graphWidth / splitWidth) * window.innerWidth);
    setGraphHeight(window.innerHeight - 100);

    setSplitWidth(window.innerWidth);
  }

  /*
        This is what gets called when the SplitPane bar is
        moved to resize the panes but not the component
    */
  function onSplitResize(size: number) {
    setGraphWidth(size);
  }

  function onNodeClick(node: Node | undefined) {
    setCurrentNode(node);
    setCurrentPageIndex(1);
  }

  function onPageChange(newIndex: number) {
    setCurrentPageIndex(newIndex);
  }

  function setGraphFilter(field: string, value: string) {
    let filterCopy: GraphFilter = Object.assign({}, graphFilters);

    if(field === 'keywords' || field === 'communities') {
      filterCopy[field] = value;
      setGraphFilters(filterCopy);
    }
  }

  async function filterGraph() {
    console.log("graphFilters");
    console.log(graphFilters);

    // let newFilter = Object.assign({}, graphFilters);
    // newFilter.keywords = graphFilters.keywords.split(";");

    const objects = await fetchObjects(graphFilters);
    setSearchedObjects(objects);
    console.log(searchedObjects);
    // fetchGraph();
  }

  function getCommunityMembers(node: Node) {
    return data.nodes.filter((n: Node) => n.community === node.community);
  }

  async function voteNode(node: Node, vote: boolean) {
    const max_neighbors = 20;
    const neighbors = node.links.length; // Yes yes this is sloppy (and incorrect) but it's "correct enough"

    const neighborLimit = Math.min(max_neighbors, neighbors);

    for (let i = 0; i < neighborLimit; i++) {
      let link = node.links[i];
      let neighbor = node.id === link.source?.id ? link.target : link.source;

      const payload = {
        id: neighbor?.id,
        date: neighbor?.Date,
        vote: vote,
      };

      console.log("payload");
      console.log(payload);
      console.log(node);

      await fetch("./api/voteNode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: payload }),
      });

      const linkPayload = {
        id: link.id,
        date: link.Date,
        sourceId: link.source?.id,
        targetId: link.source?.id,
        vote: vote,
      };

      await fetch("./api/voteRel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: linkPayload }),
      });
    }
  }


function focusGraph(focus: string) {
  // let focusArray = focus.split(";");

  // let dataCopy = Object.assign({}, data);
  // let nodes = dataCopy.nodes;
  // let filteredNodes = nodes.filter(node => arrayExistsIn(focusArray, node.node));

  // let filteredLinks = dataCopy.links.filter(link => arrayExistsIn(focusArray, link.source.node) && arrayExistsIn(focusArray, link.target.node))

  // dataCopy.nodes = filteredNodes;
  // dataCopy.links = filteredLinks;

  // setData(dataCopy);

  setFocusString(focus);
}


async function setGraph(id: number, name: string) {
  console.log("Setting graph with id " + id);

  setGraphDate(name)

  const response = await fetch("./api/staticGraphs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: {graphID: id} }),
  });

  const graph = await response.json();;

  setData(processGraph(graph));
}


  return (
    <div className="App">
      { hasPopup ? <Popup setPopup={setPopup}/> : null }
      <MainLayout label={graphDate} setPopup={setPopup}>
        <StyledSplitPane
          split="vertical"
          minSize={200}
          defaultSize={(window.innerWidth / 3) * 2}
          onChange={onSplitResize}
          size={graphWidth}
          pane2Style={{ overflowX: "auto" }}
        >
          <GraphViewer
            width={graphWidth}
            height={graphHeight}
            data={data}
            onNodeClick={onNodeClick}
            currentNode={currentNode}
            focusString={focusString}
          />

          <MenuAndFooter>
            <GraphSwitchMenu
              pageIndex={currentPageIndex}
              onIndexChange={onPageChange}
              currentNode={currentNode}
              setCurrentNode={(node) => {
                setCurrentNode(node);
              }}
              getCommunityMembers={getCommunityMembers}
              filters={graphFilters}
              setFilters={setGraphFilter}
              filter={filterGraph}
              searchedNodes={searchedObjects.nodes}
              updateSubgraph={updateSubgraph}
              voteNode={voteNode}
              focusGraph={focusGraph}
              setGraph={setGraph}
            />
            <Footer />
          </MenuAndFooter>
        </StyledSplitPane>
      </MainLayout>
    </div>
  );
}

export default App;
