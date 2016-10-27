/**
 * Содержит предметные обработчики
 */
import {hasDisconnected, getEndByID, getEndLocation, computeOpacity} from './utils'
import {CANCEL_MOVE, STOP_MOVE_CONNECTOR, STOP_MOVE_NODE} from "../const/actions"
import {dist_point_to_segment, dist, point_in_box, dist_point_to_box} from "../utils/math";
import {SELECT_DISTANCE} from "../const/connectors";
import {MIN_NODE_DIST, MAX_NODE_DIST} from "../const/entity";
import Immutable from 'immutable'
import {concatPoint} from "../utils/math";
import {CONNECTOR, NODE} from "../const/entity";
import {DISCONNECTED} from "../const/connectors";
import {getEndCoordinateByID} from "./utils";
import {CONNECTED} from "../const/connectors";

/**
 * Обработчик на момент когда решили остановить перетаскивание ноды или коннектора
 * @param state состояние системы
 */
export const stopMove = (state) => {
    if(state.get('selected').get('type') == CONNECTOR){
        if(hasDisconnected(state)){
            return {type: CANCEL_MOVE}
        }else {
            return {type: STOP_MOVE_CONNECTOR}
        }
    }
    else if(state.get('selected').get('type') == NODE) {
        //Двигали ноду
        return {type: STOP_MOVE_NODE};
    }
    
}

/**
 * Пробуем найти коннектор наиболее близкий к точке.
 * Результатом является либо коннектор, либо null
 * @param state состояние системы
 * @param point точка для которой нужно найти наиболее близкий коннектор
 */
export const findNearestConnector = (state, point) => {

    var connectors = state.get('connectors');
    var minDistance = Number.POSITIVE_INFINITY;
    var nearestConnector = null
    for(var i=0; i < connectors.size; i++){
        var connector = connectors.get(i);
        var end1Location = getEndLocation(state, connector, 'end1');
        var end2Location = getEndLocation(state, connector, 'end2');
        var distance = dist_point_to_segment(point, end1Location, end2Location);
        if(distance < minDistance && distance < SELECT_DISTANCE){
            nearestConnector = connector;
            minDistance = distance;
        }
    }

    return nearestConnector;
}

/**
 * Когда будем таскать коннектор, нужно знать за какой конец таскаем
 * @param state
 * @param selectedConnector
 * @param point
 */
export const nearestConnectorTailName = (state, selectedConnector, point) => {
    var end1Location = getEndLocation(state, selectedConnector, 'end1');
    var end2Location = getEndLocation(state, selectedConnector, 'end2');
    var dist1 = dist(point, end1Location);
    var dist2 = dist(point, end2Location);
    if(dist1 > SELECT_DISTANCE && dist2 > SELECT_DISTANCE) return null;

    return dist1 < dist2 ? 'end1' : 'end2';
}


/**
 * Возвращает один из концевиков, к которому присоединен коннектор и около которого кликнули мышкой
 * @param state состояние системы
 * @param selectedConnector коннектор для которого определяем
 * @param point координаты точки к которой нужно определить близость одного из концевиков
 */
export const isNearConnectorTail = (state, selectedConnector, point) => {
    var end1Location = getEndLocation(state, selectedConnector, 'end1');
    var end2Location = getEndLocation(state, selectedConnector, 'end2');
    var dist1 = dist(point, end1Location);
    var dist2 = dist(point, end2Location);
    if(dist1 > SELECT_DISTANCE && dist2 > SELECT_DISTANCE) return null;

    return dist1 < dist2
        ? getEndByID(state, selectedConnector.getIn(['end1', 'connectorEnd']))
        : getEndByID(state, selectedConnector.getIn(['end2', 'connectorEnd']));

}

/**
 * Проверяем, что точка находиться внутри ноде
 * @param state состояние системы
 * @param point точка, для которой нужно определить, что находится внутри ноды
 */
export const findSelectedNode = (state, point) => {
    var nodes = state.get('nodes').filter( node => {
        var topLeftPoint = node.get('loc').toJS();
        var bottomRightPoint = {x: node.getIn(['loc','x']) + node.get('width'), y: node.getIn(['loc','y']) + node.get('height')};
        var res = point_in_box(point, topLeftPoint, bottomRightPoint);
        return res;
    });
    if(nodes != null && nodes.size > 0) return nodes.get(0);
    return null;
}

