import { /*initConnectors,*/ evalConnector, /*distancePointSegment,*/ checkConnectorsOnDisconnect, clearNodes, isConnectorNear} from '../utils'
import {SELECT_NODE, CHANGE_NODE, STOP_MOVE, STOP_MOVE_CONNECTOR, START_MOVE, MOVE_NODE, MOVE_CONNECTOR, CANCEL_MOVE} from '../const/actions'
//import {EDGE_TOP, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT} from '../const/connectors'
import Immutable from 'immutable'

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
    if(state.get('selected').get('type') == "CONNECTOR"){
        var result = checkConnectorsOnDisconnect(state);
        if(result == null){
            return {type: CANCEL_MOVE}
        }else {
            var nodes = clearNodes(state.nodes);
            return {type: STOP_MOVE_CONNECTOR, nodes: nodes, connectors: result}
        }
    }
    else //Двигали ноду
        return {type: STOP_MOVE};
}


export const stopMove = () =>{
    //debugger;
  return (dispatcher, getState) => {

      console.log("Action stop")
      dispatcher( stopMoveChosser(getState().svgImmutable) );
  }
}

export const mouseMove = (mouseX, mouseY) => {
    return (dispatcher, getState) => {

        var state = getState().svgImmutable;
        if(!state.get('moveMode')) return;

        //определяем расстояние до первого коннектора
        //var dist = distancePointSegment(mouseX, mouseY, state.connectors[0].cid1.x, state.connectors[0].cid1.y, state.connectors[0].cid2.x, state.connectors[0].cid2.y);
        //console.log('Distance to segment', dist);
        //console.log('state.moveMode', state.moveMode);


        if (state.getIn(['selected','type']) == "NODE"){
            console.log("mouse Move, node select, ", mouseX, mouseY, state.getIn(['shiftLoc','x']), state.getIn(['shiftLoc','y']));
            let nodes = state.get('nodes').map(node => {
                if ( node.get('id') == state.getIn(['selected','id']) ){
                    return node.set('loc', Immutable.Map({x:mouseX - state.getIn(['shiftLoc','x']), y:mouseY - state.getIn(['shiftLoc','y'])}) );
                }
                return node;
            });
            //let connectors = initConnectors(state);
            return dispatcher({type: MOVE_NODE, nodes: nodes})
        } else if(state.selected.type == "CONNECTOR"){
            console.log("mouse Move, CONNECTOR select, ", mouseX, mouseY);
            var nodes = state.nodes;
            let connectors = state.connectors.map(connector => {
                if(connector.id == state.selected.id){
                    var nodeForConnector = null;
                    var connectorEndCid = null;
                    if(state.selected.tail == 1){
                        connector = evalConnector(state, connector, mouseX, mouseY)
                        nodeForConnector = connector.node1;
                        connectorEndCid = connector.cid1;
                    }else{
                        connector = evalConnector(state, connector, mouseX, mouseY)
                        nodeForConnector = connector.node2;
                        connectorEndCid = connector.cid2;
                    }
                    nodes = state.nodes.map(node => {
                        node.showConnectorEndOnEdge = null;
                        if (node.id == nodeForConnector.id && nodeForConnector.edge != null) {
                            node.showConnectorEndOnEdge = nodeForConnector.edge
                        }
                        node.showConnectorEnd = false;
                        if(isConnectorNear(node, connectorEndCid)){
                            node.showConnectorEnd = true;
                        }
                        return node;
                    });
                    console.log("===Eval connector: ", connector);
                }
                return connector;
            })
            return dispatcher({type: MOVE_CONNECTOR, nodes: nodes, connectors: connectors})
        }
    }
}

