#!/usr/bin/sh


rm -f load.sql
echo LOAD DATA LOCAL INFILE \'$1\' INTO TABLE nodes FIELDS TERMINATED BY \',\' OPTIONALLY ENCLOSED BY \'\"\' IGNORE 1 LINES \(@dummy, node_id, node, community, date, graph_id\)\; >> load.sql
echo LOAD DATA LOCAL INFILE \'$2\' INTO TABLE relationships FIELDS TERMINATED BY \',\' OPTIONALLY ENCLOSED BY \'\"\' IGNORE 1 LINES \(@dummy, rel_id, obj1, relation, obj2,date , graph_id\)\; >> load.sql
mysql --local-infile=1 MAINDB< load.sql
rm -f load.sql
echo Inserted nodes and relationships into MYSQL DB
