import _ from "lodash"
import {EDGE_CONNECTION_WIDTH} from '../const/connectors'
import {EDGE_TOP, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT} from '../const/connectors'

const distanceBetweenPoints = (x1,y1, x2,y2) => Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
/**
 *
 * @param x точка от которой определяем расстояние до прямой
 * @param y
 * @param x1 первая точка лежащая на прямой
 * @param y1
 * @param x2 вторая точка лежащая на прямой
 * @param y2
 */
// const distancePointLine = (x, y, x1, y1, x2, y2) => {
//     var a = y2 - y1;
//     var b = x1 - x2;
//     var c = x1*(y1-y2) + y1*(x2-x1);
//     var d = Math.abs(a*x + b*y +c)/Math.sqrt(a*a + b*b);
//     return d;
// }


/**
 * Расчитываем новые координаты, что бы присоединиться к узлу
 * @param connector
 * @param tailNumber - номер конца коннектора, для которого нужно расчитать кординату
 * @param nodes
 */
//export const evalConnectorCoordForNode2 = (cid,  nodes) =>{
//    // Пробуем найти наиболее близкую ноду
//    var nearestNodes = nodes.filter(node =>{
//        return true;
//    })
//}

/**
 * Проверяем коннекторы на то, что есть хотя бы один отсоединенный.
 * Если есть хоть один отсоединенный коннектор возвращаем null, иначе возвращаем коннекторы
 * @param state
 */
export const checkConnectorsOnDisconnect = state => {
    var connectors = state.connectors.filter(connector => {
        return connector.node1.state == "DISCONNECTED" || connector.node2.state == "DISCONNECTED" ;
    })
    
    console.log("state.connectors", state.connectors);
    return ( connectors != null && connectors.length ) ? null : state.connectors;
}

/**
 * Нужно пересчитать коннекторы у который state:DISCONNECTED
 * @param state
 */
export const evalConnectors = state => {
    return state.connectors.map(connector => {
        //console.log("+++ evalConnector, ", connector.node1.state, connector.node1.newNode , connector.node2.state, connector.node2.newNode, connector);
        if(connector.node1.state == "DISCONNECTED"){
            connector.node1.state = "CONNECTED";
            connector.node1.id = connector.node1.newNode != null ? connector.node1.newNode : connector.node1.id;
            let node = state.nodes.find( node => node.id == connector.node1.id);
            connector.cid1 = {x: node.x, y: node.y};
        }else if(connector.node2.state == "DISCONNECTED"){
            connector.node2.state = "CONNECTED";
            connector.node2.id = connector.node2.newNode != null ? connector.node2.newNode : connector.node2.id;
            let node = state.nodes.find( node => node.id == connector.node2.id);
            connector.cid2 = {x: node.x, y: node.y};
        }
        return connector;
    })
}

export const initConnectors = (state) => {
    console.log("init connectors");
    return state.connectors.map(connector => {
        var node1 = state.nodes.find( node => node.id == connector.node1.id);
        var node2 = state.nodes.find( node => node.id == connector.node2.id);
        connector.cid1 = evalConnectorCoordByEdge(node1, connector.node1.edge);
        connector.cid2 = evalConnectorCoordByEdge(node2, connector.node2.edge);

        return connector;
    })
}

/**
 * Определяем расстояние от точки cid до сегмента заданного двумя точками.
 * Но при условии что сегмент либо вертикален, либо горизонтален
 * @param cid
 * @param x
 * @param y
 * @param x1
 * @param y1
 */
export const distancePointSegment = (cid, x,y,x1,y1) => {

    //var a = y2 - y1;
    //var b = x1 - x2;
    //var c = x1*(y1-y2) + y1*(x2-x1);
    //var d = Math.abs(a*x + b*y +c)/Math.sqrt(a*a + b*b);

    var a = y1 - y;
    var b = x - x1;
    var c = x*(y-y1) + y*(x1-x);

    //Расчитываем дистанцию от точки до отрезка, если прямая падающая из точки на отрезок перпендикулярна
    var d = (x == x1 && cid.y >= y && cid.y <= y1) || (y == y1 && cid.x >= x && cid.x <= x1)
        ? Math.abs(a*cid.x + b*cid.y +c)/Math.sqrt(a*a + b*b)
        : null;

    if(d == null) {
        var distToXY = distanceBetweenPoints(cid.x, cid.y, x, y);
        var distToX1Y1 = distanceBetweenPoints(cid.x, cid.y, x1, y1);
        d = distToXY < distToX1Y1 ? distToXY : distToX1Y1;
    }
    return d;
}

