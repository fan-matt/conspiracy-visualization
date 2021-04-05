import networkx as nx
import json
import sys
import pickle

# input is date of the form YYYYMMDD
BASE_DIR = "/media/data6/pholur/data/Relationships/rels" + str(sys.argv[1]) + "/"
COLOR_FILE = BASE_DIR + "colors.txt"
GRAPH_FILE = BASE_DIR + "digraph.graphml"
OUTPUT_FILE = BASE_DIR + "graph" + str(sys.argv[1]) + ".json"
BAD_WORDS = "/media/data6/pholur/external_tools/BERT_supersub/bad_words.pickle"

# load bad words
with open(BAD_WORDS, "rb") as f:
    bad_words_set = pickle.load(f)

# words separated by comma
def remove_bad_words(in_str):
    if(in_str == ""):
        print("empty")
        return "EMPTY"
    return in_str

    words = in_str.split(",")
    for i in range(len(words)):
        if(words[i] in bad_words_set):
            words[i] = "[SENSITIVE]"
    return ",".join(words)

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

def get_name(out_edges):
    if(len(out_edges) == 0):
        return "No outgoing edges"

    output = ""
    for e in out_edges:
        output += "-> " + remove_bad_words(e[2].split("-")[0]) 
        output += " " + remove_bad_words(e[1]) + "<br />"
    return output[:-6]

G = nx.read_graphml(GRAPH_FILE)
nodes = []
edges = []
node_to_color = parse_colors(COLOR_FILE)

# parse edges
for e in G.out_edges():
    link_dict = {
        "source": remove_bad_words(e[0]),
        "target": remove_bad_words(e[1])
    }
    edges.append(link_dict)

# parse nodes
for n in G.nodes():
    out_edges = G.out_edges(n, data="label")
    p = get_name(out_edges)

    if(n in node_to_color.keys()):
        a = node_to_color[n]
    else:
        # print("missing community")
        a = -1

    count = len(list(G.out_edges(n)))
    count += len(list(G.in_edges(n)))
   
    if(n == ""):
        print("n empty")
    if(n == None):
        print("n None")
    node_name = remove_bad_words(n)
    if(node_name == "" or node_name == None):
        print("empty or none")
        node_name = "EMPTY"
    node_dict = {
        "id": node_name, 
        "label": node_name,
        "presence": p,
        "artist": a,
        "match": 1.0,
        "playcount": count    
    }
    nodes.append(node_dict)


json_dict = {
    "nodes": nodes,
    "links": edges
}

with open(OUTPUT_FILE, "w") as f:
    f.write(json.dumps(json_dict))

