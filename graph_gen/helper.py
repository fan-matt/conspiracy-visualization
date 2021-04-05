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

BERT_PATH = "/media/data6/pholur/external_tools/BERT_supersub/bert_model"

lemmatizer = WordNetLemmatizer()
embedder = SentenceTransformer(BERT_PATH)
stemmer = SnowballStemmer('english', ignore_stopwords=False)

# load relationships into pandas dataframe
def read_df_rel(based_dir, file_input_name):
    file_input = based_dir + file_input_name    
    ff = open(file_input)
    delim=","
    df = pd.read_csv(file_input,delimiter=delim,header=0)        
    return df

# get head word of sentence (word in {})
def getheadWord(s):
    res=str(s).split('{')
    if len(res)==1:
        return res[0].split('}')[0]
    else:
        return res[1].split('}')[0]

# get BERT embedding
def getEmbeedings(s,r,d):
    s_embeddings=[]
    d_embeddings=[]
    r_embeddings=[]
    if s:
        s_embeddings=embedder.encode(s)
    if d:
        d_embeddings=embedder.encode(r)
    if r:
        r_embeddings=embedder.encode(d)
    return s_embeddings,d_embeddings,r_embeddings

# check if entity in entity_list is present in sent
def is_any_entities_present(sent, entity_list):
    try:
        for ent in entity_list:
            if ent.lower() in sent.lower():
                return True
        return False
    except:
        print("ERROR failure in is_any_entities_present(),  sent:", sent, "entity_list:", entity_list)

# check if entity in entity_list is present as a word in sent
def is_any_entities_present2(sent, entity_list):
    try:
        for ent in entity_list:
            sent=sent.lower()
            tmp=word_tokenize(sent)
            if ent and ent.lower() in tmp:
                return True
    except:
        print("ERROR failure in is_any_entities_present2()")
    return False

def findNodeConnections(wordlist,df_rels,n,PRINT=False):
    # s and d contain instances of arg1 and arg2 that contain entity words
    # r contains relationships between arg1 and arg2
    # d_h and s_h contain headwords
    # r_h contains relationship headwords
    # arrow contains direction of relationship (arg1->arg2 vs arg2->arg1)
    # ids contains index of df_rels
    s=[]
    d=[]
    d_h=[]
    r=[]
    s_h=[]
    r_h=[]
    arrow=[]
    ids=[]
    # iterate through relationship rows
    for ind, row in df_rels.iterrows():
        # skip duplicate and long args
        if not row['isDup'] and len(str(row['arg1']))<100:
            if len(str(row['arg2']))<100:
                # check for None - ran into this issue before
                if(str(row['arg1']) == None):
                    print("None row, index:", ind)
                    continue
                if(wordlist == None):
                    print("None wordlist, index:", ind)
                    continue
                # check if an entity from wordlist is present in arg1
                if is_any_entities_present(str(row['arg1']), wordlist):
                    # append arg containing wordlist entity to s
                    # append paired arg to d
                    # append relationship verb to r
                    s.append(str(row['arg1']).replace('{','').replace('}',''))
                    d.append(str(row['arg2']).replace('{','').replace('}',''))
                    r.append(row['rel'].replace('{','').replace('}','')) 
                    d_h.append(getheadWord(row['arg2']))
                    s_h.append(getheadWord(row['arg1']))
                    r_h.append(getheadWord(row['rel']))
                    arrow.append(0)
                    ids.append(ind)
                # check if an entity from wordlist is present in arg2
                elif is_any_entities_present(str(row['arg2']), wordlist):
                    s.append(str(row['arg2']).replace('{','').replace('}',''))
                    d.append(str(row['arg1']).replace('{','').replace('}',''))
                    r.append(row['rel'].replace('{','').replace('}','')) 
                    d_h.append(getheadWord(row['arg1']))
                    s_h.append(getheadWord(row['arg2']))
                    r_h.append(getheadWord(row['rel']))
                    arrow.append(1)
                    ids.append(ind)  
    # get embeddings for args and relationships
    s_embeddings,d_embeddings,r_embeddings=getEmbeedings(s,r,d)
    nodes=numpy.concatenate([s_embeddings])
    m=min(n,len(nodes))
    kmeans = KMeans(n_clusters=m, random_state=0).fit(nodes)
    supernodes_in=[]
    r_in=[]
    supernodes_out=[]
    supernodes_self=[]
    r_out=[]
    supernodes_self_ids=[]
    # find max cluster label
    #max_label = 0
    #for i in range(len(kmeans.labels_)):
    #    if(kmeans.labels_[i] > max_label):
    #        max_label = kmeans.labels_[i]

    for j in range(n):
        ins=[]
        r_i=[]
        outs=[]
        r_o=[]
        selfs=[]
        ids_selfs=set()
        for i in range(len(kmeans.labels_)):  
            if kmeans.labels_[i]==j:
                if arrow[i]==0:
                    outs.append(d[i])
                    r_o.append(r[i]+'-'+str(ids[i]))
                    
                else:
                    ins.append(d[i])
                    r_i.append(r[i]+'-'+str(ids[i]))
                selfs.append(s[i])
                ids_selfs.add(ids[i])
        # remove empty arrays
        #if(len(selfs) == 0):
        #    continue

        supernodes_self.append(selfs)
        supernodes_self_ids.append(ids_selfs)
        r_in.append(r_i)
        r_out.append(r_o)
        supernodes_in.append(ins)
        supernodes_out.append(outs)
    return supernodes_in, r_in,supernodes_out,r_out,supernodes_self,supernodes_self_ids