/**
 * Вычисляем видимость или невидимость точек присоединения коннекторов.
 * Точки относящиеся к ноде становяться постепенно видимыми в зависимости от приближения к ноде мышки
 * @param state
 * @param point
 */
export const computeConnectorEndVisibility = (state, point) => {
    //Получаем массив расстояний до нод
    var distances = state.get('nodes')
        .map(node => {
            return {nodeId: node.get('id'), distance: distanceToNode(point, node)}
        })
        .filter(dist => dist.distance < MAX_NODE_DIST);

    return state.get('connectorEnd').map( end => {
        var dist = distances.find( dist => dist.nodeId == end.get('node'))
        if( dist ){
            return end.set('visible', true).set('opacity', computeOpacity(dist.distance, MIN_NODE_DIST, MAX_NODE_DIST));
        }else{
            return end.set('visible', false).set('opacity', 0);
        }
    });
}

/**
 * Расстояние от точки до центра ноды.
 * По хорошему нужно бы переделать на расстояние до граней ноды
 */
export const distanceToNode = (point, node) => {
    var nodeObj = node.toJS();
    return dist_point_to_box(point, nodeObj.loc, {x: nodeObj.loc.x+nodeObj.width, y: nodeObj.loc.y + nodeObj.height});
}

/**
 * расчет подсветки коннекторов, когда мышка близко к ним
 * @param state
 * @param point
 */
export const computeHighlightConnector = (state, point) =>{
    let nearestConnector = findNearestConnector(state, point);

    return state.get('connectors').map(connector => {
        if(nearestConnector!=null && connector.get('id') == nearestConnector.get('id')) return connector.set('highlight', true);
        return connector.set('highlight', false);
        // var end1Location = getEndLocation(state, connector, 'end1');
        // var end2Location = getEndLocation(state, connector, 'end2');
        // var distance = dist_point_to_segment(point, end1Location, end2Location);
        // return connector.set('highlight', distance < SELECT_DISTANCE)
    })
}



/**
 * Расчитываем координаты прорисовки нод, на основании положения курсора мышки и состояния нод
 * @param state
 * @param mousePosition
 * @return Возвращаем списов нод в котором изменена перересованная нода
 */
export const computeMovedNodes = (state, mousePosition) => {
    var selectedNodeId = state.getIn(['selected','id']);
    return state.get('nodes').map(node => {
        if(selectedNodeId != node.get('id')) return node;
        return node.set('loc', Immutable.fromJS( concatPoint(state.get('shiftLoc').toJS(),  mousePosition) ) );
    })
}


export const computeEnds = (state, ends, mousePosition) => {
    return ends.map(end => {
        if(end.get('node') == state.getIn(['selected','id']))
            return Immutable.fromJS( end.toJS() )
        return end;

    });
}


/**
 * Находим наиболее близкий концевик к заданной точке
 * @param state
 * @param point
 */
export const findNearestConnectorEnd = (state, point) =>{
    if(state.get('connectorEnd') == null) return null;

    return state.get('connectorEnd')
        .map(end => {
            let endPosition = getEndCoordinateByID(state, end.get('id'));
            let distance = dist(endPosition, point);
            return {end: end, distance: distance}
        })
        .reduce( (prev, cur) => {
            if(cur.distance > SELECT_DISTANCE)
                return prev
            else if(cur.distance < prev.distance){
                return cur
        }
    }, {end: null, distance: SELECT_DISTANCE + 1} )
        .end;
}


/**
 * Расчитывает перемещение коннектора
 * @param state
 * @param point
 */
export const computeMovedConnector = (state, point) =>{
    return state.get('connectors').map(connector => {
        if (connector.get('id') != state.getIn(['selected', 'id'])) return connector;

        let movedEndName = state.getIn(['selected','tail']);
        var nearestConnector = findNearestConnectorEnd(state, point);
        if(nearestConnector == null){
            console.log('+ computeMovedConnector point',point);
            return connector.setIn([movedEndName,'state'], DISCONNECTED).setIn([movedEndName,'loc'], Immutable.fromJS({x:point.x,y:point.y}))
        } else {
            return connector.setIn([movedEndName,'state'], CONNECTED).setIn([movedEndName,'loc'], null).setIn([movedEndName,'connectorEnd'], nearestConnector.get('id'))
        }

    })
}