/**
 * Расчет координаты коннектора для ноды.
 * @param node Ужел к которому нужно присоединить коннектор
 * @param edge Грань к которой нужно прицепить коннектор
 */
export const evalConnectorCoordByEdge = (node, edge) => {
    var newCid = null;
    //Верхняя грань
    if(edge == EDGE_TOP){
        newCid = {x: (node.x + Math.round(node.width/2) ),  y: node.y}
    }else if(edge == EDGE_LEFT){//левая грань
        newCid =  {x: node.x,  y: (node.y + Math.round(node.height/2))}
    }else if(edge == EDGE_RIGHT){//правая грань
        newCid =  {x: node.x + node.width,  y: (node.y + Math.round(node.height/2))} 
    }else if(edge == EDGE_BOTTOM){//нижняя грань
        newCid =  {x: node.x + Math.round(node.width/2),  y: node.y + node.height}
    }
    console.log("evalConnectorCoordByEdge: ", edge, newCid );
    return newCid;
}

/**
 * Вычисляет к какой границе нужно прицепить коннектор
 * Возвращает константу [EDGE_TOP, EDGE_LEFT, EDGE_RIGHT, EDGE_BOTTOM]
 */
const evalEdgeForNode = (node, cid) => {
    //Нужно определить сторону у node к которой прикрепить конец коннектора
    //node - квадратный, т.е. стороны либо горизонтальны, либо вертикальны
    var topSegmentResult = distancePointSegment(cid, node.x,  node.y, node.x + node.width, node.y);
    console.log("topSegmentResult: ", topSegmentResult);
    var leftSegmentResult = distancePointSegment(cid, node.x, node.y, node.x, node.y+node.height);
    console.log("leftSegmentResult: ", leftSegmentResult);
    var rightSegmentResult = distancePointSegment(cid, node.x + node.width, node.y, node.x + node.width, node.y+node.height);
    console.log("rightSegmentResult: ", rightSegmentResult);
    var bottomSegmentResult = distancePointSegment(cid, node.x, node.y+node.height, node.x + node.width, node.y+node.height);
    console.log("bottomSegmentResult: ", bottomSegmentResult);

    var array = [topSegmentResult, leftSegmentResult, rightSegmentResult, bottomSegmentResult];
    var maxIndex = 0;
    array.forEach((number, index) => {if(number < array[maxIndex]) maxIndex = index });
    
    if(maxIndex == 0){
        return EDGE_TOP
    }else if(maxIndex == 1){//левая грань
        return EDGE_LEFT
    }else if(maxIndex == 2){//правая грань
        return EDGE_RIGHT
    }else if(maxIndex == 3){//нижняя грань
        return EDGE_BOTTOM
    }
    
    return null;
}

/**
 * Расчитываем новые координаты, что бы присоединиться к узлу
 * @param node Ужел к которому нужно присоединить коннектор
 * @param cid Координаты конца коннектора
 */
 /*
const evalConnectorCoordForNode = (node, cid) => {
    var newCid = {x:0, y:0};
    //Нужно определить сторону у node к которой прикрепить конец коннектора
    //node - квадратный, т.е. стороны либо горизонтальны, либо вертикальны
    var topSegmentResult = distancePointSegment(cid, node.x,  node.y, node.x + node.width, node.y);
    console.log("topSegmentResult: ", topSegmentResult);
    var leftSegmentResult = distancePointSegment(cid, node.x, node.y, node.x, node.y+node.height);
    console.log("leftSegmentResult: ", leftSegmentResult);
    var rightSegmentResult = distancePointSegment(cid, node.x + node.width, node.y, node.x + node.width, node.y+node.height);
    console.log("rightSegmentResult: ", rightSegmentResult);
    var bottomSegmentResult = distancePointSegment(cid, node.x, node.y+node.height, node.x + node.width, node.y+node.height);
    console.log("bottomSegmentResult: ", bottomSegmentResult);

    var array = [topSegmentResult, leftSegmentResult, rightSegmentResult, bottomSegmentResult];
    var maxIndex = 0;
    array.forEach((number, index) => {if(number < array[maxIndex]) maxIndex = index });

    //Верхняя грань
    if(maxIndex == 0){
        newCid = {edge: EDGE_TOP, cid: {x: (node.x + Math.round(node.width/2) ),  y: node.y} }
    }else if(maxIndex == 1){//левая грань
        newCid =  {edge: EDGE_LEFT, cid:{x: node.x,  y: (node.y + Math.round(node.height/2))} } 
    }else if(maxIndex == 2){//правая грань
        newCid =  {edge: EDGE_RIGHT, cid:{x: node.x + node.width,  y: (node.y + Math.round(node.height/2))} }
    }else if(maxIndex == 3){//нижняя грань
        newCid =  {edge: EDGE_BOTTOM, cid:{x: node.x + Math.round(node.width/2),  y: node.y + node.height} }
    }

    return newCid;
}
*/

