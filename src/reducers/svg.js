import _ from "lodash"
import {SELECT_NODE, CHANGE_NODE, STOP_MOVE, STOP_MOVE_CONNECTOR, START_MOVE, MOUSE_MOVE, MOVE_NODE, MOVE_CONNECTOR, CANCEL_MOVE} from '../const/actions'
import {initConnectors} from '../utils'
import {EDGE_TOP, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT} from '../const/connectors'

const initState = {
    moveMode: false,
    //"id - идентификатор выделенного узла или коннектора, type - либо NODE, либо CONNECTOR - тип выделенного узла, tail - в случае коннектора, за какой конец тащим 1 или 2",
    selected: {id:1, type:"NODE", tail: null},
    switchX: undefined,
    switchY: undefined,
    //{id:"Уникальный идентификаотр узла", cord:"Координаты верхнего левого угла", width:"Ширина узла", height:"Высота узла", visibleConnectorEnd:[{edge:EDGE_BOTTOM, shift: 0}]},
    nodes: [
         {id:0, x:10 , y: 10,  width: 120, height:100, caption: 'Узел 0', value: 'Статус', showConnectorEnd: false, visibleConnectorEnd:[{edge:EDGE_BOTTOM, shift: 0}, {edge:EDGE_RIGHT, shift: 0}]}
        ,{id:1, x:270 , y: 70,  width: 120, height:100, caption: 'Узел 1', value: 'Статус', showConnectorEnd: false, visibleConnectorEnd:[{edge:EDGE_TOP, shift: 0}, {edge:EDGE_LEFT, shift: 0}]}
        ,{id:2, x:50 , y: 200, width: 120, height:100, caption: 'Узел 2', value: 'Статус', showConnectorEnd: false, visibleConnectorEnd:[{edge:EDGE_TOP, shift: 0}, {edge:EDGE_RIGHT, shift: 0}]}
    ],
    /*
    connectors:{
        id:"Идентификатор коннектора узлов",
        id1:"Идентификатор узла от которого идет коннектор, может быть null, значит его схатили мышкой и куда-то тащать",
        id2:"Идентификатор узла к которому идет коннектор, может быть null, значит его схатили мышкой и куда-то тащать",
        cid1: "координаты конца коннектора id1, объект {x:1,y:1}",
        cid2: "координаты конца коннектора id1"
    },*/
    connectors: [
        {id:0, node1:{id:0, state:"CONNECTED", edge: EDGE_BOTTOM}, node2:{id:1, state:"CONNECTED", edge: EDGE_LEFT}, cid1: null, cid2: null},
        {id:1, node1:{id:0, state:"CONNECTED", edge: EDGE_BOTTOM}, node2:{id:2, state:"CONNECTED", edge: EDGE_TOP}, cid1: null, cid2: null}
    ],
    changed: true
};







const visibilityFilter = (state = initState, action) => {
    console.log('reducer type', action.type);
  switch (action.type) {
    case SELECT_NODE:
        console.log('reducer selectedNode', action);
        return {...state, selected: {id: action.nodeId, type:action.elType, tail: action.tail}, switchX: action.switchX, switchY: action.switchY};
    case CHANGE_NODE:
        var nodesTemp = state.nodes.map(node => {
            if(node.id == action.nodeId) {
                node.caption = action.caption;
                node.value = action.value;
            }
            return node;
        });
        return {...state, nodes: nodesTemp, changed: !state.changed};
    case START_MOVE:
        console.log('reducer moveMode', true, action);
        return {...state, moveMode: true, oldState: {...state} };
    case CANCEL_MOVE:
          console.log('reducer cancelMove', true, action);
          return {...(state.oldState), moveMode: false, oldState: undefined };
    case STOP_MOVE_CONNECTOR:
        //return {...state, moveMode: false, connectors: action.connectors, oldState: undefined};
        return {...state, nodes: action.nodes, moveMode: false, oldState: undefined};
    case STOP_MOVE:
        console.log('reducer moveMode', false, "state.selected.type", state.selected.type);
        return {...state, moveMode: false, oldState: undefined};
    case MOVE_NODE:
        console.log('reducer MOVE_NODE',action);
        return _.extend({}, state, {nodes: action.nodes, connectors: action.connectors});
    case MOVE_CONNECTOR:
        return _.extend({}, state, {nodes: action.nodes}, {connectors: action.connectors});
    case MOUSE_MOVE:
        return state;
    default:
        return {...state, connectors: initConnectors(state)};
  }
}

export default visibilityFilter