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
import {distanceBetweenPointsCoord} from "../utils/math";
import {GRID_SIZE} from "../const/connectors";
import {CONNECTOR_TYPE} from "../const/connectors";
import {CONNECTOR_TYPE_LINE} from "../const/connectors";
import {closestPoint} from "../utils/pathCalculator";

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
 * Расстояние от точки до кривой описаной path
 * @param point
 * @param connector
 * @returns расстояние
 */
export const distance_point_to_path = (point, connector) =>{
    var start = (new Date()).getTime();
    var pathNode = document.getElementById("connector_path_"+connector.get("id"));
    console.log("====== document.getElementById", (new Date()).getTime() - start );
    let closePoint = closestPoint(pathNode, point).distance;
    console.log("++++ pathNode", (new Date()).getTime() - start );
    return closePoint;
}

/**
 * Пробуем найти коннектор наиболее близкий к точке. По сути тоже самое, что findNearestConnector,
 * но если в радиусе клика есть уже выделенный коннектор, то берем его
 * @param state состояние системы
 * @param point точка для которой нужно найти наиболее близкий коннектор
 * @param takeSelected если взведен, то отдаем приоритет уже выделенному коннектору
 */
export const findNearestConnectorOrSelected = (state, point) =>{
    return findNearestConnectorInner(state, point, true);
}

/**
 * Пробуем найти коннектор наиболее близкий к точке.
 * Результатом является либо коннектор, либо null
 * @param state состояние системы
 * @param point точка для которой нужно найти наиболее близкий коннектор
 */
export const findNearestConnector = (state, point) => {
    return findNearestConnectorInner(state, point, false);
}

