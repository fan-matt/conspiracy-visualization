/*
    This file defines some constants associated with the dataset as well
    as providing some useful mappings
*/


export const NODE_TYPE_REQUIRED                 = 'required';
export const NODE_TYPE_CSE_ONLY                 = 'cseonly';
export const NODE_TYPE_NOT_OFFERED              = 'notoffered';
export const NODE_TYPE_ELECTIVE                 = 'elective';
export const NODE_TYPE_CAPSTONE                 = 'capstone';
export const NODE_TYPE_OPTIONAL                 = 'optional';


export function mapNodeTypeToText(type) {
    switch(type) {
        case NODE_TYPE_REQUIRED:
            return 'Required';
        
        case NODE_TYPE_CSE_ONLY:
            return 'CSE Major Requirement Only';
        
        case NODE_TYPE_NOT_OFFERED:
            return 'Not Offered This Year';
        
        case NODE_TYPE_ELECTIVE:
            return 'Elective';
        
        case NODE_TYPE_CAPSTONE:
            return 'Computer Science Capstone';

        case NODE_TYPE_OPTIONAL:
            return 'Optional';
        
        default:
            return 'Unknown';
    }
}


export function mapNodeTypeToColor(type) {
    switch(type) {
        case NODE_TYPE_REQUIRED:
            return 'green';
        
        case NODE_TYPE_CSE_ONLY:
            return 'lightcoral';
        
        case NODE_TYPE_NOT_OFFERED:
            return 'gray';
        
        case NODE_TYPE_ELECTIVE:
            return 'white';
        
        case NODE_TYPE_CAPSTONE:
            return 'aqua';

        case NODE_TYPE_OPTIONAL:
            return 'lawngreen';
        
        default:
            return 'black';
    }
}