#First parameter is the replacement, second parameter is your input string for regex
regex = re.compile('[^a-zA-Z]')
# what to do if returns None?
# currently ignores return if None
def getSecondBest(wordlist,d_tmp):
    # tmp contains d_tmp values (word frequencies) sorted from greatest to least
    tmp=list(d_tmp.values())
    tmp.sort()
    tmp=tmp[::-1]
    seen=set()
    # iterate through frequency values
    for i in range(len(tmp)):
        for w, score in d_tmp.items():
            res_w=regex.sub('', w)
            # find word (w) that matches current frequency (tmp[i]) 
            # return first valid word that hasn't been seen before 
            if score == tmp[i] and w not in wordlist and w not in seen:
                if score>0:
                    if w not in list(stopwords.words('english')) and len(res_w)>0:
                        return w
                seen.add(w)
                break     


import ast
def findVerbsForRel(num):
    res=[]
    t_annotated = ast.literal_eval(df_rels['annotation'][num])
    for name, tag in t_annotated['pos']:
        if 'VB' in tag:
            res.append(name)
    return res

import pickle
def save_obj(obj, name ):
    with open(name + '.pkl', 'wb') as f:
        pickle.dump(obj, f, pickle.HIGHEST_PROTOCOL)

def load_obj(name ):
    with open(name + '.pkl', 'rb') as f:
        return pickle.load(f)

# can return empty dict res
def pickTop2(word2tfidf,d,numT,threshold=0.5,printAll=False):
    num=0
    tmp=list(d.values())
    d_tmp2=defaultdict(int)
    tmp.sort()
    tmp=tmp[::-1]
    seen=set()
    seen.add('wa')
    for i in range(len(tmp)):
        for w, score in d.items():
            if score == tmp[i] and w not in seen:
                if score>0 and w in word2tfidf:
                    if w not in list(stopwords.words('english')):
                        d_tmp2[w]=score*word2tfidf[w]                   
                seen.add(w)
                break
    tmp=list(d_tmp2.values())
    tmp.sort()
    tmp=tmp[::-1]
    seen=set()
    res = collections.OrderedDict()
    last_score=-1
    for i in range(len(tmp)):
        for w, score in d_tmp2.items():
            if score == tmp[i]  and w not in seen:
                if score>0 and w in word2tfidf:
                    if w not in list(stopwords.words('english')):
                        if score>threshold*last_score:
                            last_score=score
                            if printAll:
                                print(w,score)
                            num+=1
                            res[w]=score
                            if num>numT:
                                if printAll:
                                    print("=====================")
                                return res
                        else:
                            if printAll:
                                print("=====================")
                            return res
                seen.add(w)
                break
    if printAll:
        print("=====================")
    return res

def getVerifiedVersion(rel):
    tmp=getheadWord(rel)
    if 'not' in rel:
        tmp='not_'+rel
#     tmp=lemmatizer.lemmatize(tmp)
#     res=stemmer.stem(tmp)
    return tmp   


from heapq import nlargest
def findTopmNodes(nodes,pr,gr):
    d={}
    stp=set(stopwords.words('english'))
    m=max(int(pr*len(nodes)),1)
    for n in nodes:
        res=n.split(' ')[0]
        if res not in stp and 'every' not in n:
            if list(nltk.pos_tag([n])[0])[1]!='JJ':
                d[n]=gr.degree[n]
    mTop=nlargest(m, d, key = d.get) 
    return mTop


def checkEdge(e1,e2):
    c=0
    if e1:
        c=c+len(e1.keys())
    if e2:
        c=c+len(e2.keys())
    if c>0:
        return c
    return -1


