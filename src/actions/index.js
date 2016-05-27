import { /*initConnectors,*/ /*distancePointSegment,*/ hasDisconnected, computeEndLocationVisibility, getEndCoordinate, distanceBetweenPoints, getEndCoordinateByID} from '../utils'
import {SELECT_NODE, CHANGE_NODE, STOP_MOVE, STOP_MOVE_CONNECTOR, START_MOVE, MOVE_NODE, MOVE_CONNECTOR, CANCEL_MOVE, END_LOCATION, HIGHLIGHT_CONNECTOR} from '../const/actions'
//import {EDGE_TOP, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT} from '../const/connectors'
import Immutable from 'immutable'
//import _ from 'lodash'
import {SELECT_DISTANCE} from '../const/connectors'
import {dist_point_to_segment} from '../utils/math'

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
        if(hasDisconnected(state)){
            return {type: CANCEL_MOVE}
        }else {
            return {type: STOP_MOVE_CONNECTOR}
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

const findNodeById = (state, id) =>{
    for(var i=0; i<state.get('nodes').size; i++){
        if(state.get('nodes').get(i).get('id') == id)
            return state.get('nodes').get(i);
    }
    return null;
}

const findNearestConnectorEnd = (state, connectorCoord) => {
    var min = Infinity;
    var nearestEnd = null;
    var nearestEndCoord = null;
    for(var i=0; i < state.get('connectorEnd').size; i++){
        var node = findNodeById( state, state.getIn(['connectorEnd', i, 'node']) );
        var endCoord = getEndCoordinate(node.toJS(), state.get('connectorEnd').get(i).toJS() );
        
        var dist = distanceBetweenPoints(endCoord.x, endCoord.y, connectorCoord.x, connectorCoord.y); 
        if(min > dist){
            nearestEnd = state.get('connectorEnd').get(i);
            nearestEndCoord = {x: connectorCoord.x, y: connectorCoord.y};
            min = dist;
        }
    }
    return {nearestEnd: nearestEnd, distance: min, endCoord: nearestEndCoord};
}

const getNewConnectorState = (endRef, nearestEnd) => {
    return endRef
        .set('state', nearestEnd.distance < SELECT_DISTANCE ? 'CONNECTED': 'DISCONNECTED')
        .set('connectorEnd', nearestEnd.nearestEnd.get('id'))
        .set('loc', Immutable.Map(nearestEnd.endCoord) );
    
}

/**
 * Рассчитываем выделен ли сейчас коннекшн или нет, на основании близости мыши к нему
 * @param x положение мыши
 * @param y положение мыши
 * @param state
 */
// const computeConnectorSelection = (x, y, state) =>{
//     console.group("%ccomputeConnectorSelection","color:blue");
//     var connectors = state.get('connectors').map(connector => {
//         var end1Loc = getEndCoordinateByID(connector.get('end1').get('connectorEnd'), state);
//         var end2Loc = getEndCoordinateByID(connector.get('end2').get('connectorEnd'), state);
//         console.log("Location: ",end1Loc, end2Loc);
//         if(    distanceBetweenPoints(x,y, end1Loc.x, end1Loc.y) < SELECT_DISTANCE
//             || distanceBetweenPoints(x,y, end2Loc.x, end2Loc.y) < SELECT_DISTANCE ){
//             return connector.set('selected', true);
//         }
//         return connector.get('selected')? connector.set('selected', false) : connector;
//     })
//     console.groupEnd();
//     return connectors;
// }

/**
 * Подсвечиваем коннектор, если мышка близко к нему
 * @param x
 * @param y
 * @param state
 * @returns {*}
 */
export const computeHighlightConnector = (x, y, state) =>{
    var hasHighlight = false;
    return state.get('connectors').map(connector => {
        var end1Point = getEndCoordinateByID(connector.get('end1').get('connectorEnd'), state);
        var end2Point = getEndCoordinateByID(connector.get('end2').get('connectorEnd'), state);
        var newConnector = connector;
        if(!hasHighlight && dist_point_to_segment({x:x,y:y}, end1Point, end2Point) < SELECT_DISTANCE){
            hasHighlight = true;
            newConnector = newConnector.set('highlight', true);
        }else{
            newConnector = connector.get('highlight')? connector.set('highlight', false) : connector;
        }
        // console.log("Location: ",end1Loc, end2Loc);
        // if(    distanceBetweenPoints(x,y, end1Loc.x, end1Loc.y) < SELECT_DISTANCE
        //     || distanceBetweenPoints(x,y, end2Loc.x, end2Loc.y) < SELECT_DISTANCE ){
        //
        // }
        return newConnector;
    })
}

export const mouseMove = (mouseX, mouseY) => {
    return (dispatcher, getState) => {
        
        var state = getState().svgImmutable;
        //Расчет концевиков
        dispatcher({type: END_LOCATION, distances: computeEndLocationVisibility(mouseX, mouseY, state) });

        if(!state.get('moveMode')) {
            //Если не в режиме перемещения чего-то

            //Выделяем коннектор если мышка близко к одному из его концов
            //dispatcher({type: SELECT_CONNECTOR, connectors: computeConnectorSelection(mouseX, mouseY, state) });

            //Выделяем коннектор если мышка близко к нему
            dispatcher({type: HIGHLIGHT_CONNECTOR, connectors: computeHighlightConnector(mouseX, mouseY, state) });
            return;
        }

        //определяем расстояние до первого коннектора
        //var dist = distancePointSegment(mouseX, mouseY, state.connectors[0].cid1.x, state.connectors[0].cid1.y, state.connectors[0].cid2.x, state.connectors[0].cid2.y);
        //console.log('Distance to segment', dist);
        //console.log('state.moveMode', state.moveMode);


        if (state.getIn(['selected','type']) == "NODE"){
            let selectedNodeId = state.getIn(['selected','id']);
            console.log("mouse Move, node select, ", mouseX, mouseY, state.getIn(['shiftLoc','x']), state.getIn(['shiftLoc','y']));
            let nodes = state.get('nodes').map(node => {
                if ( node.get('id') == selectedNodeId ){
                    return node.set('loc', Immutable.Map({x:mouseX - state.getIn(['shiftLoc','x']), y:mouseY - state.getIn(['shiftLoc','y'])}) );
                }
                return node;
            });
            let connectorEnd = state.get('connectorEnd').map(end =>{
               if(selectedNodeId == end.get('node')) {
                   //TODO: Нужно произвести какое-то изменение объекта end, что бы он считался измененным
                   //let newEnd = end;
                    
                   return end.set('shiftLoc', Immutable.Map(end.get('shiftLoc').toJS()) );
               }
               return end;
            });
            //let connectors = initConnectors(state);
            return dispatcher({type: MOVE_NODE, nodes: nodes, connectorEnd: connectorEnd})
        } else if(state.getIn(['selected','type']) == "CONNECTOR"){
            console.log("mouse Move, CONNECTOR select, ", mouseX, mouseY);
            //var nodes = state.nodes;
            
            //let selectedConnector = state.get('connectors').filter(connector => connector.get('id') == state.getIn(['selected','id']) );
            //Вычисляем к какому концевику ближе всего
            var nearestEnd = findNearestConnectorEnd(state, {x: mouseX, y:mouseY});
            console.group('%c nearestEnd',"color:red", nearestEnd);
            var connectors = state.get('connectors').map(connector => {
                //Если коннектор сейчас перетаскивается, то обрабатываем отдельно
                if( connector.get('id') == state.getIn(['selected','id']) ){
                    var newConnector = connector;
                    var tail = state.getIn(['selected','tail']);
                    var endName = tail == 1 ? "end1" : "end2";
                    var end = getNewConnectorState(newConnector.get(endName), nearestEnd);
                    return newConnector.set(endName,end);
                }
                return connector;
            });
            console.groupEnd();
            return dispatcher({type: MOVE_CONNECTOR, connectors: connectors})
        }
    }
}
