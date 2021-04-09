import helper

import pandas as pd
import collections
from collections import defaultdict
import re
import numpy as np
import sys
from sklearn.cluster import KMeans
import numpy
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.stem import WordNetLemmatizer
from nltk import SnowballStemmer
from nltk.corpus import stopwords
import sentence_transformers
from sentence_transformers import SentenceTransformer
import pickle
import sys

# cnds = defaultdict(int)
#   maps stemmed entity -> sum of frequency scores of all versions of that entity
# versions = defaultdict(set)
#   maps stemmed entity -> set of all versions of that entity
# candidates = []
#   contains stemmed entities sorted from most frequent to least 
# wordlists = []
#   list of innerlists (wordlist):
#   wordlist = []
#     list of versions of stemmed entities



BERT_PATH = "/media/data6/pholur/external_tools/BERT_supersub/bert_model"
# max number of seed entities for supernodes
TRUNCATE_ENT = 250

# input is date of the form YYYYMMDD
BASE_DIR = "/media/data6/pholur/data/Relationships/rels" + str(sys.argv[1]) + "/"
REL_PATH = BASE_DIR + "clean" + str(sys.argv[1]) + "_relations_-1.csv"
RANK_PATH = BASE_DIR + "df_ent_final_ranking.csv"
DF_PATH = BASE_DIR + "df_ner_ranking_1.csv"

#BASE_DIR = "/media/data6/pholur/data/Relationships/rels20201130/"
#REL_PATH = BASE_DIR + "clean20201130_relations_-1.csv"
#RANK_PATH = BASE_DIR + "df_ent_final_ranking.csv"
#DF_PATH = BASE_DIR + "df_ner_ranking_1.csv"

#SAVE_WORDLISTS = "wordlists"
SAVE_SUPERNODES = BASE_DIR + "supernodes"
SAVE_GRAPH = BASE_DIR + "digraph.graphml"
SAVE_COMMUNITY_GRAPH = BASE_DIR + "communities.graphml"
SAVE_COLORS = BASE_DIR + "colors"
SAVE_MAINS = BASE_DIR + "mains"
SAVE_COMMUNITIES = BASE_DIR + "communities"
SAVE_SCORES = BASE_DIR + "node_score"

lemmatizer = WordNetLemmatizer()
stemmer = SnowballStemmer('english', ignore_stopwords=False)

