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



    best = np.unravel_index(similarity.argmax(), similarity.shape)
    print(ind_to_word[best[0]])
    print(ind_to_word[best[1]])
    print(similarity[best[0]][best[1]])
    print(best)

if __name__ == "__main__":
    test()
