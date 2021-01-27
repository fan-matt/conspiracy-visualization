import json

FILENAME = 'reqTree.txt'
JSONFILE = 'data.json'

with open(FILENAME) as f:
    fileLines = f.read().splitlines()

objectArray = []

objectDict = {}

for line in fileLines:
    if line != '':
        splitLine = line.split(':')
        tag = splitLine[0]
        payload = splitLine[1]

        

        if tag == 'id':
            objectDict[tag] = int(payload)
        
        elif tag == 'title' or tag == 'type' or tag == 'description':
            objectDict[tag] = payload
        
        elif tag == 'to':
            toList = payload.split(';')

            if toList == ['']:
                toList = []

            toList = list(map(int , toList))
            
            objectDict[tag] = toList

        elif tag == 'taken':
            objectDict[tag] = bool(int(payload))
        
        else:
            continue
    
    else:
        objectArray.append(objectDict)
        objectDict = {}


# to JSON
jsonDict = {'data': objectArray}
with open(JSONFILE , 'w') as f:
    json.dump(jsonDict , f , indent=4)