extra=["a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thick", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"]


df_rels = helper.read_df_rel("", REL_PATH)
df_ent = pd.read_csv(RANK_PATH)
df_ent = df_ent.truncate(after=TRUNCATE_ENT, axis=0)

# loop through entity rankings and tokenize and stem
# add entries to cnds and versions
# cnds stores frequencies of stemmed entities
# versions stores all stemmed versions
stps=set(stopwords.words('english'))
cnds=defaultdict(int)
versions=defaultdict(set)
for ind,row in df_ent.iterrows():
    c=nltk.word_tokenize(str(row['entity']))
    for cc in c:
        cnds[stemmer.stem(cc)]+=row['frequency_score_sum_NER_arg']
        versions[stemmer.stem(cc)].add(cc)

# sort frequency scores (stored in cnds) from greatest to least
# candidates consists of the entities in cnds sorted in decreasing frequency
tmp=list(cnds.values())
tmp.sort()
tmp=tmp[::-1]
seen=set()
candidates=[]
# iterate through sorted frequencies
for i in range(len(tmp)):
    # iterate through words, frequencies in cnds
    for w, score in cnds.items():
        if score == tmp[i] and w not in seen:
            seen.add(w)
            if score>1 and len(w)>1:
                candidates.append(w) 

# changes: removed for loop, words_app

wordlists=[]
seen=set()
# iterate through candidates list
for c in candidates:
    wordlist=[]
    for cc in versions[c]:
        if cc not in seen:
            wordlist.append(cc)
    if wordlist:
        # two loops
        for i in range(1):
            # d_tmp maps lemmatized words to frequency counts
            d_tmp=defaultdict(int)
            # iterate through relationships
            for ind, row in df_rels.iterrows():
                # filter out rows with long arg1/arg2
                if len(str(row['arg1']))<100:
                    if len(str(row['arg2']))<100:
                        # check if any entity in current list is present in arg1
                        if helper.is_any_entities_present2(str(row['arg1']), wordlist):
                            s=str(row['arg1']).replace('{','').replace('}','')
                            pcs=nltk.word_tokenize(s)
                            # d_tmp counts instances of lemmatiized words in arg1
                            for pc in pcs:
                                d_tmp[lemmatizer.lemmatize(pc.lower())]+=1

                        # check if any entity in current list is present in arg2
                        elif helper.is_any_entities_present2(str(row['arg2']), wordlist):
                            s=str(row['arg2']).replace('{','').replace('}','')
                            pcs=nltk.word_tokenize(s)
                            # d_tmp counts instances of lemmatized wordis in arg2
                            for pc in pcs:
                                d_tmp[lemmatizer.lemmatize(pc.lower())]+=1
                                        
            cwrd=helper.getSecondBest(wordlist,d_tmp)
            if cwrd not in seen and cwrd != None:
                wordlist.append(cwrd)
                seen.add(cwrd)
            else:
                break
            wordlists.append(wordlist)
          
#helper.save_obj(wordlists, SAVE_WORDLISTS)
print("Generated wordlists")

entities = wordlists


# each supernode is generated from an entity in wordlists
# each supernode consists of up to n clusters of phrases
# each supernode contains:
# supernodes_in_t = []
#   list of lists corresponding to each cluster
#   each sublist corresponds to a cluster of phrases and contains phrases in the 
#   relationship in which the seed entity was not present
# r_in_t = []
#   list of lists correponding to each cluster
#   each sublist corresponds to a cluster of phrases and contains the relationships 
#   connecting the two phrases together + an index into df_rels corresponding to 
#   the row containing the relationship
#   relationships stored correspond to arrow == 1 (d is arg1 acting on arg2)
# supernodes_out_t, r_out_t
#   same as the in versions, but containing phrase in which the seed entity 
#   was not present and the relationship corresponds to arrow == 0 
#   (d is arg2 being acted on by arg1)
# supernodes_self_t = []
#   list of lists corresponding to each cluster
#   each sublist corresponds to a cluster of phrases and contains the phrase 
#   containing the seed entity (s)
# supernodes_self_ids_t = []
#   list of lists corresponding to each cluster
#   each sublist corresponds to a cluster of phrases and contains the indicies
#   into df_rels for each matched phrase in the cluster


# generate supernodes
n=20
supernodes_in=[]
r_in=[]
supernodes_out=[]
r_out=[]
supernodes_self=[]
supernodes_self_ids=[]
for ent in entities:
    supernodes_in_t, r_in_t,supernodes_out_t,r_out_t,supernodes_self_t,supernodes_self_ids_t=helper.findNodeConnections(ent,df_rels,n)
    supernodes_in.append(supernodes_in_t)
    r_in.append(r_in_t)
    supernodes_out.append(supernodes_out_t)
    r_out.append(r_out_t)
    supernodes_self.append(supernodes_self_t)
    supernodes_self_ids.append(supernodes_self_ids_t)

# save supernodes
to_be_saved={}
to_be_saved['supernodes_in']=supernodes_in
to_be_saved['supernodes_out']=supernodes_out
to_be_saved['r_in']=r_in
to_be_saved['r_out']=r_out
to_be_saved['supernodes_self']=supernodes_self
to_be_saved['supernodes_self_ids']=supernodes_self_ids
to_be_saved['entities']=entities
to_be_saved['cnds']=cnds
helper.save_obj(to_be_saved, SAVE_SUPERNODES)

print("Generated supernodes")





import networkx as nx
import matplotlib.pyplot as plt
from matplotlib import rc

df=pd.read_csv(DF_PATH, error_bad_lines=False)
df=df.dropna()

from sklearn.feature_extraction.text import TfidfVectorizer
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(list(df['text']))
from nltk import SnowballStemmer
stemmer = SnowballStemmer('english', ignore_stopwords=False)

class StemmedTfidfVectorizer(TfidfVectorizer):
    
    def __init__(self, stemmer, *args, **kwargs):
        super(StemmedTfidfVectorizer, self).__init__(*args, **kwargs)
        self.stemmer = stemmer
        
    def build_analyzer(self):
        analyzer = super(StemmedTfidfVectorizer, self).build_analyzer()
        return lambda doc: (self.stemmer.stem(word) for word in analyzer(doc.replace('\n', ' ')))
vectorizer_stem_u = StemmedTfidfVectorizer(stemmer=stemmer, sublinear_tf=True)
X = vectorizer_stem_u.fit_transform(list(df['text']))

word2tfidf = dict(zip(vectorizer.get_feature_names(), vectorizer.idf_))


# removed st=bill,gate

# name phrases in each supernode/subnode
supernode_names=[]
supernode_names_print=[]
for i in range(len(entities)):
    node_names=[]
    node_names_print=[]
    
    for ii in range(len(supernodes_self[i])):
        d=defaultdict(int)
        for s in supernodes_self[i][ii]:
            pcs=nltk.word_tokenize(s)
            for pc in pcs:
                d[lemmatizer.lemmatize(pc.lower())]+=1
        res=helper.pickTop2(word2tfidf,d,3,0.5,False)

        # FIX ATTEMPT 1!!!!!!!!!!!!!!!!!!!!!!!!1
        # remove empty res
        #if(len(list(res)) == 0):
        #    continue

        node_names.append(res)
        st=",".join(sorted(list(res)))
        node_names_print.append(st)
    supernode_names.append(node_names)
    supernode_names_print.append(node_names_print)


# label clusters as above/below the average supernode cluster size  
supernodes_self_status=[]
for i in range(len(supernodes_self)):
    tmp=[] 
    for n in range(len(supernodes_self[i])):
        tmp.append(len(supernodes_self[i][n]))
    tmp_l=[]
    for n in range(len(supernodes_self[i])):
        if len(supernodes_self[i][n])/numpy.mean(tmp)>0:
            tmp_l.append(True)
        else:
            tmp_l.append(False)
    supernodes_self_status.append(tmp_l)

to_be_saved["supernode_names"] = supernode_names
to_be_saved["supernode_names_print"] = supernode_names_print
to_be_saved["supernodes_self_status"] = supernodes_self_status
helper.save_obj(to_be_saved, SAVE_SUPERNODES)

# removed comment involving memo

rel_idis=set()
g = nx.MultiDiGraph()
# iterate through pairs of entities
for i1 in range(len(entities)):
    for i2 in range(i1+1,len(entities)):
        # targets are supernode seeds
        target1=entities[i1]
        target2=entities[i2]
        # supernodes1 is a list of ids 
        supernodes1=supernodes_self_ids[i1]
        # nodes1, nodes1_names corresponds to names of il
        # nodes2, nodes2_names corresponds to names of i2
        nodes1=supernodes_self[i1]
        nodes1_names=supernode_names_print[i1]
        nodes2=supernodes_self[i2]
        nodes2_names=supernode_names_print[i2]
        j=-1
        # relationships corresponds to i2
        outward=r_out[i2]
        inward=r_in[i2]
        # iterate through ids in supernodes1
        for k in range(len(supernodes1)):
            node2=supernodes1[k]
            # iterate through relationships of i2
            for i in range(len(outward)):
                for j in range(len(outward[i])):
                    rel=outward[i][j]
                    number=int(rel.split('-')[1])
                    
                    if number in node2:
                        if supernodes_self_status[i2][i] and supernodes_self_status[i2][k]:
                            tmp_rel=helper.getVerifiedVersion(df_rels['rel'][number])
                            tmp_rel=str(tmp_rel+"-"+str(number))
                            if number not in rel_idis:
                                rel_idis.add(number)
                                g.add_edge(nodes2_names[i],nodes1_names[k],label=tmp_rel)

        for k in range(len(supernodes1)):
            node2=supernodes1[k]
            for i in range(len(inward)):
                for j in range(len(inward[i])):
                    rel=inward[i][j]
                    number=int(rel.split('-')[1])
                    if number not in rel_idis:
                        rel_idis.add(number)
                        if number in node2:
                            if supernodes_self_status[i1][k] and supernodes_self_status[i2][i]:
                                tmp_rel=helper.getVerifiedVersion(df_rels['rel'][number])
                                if number not in rel_idis:
                                    rel_idis.add(number)
                                    g.add_edge(nodes1_names[k],nodes2_names[i],label=tmp_rel)




# remove empty node
g.remove_node("")

nx.write_graphml(nx.DiGraph(g), SAVE_GRAPH)



print("Generated graph")




res_heatmap=collections.defaultdict(dict)
for n1 in g.nodes():
    for n2 in g.nodes():
        res_heatmap[n1][n2]=0

n=1000
for i in range(n):
    subs_graphs=helper.findApartition(g)
    res_heatmap=helper.findHeatmap(subs_graphs,res_heatmap)

inbetween,nodes_scores=helper.findCommunities(subs_graphs, cnds, g)                 



G_res = nx.Graph()
color_code={}
G_main=g.copy()
for n1 in res_heatmap:
    res_tmp=helper.findTopConnections(n1,res_heatmap,th=700)
    for n2 in res_tmp:
        G_res.add_edge(n1,n2)
giant = max([G_res.to_undirected().subgraph(c).copy() for c in nx.connected_components(G_res.to_undirected())], key=len)
# Check if list created correctly
components=[G_res.to_undirected().subgraph(c).copy() for c in nx.connected_components(G_res.to_undirected())]
communities=[]
mains=[]
k1=0
subs_graphs=[]
for nodes in components:
    tmp=set()
    main_set=set()
    for node in nodes:
        main_set.add(node)
        color_code[node]=k1
        tmp.add(node)
        for n_tmp in helper.findTopConnections(node,res_heatmap,th=600):
            tmp.add(n_tmp)
    k1+=1
    g_sd=G_main.subgraph(list(tmp))
    subs_graphs.append(g_sd)
    communities.append(tmp)
    mains.append(main_set)
F=nx.Graph()
for ag in subs_graphs:
    F=nx.compose(F,nx.Graph(ag))

helper.WriteColors(color_code,SAVE_COLORS)
nx.write_graphml(F,SAVE_COMMUNITY_GRAPH)


helper.save_obj(mains,SAVE_MAINS)
helper.save_obj(communities,SAVE_COMMUNITIES)


scores={}
for core in communities:
    for n in core:
        if helper.findSubnodeScore(n, cnds)>50:
            scores[n]=1
        else:
            scores[n]=0
        scores[n]=helper.findSubnodeScore(n, cnds)
helper.WriteColors(scores,SAVE_SCORES)


print("Generated communities")



