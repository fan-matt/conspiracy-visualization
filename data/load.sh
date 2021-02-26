#!/usr/bin/sh

rm -f load.sql
echo LOAD DATA LOCAL INFILE \'$1\' INTO TABLE nodes FIELDS TERMINATED BY \',\' OPTIONALLY ENCLOSED BY \'\"\' IGNORE 1 LINES \(@dummy, node, community\)\; >> load.sql
echo LOAD DATA LOCAL INFILE \'$2\' INTO TABLE relationships FIELDS TERMINATED BY \',\' OPTIONALLY ENCLOSED BY \'\"\' IGNORE 1 LINES \(@dummy, obj1, relation, obj2,date\)\; >> load.sql
mysql --local-infile=1 --host=localhost --user=elee --password=password MAINDB< load.sql
rm -f load.sql