const findNearestConnectorInner = (state, point, takeSelected) =>{
    var selectedConnectorId = null;
    if( state.getIn(['selected','type']) === CONNECTOR ) {
        selectedConnectorId = state.getIn(['selected','id']);
    }

    var connectors = state.get('connectors');
    var minDistance = Number.POSITIVE_INFINITY;
    var nearestConnector = null;
    var needFinished = false;
    for(var i=0; i < connectors.size && !needFinished; i++){
        var connector = connectors.get(i);
        //TODO: нужно подумать над оптимизацией функции getEndLocation - т.к. внутри бегаем по иммутабельной структуре
        var distance;
        if(CONNECTOR_TYPE === CONNECTOR_TYPE_LINE) {
            let end1Location = getEndLocation(state, connector, 'end1');
            let end2Location = getEndLocation(state, connector, 'end2');
            distance = dist_point_to_segment(point, end1Location, end2Location)
        }else{
            distance = distance_point_to_path(point, connector);
        }
        if(distance < minDistance && distance < SELECT_DISTANCE){
            nearestConnector = connector;
            minDistance = distance;
        }
        //Если мы нашли в списке коннектор который уже выделен, то выбираем его.
        if(takeSelected && distance < SELECT_DISTANCE && selectedConnectorId == connector.get("id")){
            nearestConnector = connector;
            minDistance = distance;
            needFinished = true;
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
    //TODO: тут что-то не так с логикой,
    if(dist1 > SELECT_DISTANCE && dist2 > SELECT_DISTANCE) return null;

    return dist1 < dist2 ? 'end1' : 'end2';
}


/**
 * @deprecated Вроде как нигде более не используется
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
    function convertToIdMapAndFilterByDistance(nodes){
        var map = {};
        for(var i=0; i<nodes.size; i++){
            let node = nodes.get(i);
            let distance = distanceToNode(point, node);
            if( distance < MAX_NODE_DIST ) {
                map[node.get("id")] = distance;
            }
        }
        return map;
    };

    //console.log("computeConnectorEndVisibility ", state.toJS());
    //Получаем массив расстояний до нод
    // var distances = state.get('nodes')
    //     .map(node => {
    //         return {nodeId: node.get('id'), distance: distanceToNode(point, node)}
    //     })
    //     .filter(dist => dist.distance < MAX_NODE_DIST);
    let distancesNodeMap = convertToIdMapAndFilterByDistance(state.get('nodes'));

    return state.get('connectorEnd').map( end => {
        //var dist = distances.find( dist => dist.nodeId == end.get('node'));
        let dist = distancesNodeMap[end.get('node')];
        if( dist != null ){
            return end.set('visible', true).set('opacity', computeOpacity(dist, MIN_NODE_DIST, MAX_NODE_DIST));
        }else{
            return end.set('visible', false).set('opacity', 0);
        }
    });
}

/**
 * Расстояние от точки до ноды.
 */
export const distanceToNode = (point, node) => {
    var nodeObj = node.toJS();
    return dist_point_to_box(point, nodeObj.loc, {x: nodeObj.loc.x+nodeObj.width, y: nodeObj.loc.y + nodeObj.height});
}

/**
 * Подсветка элементов, если на них можно нажать
 * @param state
 * @param point
 */
export const highlightElements = (state, point) => {
    let nearestConnector = findNearestConnectorOrSelected(state, point);
    let nearestConnectorId = nearestConnector != null ? nearestConnector.get('id') : null;

    let connectors = state.get('connectors').map(connector => {
        if(connector.get('id') == nearestConnectorId) {
            return connector.set('highlight', true);
        }
        return connector.set('highlight', false);
    });
    var findHighlighted = false;
    let nodes = state.get('nodes').map(node => {
        let nodeJson = node.toJS();
        var topLeftPoint = nodeJson.loc;
        var bottomRightPoint = {x: topLeftPoint.x + nodeJson.width, y: topLeftPoint.y + nodeJson.height};
        if(!findHighlighted && nearestConnector == null && point_in_box(point, topLeftPoint, bottomRightPoint)){
            findHighlighted = true;
            return node.set('highlight', true);
        }
        return node.set('highlight', false);
    });

    return {connectors: connectors, nodes: nodes};
}

/**
 * расчет подсветки коннекторов, когда мышка близко к ним
 * @param state
 * @param point
 */
export const computeHighlightConnector = (state, point) =>{
    let nearestConnector = findNearestConnectorOrSelected(state, point);

    return state.get('connectors').map(connector => {
        if(nearestConnector!=null && connector.get('id') == nearestConnector.get('id')) {
            return connector.set('highlight', true);
        }
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

        //Вычисление новой позиции ноды, по сетке с шагом GRID_SIZE
        let newLocation = concatPoint(state.get('shiftLoc').toJS(),  mousePosition);
        newLocation.x = newLocation.x - newLocation.x % GRID_SIZE;
        newLocation.y = newLocation.y - newLocation.y % GRID_SIZE;
        if( newLocation.x == node.getIn(['loc','x']) && newLocation.y == node.getIn(['loc','y']) )
            return node
        else
            return node.set('loc', Immutable.fromJS( newLocation ) );

        //return node.set('loc', Immutable.fromJS( concatPoint(state.get('shiftLoc').toJS(),  mousePosition) ) );
    })
}


export const computeEnds = (state, ends, mousePosition) => {
    let selectedId = state.getIn(['selected','id']);
    return ends.map(end => {
        if(end.get('node') == selectedId) {
            //Производим изменение объекта, что бы он обновился
            return end.set("_systemChanged", end.get("_systemChanged") ? false : true); //Immutable.fromJS( end.toJS() )
        }
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
            if(cur.distance > SELECT_DISTANCE) {
                return prev
            } else if(cur.distance < prev.distance ){
                return cur
            }
            return prev;
        }, {end: null, distance: SELECT_DISTANCE + 1} )
        .end;
}


/**
 * Расчитывает перемещение коннектора
 * @param state
 * @param point
 */
export const computeMovedConnector = (state, point) =>{
    let sellectedId = state.getIn(['selected', 'id']);
    let movedEndName = state.getIn(['selected','tail']);
    let nearestConnector = findNearestConnectorEnd(state, point);
    return state.get('connectors').map(connector => {
        if (connector.get('id') != sellectedId) return connector;

        if(nearestConnector == null){
            //console.log('+ computeMovedConnector point',point);
            return connector.setIn([movedEndName,'state'], DISCONNECTED).setIn([movedEndName,'loc'], Immutable.fromJS({x:point.x,y:point.y}))
        } else {
            return connector.setIn([movedEndName,'state'], CONNECTED).setIn([movedEndName,'loc'], null).setIn([movedEndName,'connectorEnd'], nearestConnector.get('id'))
        }

    })
}

// /**
//  * Расстояние от точки до центра ноды.
//  * По хорошему нужно бы переделать на расстояние до граней ноды
//  */
// export const distaneToNode = (x, y, node) => {
//     var nodeObj = node.toJS();
//     var distanceToCenter = distanceBetweenPointsCoord( x, y, nodeObj.loc.x + Math.abs(nodeObj.width/2), nodeObj.loc.y + Math.abs(nodeObj.height/2) );
//     return distanceToCenter;
// }
//
// /**
//  * Вычисляем видимость или невидимость точек присоединения коннекторов.
//  * Точки относящиеся к ноде становяться постепенно видимыми в зависимости от приближения к ноде мышки
//  */
// export const computeEndLocationVisibility = (state, mouseX, mouseY) => {
//     //Вычисляем расстояние от мышки до ноды.
//     return state.get('nodes').map(node => {
//         return {nodeId: node.get('id'), distance: distaneToNode(mouseX, mouseY, node)}
//     }).toJS();
//
// }

