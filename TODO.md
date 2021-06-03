# IMMEDIATE ALPHA RELEASE

- Add date field to node csv
- Write endpoint to fetch all possible graph dates
- Write endpoint to return entire graph given a date
- Adjust frontend to display new data

# FUTURE

- Consider MongoDB switch
- Find MST given any number of nodes
- Find neighborhood of node with given depth
- Get node neighborhoods across graph dates given depth
- Node search functionality

# Things Erl wants to do

- create a date table, so that the nodes and relationships tables only need to have an int to reference the date to save space from saving the date over and over again. 
- remove the graphID column
