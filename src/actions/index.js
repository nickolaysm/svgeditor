import { initConnectors, evalConnector, distancePointSegment, checkConnectorsOnDisconnect} from '../utils'
import {SELECT_NODE, CHANGE_NODE, STOP_MOVE, STOP_MOVE_CONNECTOR, START_MOVE, MOVE_NODE, MOVE_CONNECTOR, CANCEL_MOVE} from '../const/actions'


export const selectNode = (nodeId, type, tail, switchX, switchY) => {
    console.log('Action selectNode, switch',nodeId, type, tail, switchX, switchY);
    return {
        type: SELECT_NODE,
        nodeId: nodeId,
        elType: type,
        tail: tail,
        switchX: switchX,
        switchY: switchY
    }
}

export const changeNode = (nodeId, caption, value) => {
  return {
    type: CHANGE_NODE,
    nodeId:  nodeId,
    caption: caption, 
    value:   value
  }
}

export const startMove = () =>{
  console.log('Action move');
  return {
    type: START_MOVE
  }
}



function stopMoveChosser(state){
    if(state.selected.type == "CONNECTOR"){
        var result = checkConnectorsOnDisconnect(state);
        if(result === true){
            return {type: CANCEL_MOVE}
        }else {
            return {type: STOP_MOVE_CONNECTOR, connectors: result}
        }
    }
    else
        return {type: STOP_MOVE};
}


export const stopMove = () =>{
    //debugger;
  return (dispatcher, getState) => {

      console.log("Action stop")
      dispatcher( stopMoveChosser(getState().svg) );
  }
}

export const mouseMove = (mouseX, mouseY) => {
    return (dispatcher, getState) => {
        var state = getState().svg;

        //определяем расстояние до первого коннектора
        var dist = distancePointSegment(mouseX, mouseY, state.connectors[0].cid1.x, state.connectors[0].cid1.y, state.connectors[0].cid2.x, state.connectors[0].cid2.y);
        console.log('Distance to segment', dist);
        console.log('state.moveMode', state.moveMode);

        if(!state.moveMode) return;

        if (state.selected.type == "NODE"){
            console.log("mouse Move, node select, ", mouseX, mouseY);
            let nodes = state.nodes.map(node => {
                if (node.id == state.selected.id) {
                    node.x = mouseX - state.switchX;
                    node.y = mouseY - state.switchY;
                }
                return node;
            });
            let connectors = initConnectors(state);
            return dispatcher({type: MOVE_NODE, nodes: nodes, connectors: connectors})
        } else if(state.selected.type == "CONNECTOR"){
            console.log("mouse Move, CONNECTOR select, ", mouseX, mouseY);
            let connectors = state.connectors.map(connector => {
                if(connector.id == state.selected.id){
                    if(state.selected.tail == 1)
                        connector = evalConnector(state, connector, mouseX, mouseY)
                    else
                        connector = evalConnector(state, connector, mouseX, mouseY)
                    console.log("===Eval connector: ", connector);
                }
                return connector;
            })
            return dispatcher({type: MOVE_CONNECTOR, connectors: connectors})
        }
    }
}