import networkx as nx
import community
import matplotlib.pyplot as plt
def findApartition(g):
    G = g.to_undirected()
    G_main=g
    subs_graphs=[]
    partition = community.best_partition(G,weight='weight')
    size = float(len(set(partition.values())))
    pos = nx.spring_layout(G)
    count = 0.
    s_count=0
    lists_nodes=[]
    selected_nodes=[]
    kkk=0
#     color_code={}
    for com in set(partition.values()) :
        kkk+=1
        count = count + 1.
        list_nodes = [nodes for nodes in partition.keys()
                                    if partition[nodes] == com]
        lists_nodes.append(list_nodes)
#         for nnn in list_nodes:
#             color_code[nnn]=kkk 
        s_count+=len(list_nodes)
        g_sd=G_main.subgraph(list_nodes)
        subs_graphs.append(g_sd)
    return subs_graphs

def findHeatmap(subs_graphs,res_heatmap):
    for gt in subs_graphs:
        for n1 in gt.nodes():
            for n2 in gt.nodes():
                res_heatmap[n1][n2]+=1
    return res_heatmap

def findTopConnections(n_main,res_heatmap,th=0,m=10):
    scs_node=res_heatmap[n_main]
    all_numb=list(scs_node.values())
    all_numb=sorted(all_numb)[::-1]
    res_tmp=[]
    if th==0:
        for i in range(m):
            for nt in scs_node:
                if all_numb[i]==scs_node[nt]:
                    if n_main!=nt:
                        res_tmp.append(nt)
        return res_tmp
    else:
        for i in all_numb:
            if i>th:
                for nt in scs_node:
                    if i==scs_node[nt]:
                        if n_main!=nt:
                            res_tmp.append(nt)
    return res_tmp


import numpy as np
import matplotlib.pyplot as plt
from matplotlib import rc

def findAlltimestamps(word,d):
    for i,row in times.iterrows():
        num=str(row['text']).count(word)
        if num>0:
            d[row['date_utc']]+=num
    return d

def findforallset(words):
    d=collections.defaultdict(int)
    for word in words:
        d=findAlltimestamps(word,d)
    return d
       
def findAndPlot(words):
    d=findforallset(words)
    days=sorted(list(d.keys()))
    y_days=[]
    for i in range(len(days)):
        y_days.append(d[days[i]])
    plt.plot(days, y_days,'-*')


def WriteColors(color_code,name):
    with open(str(name)+'.txt', 'w') as the_file:
        the_file.write("s\tp")
        the_file.write('\n')
        for n in color_code:
            the_file.write(str(n)+"\t"+str(color_code[n]))
            the_file.write('\n')
    the_file.close()

"""
# Need to resolve duplicate findNodesScores
def findNodesScores(ln, cnds):
    final_score=[]
    for n in ln:
        words=n.split(' ,')
        tmp=[]
        for w in words:
            if w:
                if w in cnds:
                    tmp.append(cnds[w])
        if not tmp:
            tmp=[0]
        final_score.append(np.mean(tmp))
    return np.mean(final_score)
"""

#connectivint within and outside and average NER score

def findNodesScores(ln, cnds):
    final_score=0
    for n in ln:
        words=n.split(' ,')
        for w in words:
            if w:
                if w in cnds:
                    final_score+=cnds[w]
    return final_score

# try max, min, average, statistical measurements.          
def findCommunities(subs_graphs, cnds, g):
    inbetween=[]
    nodes_scores=[]
    for i in range(len(subs_graphs)):
        inbetween_one=[]
        nodes_scores.append(findNodesScores(subs_graphs[i].nodes(), cnds))
        for j in range(len(subs_graphs)):
            t=0
            gt1=subs_graphs[i]
            gt2=subs_graphs[j]
            for n1 in gt1.nodes():
                for n2 in gt2.nodes():
                    if g.get_edge_data(n1,n2):
                        t+=len(g.get_edge_data(n1,n2))
                    if g.get_edge_data(n2,n1):
                        t+=len(g.get_edge_data(n2,n1))
            inbetween_one.append(t)
        inbetween.append(inbetween_one)
    return inbetween,nodes_scores


def findSubnodeScore(n, cnds):
    words=n.split(',')
    tmp=[]
    for w in words:
        if w:
            
            if stemmer.stem(lemmatizer.lemmatize(w)) in cnds:
                tmp.append(cnds[stemmer.stem(lemmatizer.lemmatize(w))])
            elif w in cnds:
                tmp.append(cnds[w])
            
    if not tmp:
            tmp=[0]
    return np.mean(tmp)   

