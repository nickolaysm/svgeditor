import Immutable from 'immutable'
 import {HIGHLIGHT, SELECT_NODE, CHANGE_NODE, STOP_MOVE, STOP_MOVE_CONNECTOR, START_MOVE, MOUSE_MOVE, MOVE_NODE, MOVE_CONNECTOR, CANCEL_MOVE, END_LOCATION, SELECT_CONNECTOR, HIGHLIGHT_CONNECTOR} from '../const/actions'
import {INIT_DATA} from '../const/data'
import {NODE, CONNECTOR} from "../const/entity";
import {CONNECTOR_END_VISIBILITY} from "../const/actions";
import {STOP_MOVE_NODE} from "../const/actions";
import {FRAME_READY} from "../const/actions";
import {ADD_NODE} from "../const/actions";

const initState = Immutable.fromJS(INIT_DATA);


const computeMouseShift = (nodePosition, mousePosition) => {
    return {x: nodePosition.x - mousePosition.x, y: nodePosition.y - mousePosition.y};
}

const svgReducer = (state = initState, action) => {
    //console.log('reducer type', action.type, action);
    let accumulateChanges = state.get('accumulateChanges');
    let currentState =  state.get('currentState');
    let oldState = state.get('oldState');
    switch(action.type){
        case SELECT_NODE:
            accumulateChanges =  accumulateChanges
                .set('selected', Immutable.fromJS({id: action.node.get('id'), type: NODE}) )
                .set('shiftLoc', Immutable.fromJS( computeMouseShift(action.node.get('loc').toJS(), action.mousePosition) ));
            break;
        case SELECT_CONNECTOR:
            accumulateChanges =  accumulateChanges.set('selected', Immutable.fromJS({id: action.connector.get('id'), type: CONNECTOR, tail: action.tail}));
            break;            
        case HIGHLIGHT:
            console.log("HIGHLIGHT");
            accumulateChanges =  accumulateChanges.set('connectors', action.connectors).set('nodes', action.nodes);
            break;
        // case HIGHLIGHT_CONNECTOR:
        //     accumulateChanges =  accumulateChanges.set('connectors', action.connectors);
        //     break;
        case CONNECTOR_END_VISIBILITY:
            accumulateChanges =  accumulateChanges.set('connectorEnd', action.ends);
            break;
        case START_MOVE:
            accumulateChanges =  accumulateChanges.set('moveMode', true);
            oldState = state.get('currentState');
            break;
        case MOVE_NODE:
            accumulateChanges =  accumulateChanges.set('nodes', action.nodes).set('connectorEnd', action.ends);
            break;
        case CANCEL_MOVE:
            currentState = oldState;
            accumulateChanges = oldState;
            break;
        case STOP_MOVE_NODE:
            accumulateChanges =  accumulateChanges.set('moveMode', false);
            oldState = undefined;
            break;
        case MOVE_CONNECTOR:
            accumulateChanges =  accumulateChanges.set('connectors', action.connectors);
            break;
        case STOP_MOVE_CONNECTOR:
            accumulateChanges =  accumulateChanges.set('moveMode', false);
            oldState = undefined;
            break;
        case ADD_NODE:
            accumulateChanges =  accumulateChanges.set('nodes', action.nodes);
            currentState = accumulateChanges;
            break;
        case CHANGE_NODE:
            // Надо переделать событие для редактора
            // accumulateChanges = accumulateChanges.get('nodes').map(node => {
            //     if(node.get('id') == action.nodeId)
            //         return node.set('caption', action.caption).set('value', action.value);
            //     return node;
            // });
            break;
        case FRAME_READY:
            currentState = accumulateChanges;
            break;
        default:

    }
    return state.set('accumulateChanges', accumulateChanges).set('currentState',currentState).set('oldState',oldState);
  //
  // switch (action.type) {
  //   case SELECT_NODE:
  //       console.log('reducer selectedNode', action);
  //       var data = state
  //           .set('selected', Immutable.Map({id: action.nodeId, type:action.elType, tail: action.tail}) )
  //           .set('shiftLoc', Immutable.Map({x: action.switchX, y: action.switchY}) );
  //       console.log('reducer select node:', data);
  //       return data;
  //   case CHANGE_NODE:
  //       var nodes = state.nodes.map(node => {
  //           if(node.get('id') == action.nodeId)
  //               return node.set('caption', action.caption).set('value', action.value);
  //           return node;
  //       });
  //       return state.set('nodes', nodes);
  //   case START_MOVE:
  //       console.log('reducer moveMode', true, action);
  //       return state.set('moveMode', true).set('oldState', state);
  //   case CANCEL_MOVE:
  //         console.log('reducer cancelMove', true, action);
  //         return state.get('oldState');
  //   case STOP_MOVE_CONNECTOR:
  //       //return {...state, moveMode: false, connectors: action.connectors, oldState: undefined};
  //       return state.set('moveMode', false).set('oldState', undefined)
  //   case STOP_MOVE:
  //       console.log('reducer moveMode', false, "state.selected.type", state.getIn(['selected','type']) );
  //       return state.set('moveMode', false).set('oldState', null);
  //       //return {...state, moveMode: false, oldState: undefined};
  //   case SELECT_CONNECTOR:
  //       return state.set('connectors', action.connectors);
  //   case HIGHLIGHT_CONNECTOR:
  //       return state.set('connectors', action.connectors);
  //   case END_LOCATION:
  //       var distances = action.distances.filter(element => element.distance < max );
  //       //console.log("=== distances",distances);
  //       var newEnds = state.get('connectorEnd').map(end => {
  //           for(var i=0; i<distances.length; i++){
  //               //console.log("=== i", i, distances[i]);
  //               if(distances[i].nodeId == end.get('node')){
  //                   var opacity = computeOpacity(distances[i].distance );
  //                   if(!end.get('visible') || end.get('opacity') != opacity )
  //                       return end.set('visible', true).set('opacity', opacity)
  //                   else
  //                       return end
  //               }
  //           }
  //
  //           if(end.get('visible'))
  //               return end.set('visible', false).set('opacity', 0);
  //           return end;
  //       });
  //       return state.set('connectorEnd', newEnds);
  //   case MOVE_NODE:
  //       console.log('reducer MOVE_NODE',action);
  //       return state.set('nodes', action.nodes).set('connectorEnd', action.connectorEnd);
  //   case MOVE_CONNECTOR:
  //       //return _.extend({}, state, {nodes: action.nodes}, {connectors: action.connectors});
  //       return state.set('connectors', action.connectors);
  //   case MOUSE_MOVE:
  //       return state;
  //   default:
  //       return state;
  // }
}

export default svgReducer