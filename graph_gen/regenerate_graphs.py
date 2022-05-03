from datetime import timedelta, date
import pandas as pd
import graph_to_csv

START_DATE = 20210112
END_DATE = 20210309

def daterange(start_date, end_date):
    for n in range(int((end_date - start_date).days)):
        yield start_date + timedelta(n)

# daterange is [inclusive, exclusive]
def regenerate(start, end):
    start = str(start)
    end = str(end)
    start = date(int(start[0:4]), int(start[4:6]), int(start[6:8]))
    end = date(int(end[0:4]), int(end[4:6]), int(end[6:8]))

    graph_id = 1
    for day in daterange(start, end):
        curr_date = day.strftime("%Y%m%d")
        try:
            print(curr_date)
            base_dir = "/media/data6/pholur/data/Relationships/rels" + str(curr_date) + '/'
            output_dir = base_dir
            graph_to_csv.generate_csv(base_dir, output_dir, graph_id, str(curr_date))
            graph_id += 1
        except Exception as e:
            print(e)

def aggregate(start, end, output_dir):
    start = str(start)
    end = str(end)
    start = date(int(start[0:4]), int(start[4:6]), int(start[6:8]))
    end = date(int(end[0:4]), int(end[4:6]), int(end[6:8]))

    node_frames = []
    rel_frames = []

    for day in daterange(start, end):
        curr_date = day.strftime("%Y%m%d")
        try:
            base_dir = "/media/data6/pholur/data/Relationships/rels" + str(curr_date) + '/'
            node_frames.append(pd.read_csv(base_dir + "graph_nodes" + curr_date + ".csv", index_col=0))
            rel_frames.append(pd.read_csv(base_dir + "graph_rels" + curr_date + ".csv", index_col=0))
        except Exception as e:
            print(e)
    
    node_dataframe = pd.concat(node_frames)
    rel_dataframe = pd.concat(rel_frames)
    node_dataframe.to_csv(output_dir + "graph_nodes.csv")
    rel_dataframe.to_csv(output_dir + "graph_rels.csv")

if __name__ == '__main__':
    regenerate(20210112, 20210326)
    aggregate(20210112, 20210326, './')


        
    

