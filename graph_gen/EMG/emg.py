import pandas as pd 
import sys
import networkx as nx
import numpy as np
import itertools

def get_headword(sentence):
    try:
        start = sentence.find("{")
        end = sentence.find("}")
        return sentence[start+1:end]
    except Exception as e:
        return ""

def naive_test():
    BASE_DIR = "/media/data6/pholur/data/Relationships/rels20210307/"
    df = pd.read_csv(BASE_DIR + "clean20210307_relations_-1.csv")
    df_sub = df[["arg1", "rel", "arg2"]]
  
    # for test
    df_sub = df_sub.truncate(after=1000)

    print(df_sub)

    headwords = {}
    args = {get_headword(s) for s in df["arg1"]}
    args.update({get_headword(s) for s in df["arg2"]})
    for a in args:
        headwords[a] = [[], []]
    
    word_to_ind = {}
    ind_to_word = {}
    for i, w in enumerate(args):
        word_to_ind[w] = i
        ind_to_word[i] = w

    similarity = np.zeros((len(args), len(args)))
    print("similarity size:", len(args))

    for i in range(len(args)-1):
        for j in range(i+1, len(args), 1):
            for k in range(len(args)):
                if(k != i and k != j):
                    k_word = ind_to_word[k]
                    i_word = ind_to_word[i]
                    j_word = ind_to_word[j]
                    ik_headwords = set()
                    jk_headwords = set()
                    ki_headwords = set()
                    kj_headwords = set()
                    #for i, row in df_sub.iterrows():
                    #    if(get_headword(row["arg1"])):


    best = np.unravel_index(similarity.argmax(), similarity.shape)
    print(ind_to_word[best[0]])
    print(ind_to_word[best[1]])
    print(similarity[best[0]][best[1]])
    print(best)


def test():
    BASE_DIR = "/media/data6/pholur/data/Relationships/rels" + sys.argv[1] + "/"
    INFILE = BASE_DIR + "clean" + sys.argv[1] + "_relations_-1.csv"
    df = pd.read_csv(INFILE)
    df_sub = df[["arg1", "rel", "arg2"]]
  
    # for test
    #df_sub = df_sub.truncate(after=1000)

    print(df_sub)

    headwords = {}
    args = {get_headword(s) for s in df["arg1"]}
    args.update({get_headword(s) for s in df["arg2"]})
    for a in args:
        headwords[a] = [[], []]
    
    word_to_ind = {}
    ind_to_word = {}
    for i, w in enumerate(args):
        word_to_ind[w] = i
        ind_to_word[i] = w

    similarity = np.zeros((len(args), len(args)))

    print("similarity size:", similarity.shape)
    for index, row in df_sub.iterrows():
        arg1_head = get_headword(row["arg1"])
        arg2_head = get_headword(row["arg2"])
        headwords[arg1_head][0].append(index)
        headwords[arg2_head][1].append(index)

    for key in headwords.keys():
        if(key == ""):
            continue

        adj_nodes = {}
        counts = {}
        
        # key as arg1
        indices = headwords[key][0]
        for i in indices:
            rel = get_headword(df_sub.iloc[i]["rel"])
            adj_node = get_headword(df_sub.iloc[i]["arg2"])
            if(rel != "" and adj_node != ""):
                if(rel not in adj_nodes.keys()):
                    adj_nodes[rel] = {adj_node}
                else:
                    adj_nodes[rel].add(adj_node)

                if(adj_node not in counts.keys()):
                    counts[adj_node] = 1
                else:
                    counts[adj_node] += 1

        for key in adj_nodes.keys():
            if(len(adj_nodes[key]) <= 1):
                continue
            for i in itertools.combinations(adj_nodes[key], 2):
                first = word_to_ind[i[0]]
                second = word_to_ind[i[1]]
                similarity[first][second] += 1/float(counts[i[1]])
                similarity[second][first] += 1/float(counts[i[0]])

    best = np.unravel_index(similarity.argmax(), similarity.shape)
    print(ind_to_word[best[0]])
    print(ind_to_word[best[1]])
    print(similarity[best[0]][best[1]])
    print(best)

    graph = nx.from_numpy_matrix(similarity, create_using=nx.DiGraph)
    graph = nx.relabel.relabel_nodes(graph, ind_to_word)
    nx.write_graphml(graph, "./graph" + sys.argv[1] + ".graphml")
    #for g in graph.edges():
    #    print(g, graph.get_edge_data(g[0], g[1]))
        #print(g)

def check_graph():
    graph = nx.read_graphml("./graph" + sys.argv[1] + ".graphml")
    edges=sorted(graph.edges(data=True), key=lambda t: t[2].get('weight', 1))
    print(edges[-20:])
    print()

    BASE_DIR = "/media/data6/pholur/data/Relationships/rels" + sys.argv[1] + "/"
    INFILE = BASE_DIR + "clean" + sys.argv[1] + "_relations_-1.csv"
    df = pd.read_csv(INFILE)
    df_sub = df[["arg1", "rel", "arg2"]]
 

    top_pair = edges[-3]
    print(top_pair[0])
    print(top_pair[1])

    other_0 = set()
    other_1 = set()
    for i, row in df_sub.iterrows():
        if(get_headword(row['arg1']) == top_pair[0]):
            other_0.add(get_headword(row['arg2']))
        if(get_headword(row['arg2']) == top_pair[0]):
            other_0.add(get_headword(row['arg1']))

    for i, row in df_sub.iterrows():
        if(get_headword(row['arg1']) == top_pair[1]):
            other_1.add(get_headword(row['arg2']))
        if(get_headword(row['arg2']) == top_pair[1]):
            other_1.add(get_headword(row['arg1']))

    both = [i for i in other_0 if i in other_1]
    print(other_0)
    print()
    print(other_1)
    print()
    print(both)

    for i, row in df.iterrows():
        head_1 = get_headword(row['arg1'])
        head_2 = get_headword(row['arg2'])
        if(head_1 == top_pair[0]):
            if(head_2 in both):
                print(i, row['sentence'])
        elif(head_1 == top_pair[1]):
            if(head_2 in both):
                print(i, row['sentence'])
        elif(head_2 == top_pair[0]):
            if(head_1 in both):
                print(i, row['sentence'])
        elif(head_2 == top_pair[1]):
            if(head_1 in both):
                print(i, row['sentence'])

    
    

if __name__ == "__main__":
    #test()
    check_graph()
