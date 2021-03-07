import json

FILENAME = 'reqTree.txt'
JSONFILE = 'data.json'

with open(FILENAME) as f:
    fileLines = f.read().splitlines()


nodes = []
links = []

# useful for EOF
lineCounter = 0

nodeDict = {}

currentId = ''

for line in fileLines:
    
    # ignore empty lines
    if line != '':
        splitLine = line.split(':')
        tag = splitLine[0]
        payload = splitLine[1]


        if tag == 'id':
            nodeDict['id'] = payload
            currentId = payload
        
        elif tag == 'title':
            nodeDict['name'] = payload
        
        elif tag == 'type':
            nodeDict['type'] = payload
        
        elif tag == 'description':
            nodeDict['description'] = payload
        
        elif tag == 'to':
            if payload != '':
                toList = payload.split(';')

                for link in toList:
                    linkDict = {}
                    linkDict['source'] = currentId
                    linkDict['target'] = link
                    links.append(linkDict)
        
        elif tag == 'taken':
            nodeDict['taken'] = bool(int(payload))
            nodes.append(nodeDict)
            nodeDict = {}


jsonDict = {'nodes': nodes , 'links': links}
with open(JSONFILE , 'w') as f:
    json.dump(jsonDict , f , indent=4)