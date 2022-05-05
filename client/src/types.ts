import { NodeObject, LinkObject } from "react-force-graph-2d";

export interface Node extends NodeObject {
    id: number;
    node: string;
    neighbors: Array<Node>;
    links: Array<Link>;
    Date: string;
    community: number;
    __indexColor?: string;
    meta: string;
    [key: string]: any;
}

export interface Link extends LinkObject {
    id: number;
    source: Node;
    target: Node;
    arg1: string;
    arg2: string;
    rel: string;
    sentence: string;
    Date: string;
    [key: string]: any;
}

export type GraphData = {
    nodes: Array<Node>;
    links: Array<Link>;
};


export type RawNode = {
    node_id: number;
    node: string;
    Date: string;
    community: number;
    meta: string;
}

export type RawLink = {
    rel_id: number;
    obj1: number;
    obj2: number;
    arg1: string;
    arg2: string;
    rel: string;
    sentence: string;
    Date: string;
}

export type RawGraphData = {
    nodes: Array<RawNode>;
    links: Array<RawLink>;
}

export type GraphFilter = {
    keywords: string;
    communities: string;
}

export type NeighborhoodSearchSettings = {
    id: number;
    date: string;
    depth: number;
}

export type ObjectSearchSettings = {
    communities: string;
    keywords: string;
}