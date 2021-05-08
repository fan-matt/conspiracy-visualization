import React , { useState } from 'react';
import styled from 'styled-components';
import ScrollContainer from './ScrollContainer';
import { BsShift } from 'react-icons/bs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Label from './Label';
import Input from './Input';
import Button from './Button';

import SwitchMenuPage from './SwitchMenuPage';


const IndicatorDot = styled.div`
    height: ${props => props.size};
    width: ${props => props.size};
    border-radius: ${props => 'calc(' + props.size + ' / 2)'};
    background-color: ${props => props.color};
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


const CommunityMember = styled.div`
    color: cornflowerblue;
    cursor: pointer;
    transition: 0.3s;
    border-radius: 5px;
    padding: 10px 5px;

    &:hover {
        background-color: darkslategray;
    }
`;


/*
    A page that displays details about a node

    Props:
        node - a node object to display information about
*/
export default function NodeDataPage(props) {
    const [searchDepth , setSearchDepth] = useState(-1);
    const [showRelations , setShowRelations] = useState(false);
    const [showCommunity , setShowCommunity] = useState(false);

    let relations = <> </>;

    if(props.node) {
        relations = props.node.links.map((link) => {
            return(
                <RelationView>
                    <RelationNode onClick={() => props.updateNode(link.source)}> {link.source.node} </RelationNode>
                    <RelationLink> {`>> ${link.relation} >>`} </RelationLink>
                    <RelationNode onClick={() => props.updateNode(link.target)}> {link.target.node} </RelationNode>
                </RelationView>
            );
        });
    }


    let cMembers = <> </>

    if(props.node) {
        cMembers = props.communityMembers(props.node).map((n) => {
            return(
                <CommunityMember onClick={() => props.updateNode(n)}> {n.node} </CommunityMember>
            );
        })
    }


    let pageContent = (
        <> </>
    )

    let pageStyle = {
        width: '100%' ,
        height: '100%' ,
    }

    if(props.node === null) {
        pageStyle = Object.assign(pageStyle , {display: 'flex' , flexDirection: 'column' , justifyContent: 'center' , alignItems: 'center'})

        pageContent = (
            <React.Fragment>
                <h1> Click on a node to see its details. </h1>
                <div style={{height: '20px'}}> </div>
                <h1> Click on the background to zoom and pan to fit. </h1>
            </React.Fragment>
        );
    }
    else {
        console.log('color');
        console.log(props.node.color);
        console.log(props.node);

        pageContent = (
            <React.Fragment>
                <h2> Node: </h2>
                <h3> {props.node.node} </h3>

                <h2> Community: </h2>
                <h3 style={{display: 'flex' , alignItems: 'center'}}> 
                    {props.node.community === -1 ? 'None' : props.node.community} <IndicatorDot color={props.node.color} size='20px' /> 
                </h3>

                <h2> Community Members: ({cMembers.length}) </h2> 
                <Button onClick={() => setShowCommunity(!showCommunity)}> Toggle Visibility </Button>
                <div style={{margin: '10px 0' , display: 'block'}}></div>
                {showCommunity ? <ScrollContainer maxHeight={300}> {cMembers} </ScrollContainer> : <> </>}

                <h2 style={{marginTop: '20px'}}> Relationships: ({relations.length}) </h2> 
                <Button onClick={() => setShowRelations(!showRelations)}> Toggle Visibility </Button>
                <div style={{margin: '10px 0' , display: 'block'}}></div>
                {showRelations ? <ScrollContainer maxHeight={300}> {relations} </ScrollContainer> : <> </>}

                <form onSubmit={(e) => {
                    e.preventDefault(); 
                    props.updateSubgraph({
                        id: props.node.id ,
                        date: props.node.Date ,
                        depth: searchDepth
                    } , props.node.id)
                }}>
                    <FormLabel style={{marginTop: '20px'}}> Search Depth </FormLabel>
                    <FormInput 
                        type='text' 
                        value={searchDepth} 
                        onInput={(e) => {
                            setSearchDepth(Number(e.target.value));
                        }} 
                    />
                    <FormButton> Search </FormButton>
                </form>

                <div style={{display: 'flex' , justifyContent: 'space-around' , marginTop: '50px'}}>
                    <Button onClick={() => {
                        props.voteNode(props.node , true);
                        toast.dark('Upvoted!', {
                            position: "bottom-center",
                            autoClose: 5000,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: 0,
                            });
                    }}>  
                        Upvote <BsShift /> 
                    </Button>

                    <Button onClick={() => {
                        props.voteNode(props.node , false);
                        toast.dark('Downvoted!', {
                            position: "bottom-center",
                            autoClose: 5000,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: 0,
                            });
                    }}>
                        Downvote <BsShift style={{transform: 'rotate(0.5turn)'}} /> 
                    </Button>
                </div>
            </React.Fragment>
        );
    }

    return (
        <SwitchMenuPage>
            <StyledPage style={pageStyle}>
                {pageContent}
            </StyledPage>

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