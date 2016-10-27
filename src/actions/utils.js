/**
 * Различные утилиты с бизнеслогикой, для помощи обработчикам
 */
import {EDGE_TOP, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT} from '../const/connectors'
import {DISCONNECTED} from "../const/connectors";

/**
 * Проверяем коннекторы на то, что есть хотя бы один отсоединенный.
 * Если есть хоть один отсоединенный коннектор возвращаем null, иначе возвращаем коннекторы
 * @param state
 */
export const hasDisconnected = state => {
    var connectors = state.get('connectors').filter(connector => {
        return connector.getIn(['end1','state']) == "DISCONNECTED" || connector.getIn(['end2','state']) == "DISCONNECTED" ;
    })

    return ( connectors != null && connectors.size > 0);
}

/**
 * Получение положения концевика, коннектора
 * @param state состояние системы
 * @param connector коннектор
 * @param endName имя концевика, может быть "end1" или end2
 * @returns {x,y}
 */
export const getEndLocation = (state, connector, endName) => {
    var end1Location = null;
    if( connector.getIn([endName, 'state']) == DISCONNECTED ){
        end1Location =  connector.getIn([endName, 'loc']);
    }else {
        var connectorEnd = connector.getIn([endName, 'connectorEnd']);
        end1Location = getEndCoordinateByID(state, connectorEnd);
    }
    return end1Location;
}

/**
 * Вычисление координат для концевика
 * @param endId идетнификатор концевика
 * @param state иммутабельное состояние всей системы
 */
export const getEndCoordinateByID = (state, endId) => {
    var connectorEnd = getEndByID(state, endId);
    var node = getNodeByID(connectorEnd.get('node'), state);
    return getEndCoordinate(node.toJS(), connectorEnd.toJS());
}


/**
 * Высчитываем координату для возможного места присоединения коннектора
 */
export const getEndCoordinate = (node, end) => {
    return computeEndLocation(end.edge, end.shiftLoc, node.loc, node.width, node.height);
}


/**
 * Вычисление положения точки присоединения коннекторов
 * @param edge грань ноды от, которой нужно отсчитывать точку
 * @param shiftLoc смещение относительно центра грани
 * @param nodeLoc положение ноды (верзний левый угол)
 * @param nodeWidth ширина ноды
 * @param nodeHeight высота ноды
 */
export const computeEndLocation = (edge, shiftLoc, nodeLoc, nodeWidth, nodeHeight) => {
    var endLoc = {x:0, y:0};
    switch(edge){
        case EDGE_TOP:
            endLoc = { x: nodeLoc.x + Math.round(nodeWidth/2), y: nodeLoc.y };
            break;
        case EDGE_RIGHT:
            endLoc = { x: nodeLoc.x + nodeWidth,               y: nodeLoc.y + Math.round(nodeHeight/2) };
            break;
        case EDGE_BOTTOM:
            endLoc = { x: nodeLoc.x + Math.round(nodeWidth/2), y: nodeLoc.y + nodeHeight };
            break;
        case EDGE_LEFT:
            endLoc = { x: nodeLoc.x,                           y : nodeLoc.y + Math.round(nodeHeight/2) };
            break;
        default:
            return {x:0, y:0};
    }
    endLoc.x = endLoc.x + shiftLoc.x;
    endLoc.y = endLoc.y + shiftLoc.y;
    return endLoc;
}

/**
 * Найти концевик по его идентификатору.
 * @param endId идентификатор концевика
 * @param state полный state в иммутабельном виде
 * @returns Концевик в иммутабельном виде
 */
export const getEndByID = (state, endId) => {
    var ends = state.get('connectorEnd');
    for(var i=0; i< ends.size; i++) {
        if (ends.get(i).get('id') == endId) {
            return ends.get(i);
        }
    }
    return null;
}

/**
 * Найти ноду по ее ID
 * @param nodeId
 * @param state
 * @returns {*}
 */
const getNodeByID = (nodeId, state) =>{
    var nodes = state.get('nodes');
    for(var i=0; i< nodes.size; i++) {
        if (nodes.get(i).get('id') == nodeId) {
            return nodes.get(i);
        }
    }
    return null;
}

/**
 * Расчитываем прозрачность от 0 до 1 в интерфале от min до max для distance
 * @param distance
 * @param min
 * @param max
 */
export const computeOpacity = (distance, min, max) => {
    if(distance <= min ) return 1.0
    else if(distance > max) return 0
    else return (max - distance)/(max - min);
}