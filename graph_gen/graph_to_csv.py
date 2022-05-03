import networkx as nx
import json 
import pandas as pd
import pickle
import sys

BAD_WORDS = "/media/data6/pholur/external_tools/BERT_supersub/bad_words.pickle"

# parse colors
def parse_colors(color_file):
    all_lines = []
    with open(color_file, "r") as f:
        all_lines = f.readlines()

    node_to_color = {}
    for i in all_lines[1:]:
        line = i[:-1].split('\t')
        # line[0] has been empty
        node_to_color[line[0]] = int(line[1])

    return node_to_color

def remove_bad_words(sentence, isRels):
    # load bad words list
    with open(BAD_WORDS, "rb") as f:
        bad = pickle.load(f)

    if(isRels):
        sentence = [val for val in sentence if val.isalnum() or val == " " or val == "_" or val == "'"]
        sentence = "".join(sentence)
        cleaned = ["[Explicit]" if w in bad else w for w in sentence.lower().split(" ")]
        cleaned = " ".join(cleaned)
        return cleaned
    else:
        cleaned = ["[Explicit]" if w in bad else w for w in sentence.lower().split(",")]
        cleaned = ",".join(cleaned)
        return cleaned


def generate_csv(base_dir, output_dir, graph_id, name_date):
    color_file = base_dir + "colors.txt"
    graph_file = base_dir + "digraph.graphml"

    G = nx.read_graphml(graph_file)
    node_to_color = parse_colors(color_file)

    obj1 = []
    rel = []
    obj2 = []
    rel_date = []
    node_date = []
    nodes = []
    communities = []
    graph_ids_rel = []
    graph_ids_node = []
    ids_rel = []
    ids_node = []

    # determine node and rel ids
    node_id = {}
    id = 1
    for n in G.nodes():
        node_id[n] = id
        id += 1

    id = 1
    for e in G.out_edges(data="label"):
        obj1.append(node_id[e[0]])
        obj2.append(node_id[e[1]])
        rel_name = e[2].split("-")[0]
        rel.append(rel_name)
        ids_rel.append(id)
        rel_date.append(name_date) # temporary
        graph_ids_rel.append(graph_id)
        id += 1

    for n in G.nodes():
        nodes.append(n)
        ids_node.append(node_id[n])
        if(n in node_to_color.keys()):
            c = node_to_color[n]
        else:
            c = -1
        communities.append(c)
        graph_ids_node.append(graph_id)
        node_date.append(name_date) # temporary

    # remove bad words
    rel = [remove_bad_words(r, True) for r in rel]
    nodes = [remove_bad_words(n, False) for n in nodes]

    rel_dict = {"rel_id": ids_rel, "obj1": obj1, "rel": rel, "obj2": obj2, "date": rel_date, "graph_id": graph_ids_rel}
    node_dict = {"node_id": ids_node, "node": nodes, "community": communities, "date": node_date, "graph_id": graph_ids_node}

    rels = pd.DataFrame(data=rel_dict)
    nodes = pd.DataFrame(data=node_dict)

    rels.to_csv(output_dir + "graph_rels" + name_date + ".csv")
    nodes.to_csv(output_dir + "graph_nodes" + name_date + ".csv")

if __name__ == '__main__':
    GRAPH_ID_FILE = "/media/data6/pholur/external_tools/BERT_supersub/curr_graph_id"

    # input is date of the form YYYYMMDD
    base_dir = "/media/data6/pholur/data/Relationships/rels" + str(sys.argv[1]) + "/"
    output_dir = base_dir
    # load graph id
    with open(GRAPH_ID_FILE, "r") as f:
        graph_id = f.read()
        graph_id = int(graph_id)

    #generate_csv(base_dir, "./test/", 1, str(sys.argv[1])) # debug
    generate_csv(base_dir, output_dir, graph_id, str(sys.argv[1]))


