//import _ from "lodash"
import Immutable from 'immutable'
 import {SELECT_NODE, CHANGE_NODE, STOP_MOVE, STOP_MOVE_CONNECTOR, START_MOVE, MOUSE_MOVE, MOVE_NODE, MOVE_CONNECTOR, CANCEL_MOVE} from '../const/actions'
// import {initConnectors} from '../utils'
// import {EDGE_TOP, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT} from '../const/connectors'
import {INIT_DATA} from '../const/data'

const initState = Immutable.fromJS(INIT_DATA);
console.log("Immutable.fromJS(INIT_DATA)",initState);

const svgReducer = (state = initState, action) => {
    console.log('reducer type', action.type);
  switch (action.type) {
    case SELECT_NODE:
        console.log('reducer selectedNode', action);
        var data = state
            .set('selected', Immutable.Map({id: action.nodeId, type:action.elType, tail: action.tail}) )
            .set('shiftLoc', Immutable.Map({x: action.switchX, y: action.switchY}) );
        console.log('reducer select node:', data);
        return data;
    case CHANGE_NODE:
        var nodes = state.nodes.map(node => {
            if(node.get('id') == action.nodeId)
                return node.set('caption', action.caption).set('value', action.value);
            return node;
        });
        return state.set('nodes', nodes);
    case START_MOVE:
        console.log('reducer moveMode', true, action);
        return state.set('moveMode', true).set('oldState', state);
    case CANCEL_MOVE:
          console.log('reducer cancelMove', true, action);
          return state.get('oldState');
    case STOP_MOVE_CONNECTOR:
        //return {...state, moveMode: false, connectors: action.connectors, oldState: undefined};
        return {...state, nodes: action.nodes, moveMode: false, oldState: undefined};
    case STOP_MOVE:
        console.log('reducer moveMode', false, "state.selected.type", state.getIn(['selected','type']) );
        return state.set('moveMode', false).set('oldState', null);
        //return {...state, moveMode: false, oldState: undefined};
    case MOVE_NODE:
        console.log('reducer MOVE_NODE',action);
        return state.set('nodes', action.nodes);
    case MOVE_CONNECTOR:
        //return _.extend({}, state, {nodes: action.nodes}, {connectors: action.connectors});
        return state;
    case MOUSE_MOVE:
        return state;
    default:
        return state;
  }
}

export default svgReducer