/**
 * Расчет коннектора. Производится, когда перетаскиваем один из концов коннектора.
 * По сути конец коннекотра является положением мыши.
 * Но если находимся достаточно близко к какой-нибудь ноде, то нужно к ней прилипнуть
 */
export const evalConnector = (state, connector, mouseX, mouseY) => {
    /**
     * Пробуем найти ближайший узел, если все узлы слишком далеко, то возвращаем null
     * @param nodes - список узлов
     * @param cid - координата для которой ищем ближайший узел
     */
    function findNearestNode(nodes, cid){
        return nodes.find(node => {
            //Нужно найти где cid внутри квадрата node, но node взять чуть шире
            return cid.x > node.x - EDGE_CONNECTION_WIDTH && cid.x < node.x + node.width + EDGE_CONNECTION_WIDTH
                && cid.y > node.y - EDGE_CONNECTION_WIDTH && cid.y < node.y + node.height + EDGE_CONNECTION_WIDTH
        })
    }
    
    function createNewNodeInfo(connectorNode, nearestNode, edge){
        var node = _.extend({}, connectorNode);
        node.state = nearestNode == null ? node.state = "DISCONNECTED" : node.state = "CONNECTED";
        node.edge = edge;
        node.id =  nearestNode == null ? node.id : nearestNode.id;
        return node;
    }

    var node = null;
    var cid  = {x: mouseX, y: mouseY};
    var edge = null;
    //var cidSecond = state.selected.tail == 1 ? connector.cid2 : connector.cid1; //Неподвижная координата

    //Нужно высчитать, мышь находится рядом с какой-нибудь нодой или нет
    var nearestNode = findNearestNode(state.nodes, cid);
    if( nearestNode != null){
        edge = evalEdgeForNode(nearestNode, cid);
        cid = evalConnectorCoordByEdge(nearestNode, edge);
    }

    var newConnector = _.extend({}, connector);

    if(state.selected.tail == 1) {
        newConnector.cid1 = cid;
        newConnector.node1 = createNewNodeInfo(connector.node1, nearestNode, edge);
    }else if(state.selected.tail == 2){
        node = _.extend({}, connector.node2);
        node.state = nearestNode == null ? node.state = "DISCONNECTED" : node.state = "CONNECTED";
        node.edge = edge;
        node.id =  nearestNode == null ? node.id : nearestNode.id;
        //node.newNode =  nearestNode == null ? null : nearestNode.id;
        newConnector.cid2 = cid;
        newConnector.node2 = createNewNodeInfo(connector.node2, nearestNode, edge);
    }

    return newConnector;


}

/**
 * Очистить ноды от лишней информации 
 */
export const clearNodes = (nodes) => {
    return nodes.map(node => {
        node.showConnectorEndOnEdge = null;
        node.showConnectorEnd = false;
        return node;
    })
}

/**
 * Высчитываем координату для возможного места присоединения коннектора 
 */
export const getEndsCoordinate = (node, ends) => {
    switch(ends.edge){
        case EDGE_TOP:
            return { x: node.x + Math.round(node.width/2) + ends.shift, y: node.y };
        case EDGE_RIGHT:
            return { x: node.x + node.width, y: node.y + Math.round(node.height/2) + ends.shift };
        case EDGE_BOTTOM:
            return { x: node.x + Math.round(node.width/2) + ends.shift, y: node.y + node.height };
        case EDGE_LEFT:
            return { x: node.x, y : node.y + Math.round(node.height/2) + ends.shift };
        default: 
            return null;
    }
}

export const isConnectorNear = (node, cid) =>{
    return cid.x > node.x - EDGE_CONNECTION_WIDTH && cid.x < node.x + node.width + EDGE_CONNECTION_WIDTH
        && cid.y > node.y - EDGE_CONNECTION_WIDTH && cid.y < node.y + node.height + EDGE_CONNECTION_WIDTH
   
}