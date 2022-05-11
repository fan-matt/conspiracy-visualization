import React, { useState } from "react";
import styled from "styled-components";
import ScrollContainer from "./ScrollContainer";
import { BsShift } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Label from "./Label";
import Input from "./Input";
import Button from "./Button";

import SwitchMenuPage from "./SwitchMenuPage";
import { nodeColorFromNER } from './../util/util';
import { Node, Link, NeighborhoodSearchSettings } from "../types";

const IndicatorDot = styled.div<{ size: string, color: string }>`
  height: ${(props) => props.size};
  width: ${(props) => props.size};
  border-radius: ${(props) => "calc(" + props.size + " / 2)"};
  background-color: ${(props) => props.color};
  display: inline-block;
  margin-left: 20px;
`;

const StyledPage = styled.div`
  line-height: 18px;

  & > h2 {
    font-weight: bold;
    margin-bottom: 10px;
  }

  & > h3 {
    margin-bottom: 20px;
  }
`;

const FormLabel = styled(Label)`
  margin-bottom: 10px;
  marginTop: 20px;
`;

const FormInput = styled(Input)`
  width: calc(100% - 16px);
  margin-bottom: 20px;
`;

const FormButton = styled(Button)`
  display: block;
`;

const RelationView = styled.div`
  margin: 5px 0;
  padding: 10px 0;
  border-radius: 5px;
  transition: 0.3s;

  &:hover {
    background-color: darkslategray;
  }
`;

const RelationNode = styled.div`
  color: cornflowerblue;
  cursor: pointer;
  transition: 0.3s;
  padding: 5px 5px;

  &:hover {
    background-color: #1a1f29;
  }
`;

const RelationLink = styled.div`
  margin: 5px 5px;
`;

// const CommunityMember = styled.div`
//   color: cornflowerblue;
//   cursor: pointer;
//   transition: 0.3s;
//   border-radius: 5px;
//   padding: 10px 5px;

//   &:hover {
//     background-color: darkslategray;
//   }
// `;

/*
    A page that displays details about a node

    Props:
        node - a node object to display information about
*/

type Props = {
  node: Node | undefined;
  updateNode: (node: Node) => void;
  getCommunityMembers: (node: Node) => Array<Node>;
  updateSubgraph: (settings: NeighborhoodSearchSettings, nodeId: number) => void;
  voteNode: (node: Node, vote: boolean) => void;
}

const NodeDataPage = ({ node, updateNode, getCommunityMembers, updateSubgraph, voteNode }: Props) => {
  const [searchDepth, setSearchDepth] = useState(4);
  const [showRelations, setShowRelations] = useState(false);
  // const [showCommunity, setShowCommunity] = useState(false);

  let relations: Array<React.ReactNode> = [<> </>];

  if (node) {
    relations = node.links.map((link: Link, i) => {
      return (
        <RelationView key={`rel${i}`}>
          <RelationNode onClick={() => updateNode(link.source)}>
            {" "}
            {`${link.arg1} (${link.source.node})`}
          </RelationNode>
          <RelationLink> {`>> ${link.rel} >>`} </RelationLink>
          <RelationNode onClick={() => updateNode(link.target)}>
            {" "}
            {`${link.arg2} (${link.target.node})`}
          </RelationNode>

          <div style={{ color: "orange" }}>{link.sentence}</div>
        </RelationView>
      );
    });
  }

  // let cMembers: Array<React.ReactNode> = [<> </>];

  // if (node) {
  //   cMembers = getCommunityMembers(node).map((n: Node) => {
  //     return (
  //       <CommunityMember onClick={() => updateNode(n)}>
  //         {" "}
  //         {n.node}{" "}
  //       </CommunityMember>
  //     );
  //   });
  // }

  let pageContent = <> </>;

  let pageStyle = {
    width: "100%",
    height: "100%",
  };

  if (!node) {
    pageStyle = Object.assign(pageStyle, {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    });

    pageContent = (
      <React.Fragment>
        <h1> Click on a node to see its details. </h1>
        <div style={{ height: "20px" }}> </div>
        <h1> Click on the background to zoom and pan to fit. </h1>
      </React.Fragment>
    );
  } else {
    // let communityName = (members: Array<Node>) => {
    //   let maxNeighbors = -1;
    //   let name = "";

    //   console.log("members");
    //   console.log(members);

    //   members.forEach((member) => {
    //     if (member.neighbors.length >= maxNeighbors) {
    //       maxNeighbors = member.neighbors.length;
    //       name = member.node;
    //     }
    //   });

    //   return name;
    // };

    let metaData;

    if(node.meta) {
      metaData = JSON.parse(node.meta);
    }

    pageContent = (
      <React.Fragment>
        <h2> Node: </h2>
        <h3> {node.node} </h3>

        <h2 style={{ marginTop: "20px" }}> Weight: </h2>
        <h3> {metaData?.weight} </h3>

        <h2 style={{ marginTop: "20px" }}> Type: </h2>
        <h3 style={{display: 'flex' , alignItems: 'center'}}> 
          {metaData?.color} 
          <IndicatorDot color={nodeColorFromNER(metaData?.color)} size='20px' /> 
        </h3>

        {/* <h2> Community: </h2>
                <h3 style={{display: 'flex' , alignItems: 'center'}}> 
                    {props.node.community === -1 ? 'None' : `(${communityName(props.communityMembers(props.node))}) ${props.node.community}`} <IndicatorDot color={props.node.color} size='20px' /> 
                </h3>

                <h2> Community Members: ({cMembers.length}) </h2> 
                <Button onClick={() => setShowCommunity(!showCommunity)}> Toggle Visibility </Button>
                <div style={{margin: '10px 0' , display: 'block'}}></div>
                {showCommunity ? <ScrollContainer maxheight={300}> {cMembers} </ScrollContainer> : <> </>} */}

        <h2 style={{ marginTop: "20px" }}>
          {" "}
          Relationships: ({relations.length}){" "}
        </h2>
        <Button onClick={() => setShowRelations(!showRelations)}>
          {" "}
          Toggle Visibility{" "}
        </Button>
        <div style={{ margin: "10px 0", display: "block" }}></div>
        {showRelations ? (
          <ScrollContainer maxheight={300}> {relations} </ScrollContainer>
        ) : (
          <> </>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateSubgraph(
              {
                id: node.id,
                date: node.Date,
                depth: searchDepth,
              },
              node.id
            );
          }}
        >
          <FormLabel> Search Depth </FormLabel>
          <FormInput
            type="text"
            value={searchDepth}
            onInput={(e: React.FormEvent<HTMLInputElement>) => {
              let eventTarget = e.target as HTMLInputElement;
              setSearchDepth(Number(eventTarget.value));
            }}
          />
          <FormButton> Search </FormButton>
        </form>

        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: "50px",
          }}
        >
          <Button
            onClick={() => {
              voteNode(node, true);
              toast.dark("Upvoted!", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 0,
              });
            }}
          >
            Upvote <BsShift />
          </Button>

          <Button
            onClick={() => {
              voteNode(node, false);
              toast.dark("Downvoted!", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: 0,
              });
            }}
          >
            Downvote <BsShift style={{ transform: "rotate(0.5turn)" }} />
          </Button>
        </div>
      </React.Fragment>
    );
  }

  return (
    <SwitchMenuPage>
      <StyledPage style={pageStyle}>{pageContent}</StyledPage>

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </SwitchMenuPage>
  );
}

export default NodeDataPage;