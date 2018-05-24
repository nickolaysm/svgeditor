import {EDGE_LEFT} from "../const/connectors";
import {EDGE_RIGHT} from "../const/connectors";
import {snap} from "./snap/snap";
import {snapPath} from "./snap/path";
import {EDGE_TOP} from "../const/connectors";
import {EDGE_BOTTOM} from "../const/connectors";
import {BASE_NODE_WIDTH} from "../const/entity";
import {BASE_NODE_HEIGHT} from "../const/entity";
/**
 * Расчет пути для svg линии
 */
let MOVE_STEP = 20;

/**
 * Шаг 1.
 * Пробуем осознать точка p2 дальше по пути или нужно уходить в сторону
 */
export const move90Angle = (p1, p2) => {
    var nextPoint = {};
    var p12y = Math.round( (p1.y-p2.y)/2 );
    var p12x = Math.round( (p1.x-p2.x)/2 );

    switch(p1.position){
        case 'TOP':
            //Если p2 выше более чем на половину пути, то идем на половину пути.
            if( p12y >  MOVE_STEP )
                nextPoint = {x: p1.x, y: p1.y - p12y, position: p1.position}
            else
                nextPoint = {x: p1.x, y: p1.y - MOVE_STEP, position: p1.position};
            break;
        case 'BOTTOM':
            if( -p12y >  MOVE_STEP )
                nextPoint = {x: p1.x, y: p1.y - p12y, position: p1.position}
            else
                nextPoint = {x: p1.x, y: p1.y + MOVE_STEP, position: p1.position};
            break;
        case 'LEFT':
            if( p12x >  MOVE_STEP )
                nextPoint = {x: p1.x - p12x, y: p1.y, position: p1.position}
            else
                nextPoint = {x: p1.x - MOVE_STEP, y: p1.y, position: p1.position};
            break;
        case 'RIGHT':
            if( -p12x >  MOVE_STEP )
                nextPoint = {x: p1.x - p12x, y: p1.y, position: p1.position}
            else
                nextPoint = {x: p1.x + MOVE_STEP, y: p1.y, position: p1.position};
            break;
    }
    return nextPoint;
}

/**
 * Задача функции понять, можно ли продолжить линию от p1 дальше, до уровня p2
 */
export const tryFindSimpleWay = (p1, p2)=>{
    var nextPoint = null;
    switch(p1.position){
        case 'TOP':
            //Значит пробуем тянуть линию вверх, в этом случае ищем p2 справа или слева выше нас, и с позицией TOP или BOTTOM
            if(p1.y > p2.y)
                if( (p2.position === "TOP" || p2.position === "BOTTOM")
                    || ( p1.x < p2.x && p2.position === EDGE_LEFT )
                    || ( p1.x > p2.x && p2.position === EDGE_RIGHT ) ) {
                    nextPoint = {x: p1.x, y: p2.y, position: p1.position}
                }
            break;
        case 'BOTTOM':
            if(p1.y < p2.y){
                if( (p2.position === "TOP" || p2.position === "BOTTOM")
                    || ( p1.x < p2.x && p2.position === EDGE_LEFT )
                    || ( p1.x > p2.x && p2.position === EDGE_RIGHT ) ) {
                    nextPoint = {x: p1.x, y: p2.y, position: p1.position};
                }
            }
            break;
        case 'LEFT':
            if(p1.x > p2.x && (p2.position === "LEFT" || p2.position === "RIGHT"))
                nextPoint = {x: p2.x, y: p1.y, position:p1.position}
            break;
        case 'RIGHT':
            if(p1.x < p2.x && (p2.position === "LEFT" || p2.position === "RIGHT"))
                nextPoint = {x: p2.x, y: p1.y, position:p1.position}
            break;
    }
    return nextPoint;
}

/**
 * Двигаемся под прямым углом к текущему движению, для достижения уровня медианы
 */
export const moveToMedian = (p, mediana) => {
    var nextPoint = {x: p.x, y: p.y};
    // var toMedX = Math.round( (p.x-mediana.x)/2 );
    // var toMedY = Math.round( (p.y-mediana.y)/2 );
    switch(p.position){
        case 'TOP':
        //Двигаемся влево или вправо для достижения уровня медианы
        //nextPoint = {x: p.x - p.x-mediana.x, y: p.y, position: p.x > mediana.x ? "LEFT" : "RIGHT"}
        case 'BOTTOM':
            nextPoint.x = p.x - (p.x-mediana.x);
            nextPoint.position = p.x > mediana.x ? "LEFT" : "RIGHT";
            break;
        case 'LEFT':
        case 'RIGHT':
            nextPoint.y = p.y - (p.y-mediana.y);
            nextPoint.position = p.y > mediana.y ? "TOP" : "BOTTOM";
            break;
    }
    return nextPoint;
}

/**
 * Для определения находяться ли точки на прилигающих друг к другу гранях. Нарпимер Left и Bottom
 * @param p1
 * @param p2
 */
const isNeighborhoodEdge = (p1, p2) => {
    return ( (p1.position == EDGE_LEFT || p1.position == EDGE_RIGHT) && (p2.position == EDGE_BOTTOM || p2.position == EDGE_TOP) )
        || ( (p1.position == EDGE_BOTTOM || p1.position == EDGE_TOP) && (p2.position == EDGE_LEFT || p2.position == EDGE_RIGHT) )
    
}

const move90AngleStep = (p)=>{
    var nextPoint = {x: p.x, y: p.y, position: p.position};
    switch(p.position){
        case 'TOP':
            nextPoint.y = nextPoint.y - MOVE_STEP;
            break;
        case 'BOTTOM':
            nextPoint.y = nextPoint.y + MOVE_STEP;
            break;
        case 'LEFT':
            nextPoint.x = nextPoint.x - MOVE_STEP;
            break;
        case 'RIGHT':
            nextPoint.x = nextPoint.x + MOVE_STEP;
            break;
    }
    return nextPoint;
}

/**
 * Возвращает массив точек с путем от точки p1 до точки p2, в случае когда они на одной ноде
 * @param p1
 * @param p2
 */
export const calculateCircleLinePointArray = (p1, p2) => {
    // Создаем точки отходящие под прямым углом от поверхностей
    var array = [];

    let p1_90Angle = move90AngleStep(p1);
    let p2_90Angle = move90AngleStep(p2);
    array.push(p1);
    array.push(p1_90Angle);

    if(p1_90Angle.position == p2_90Angle.position || isNeighborhoodEdge(p1_90Angle, p2_90Angle)){
        //В этом случае просто соединяем p1_90Angle и p2_90Angle
        let left_or_right_point, top_or_bottom;
        if (p1_90Angle.position == EDGE_LEFT || p1_90Angle.position == EDGE_RIGHT){
            left_or_right_point = p1_90Angle;
            top_or_bottom = p2_90Angle;
        }else{
            left_or_right_point = p2_90Angle;
            top_or_bottom = p1_90Angle;
        };
        let middlePoint = {x: left_or_right_point.x, y: top_or_bottom.y};
        array.push(middlePoint);
    }

    // Точки с разных сторон ноды
    if(p1_90Angle.position == EDGE_BOTTOM || p1_90Angle.position == EDGE_TOP){
        //Точки сверху и снизу
        array.push({x: p1_90Angle.x + BASE_NODE_WIDTH/2 + MOVE_STEP, y: p1_90Angle.y});
        array.push({x: p2_90Angle.x + BASE_NODE_WIDTH/2 + MOVE_STEP, y: p2_90Angle.y});
    }else{
        //Точки справа и слева
        array.push({x: p1_90Angle.x, y: p1_90Angle.y + BASE_NODE_HEIGHT/2 + MOVE_STEP});
        array.push({x: p2_90Angle.x, y: p2_90Angle.y + BASE_NODE_HEIGHT/2 + MOVE_STEP});
    }


    array.push(p2_90Angle);
    array.push(p2);
    return array;
}

/**
 * Возвращает массив точек с путем от точки p1 до точки p2
 */
export const calculatePointArray = (p1, p2) => {
    var array = [];
    array.push(p1);
    //двигаемся под прямым углом к поверхности от точки
    //var nextPoint = move90Angle(p1);
    //array.push(nextPoint);
    //console.log("p1, p2", p1, p2);
    // Создаем точки отходящие под прямым углом от поверхностей
    var p1_90Angle = move90Angle(p1, p2);
    //console.log("p1_90Angle", p1_90Angle);
    var p2_90Angle = move90Angle(p2, p1);
    //console.log("p2_90Angle", p2_90Angle);
    array.push(p1_90Angle);

    //Пробуем обойтись без медианы. Для этого нужно попытаться продолжить одну из линии, пока она не выйдет до уровня другой.
    var simpleWayPoint = tryFindSimpleWay(p1_90Angle, p2_90Angle);
    //console.log("simpleWayPoint 1", simpleWayPoint);
    if(simpleWayPoint == null) {
        simpleWayPoint = tryFindSimpleWay(p2_90Angle, p1_90Angle);
        //console.log("simpleWayPoint 2", simpleWayPoint);
    }
    if(simpleWayPoint != null) {
        array.push(simpleWayPoint)
    }else{
        //пробуем ооталкиваться от медианной точки
        var mediana = {x: p1.x + Math.round( (p2.x - p1.x)/2 ), y: p1.y + Math.round( (p2.y - p1.y)/2 ), position:'NONE'};
        //console.log('mediana', mediana);
        //Нужно построить прямую от точек p1_90Angle и p2_90Angle до уровня медианы, двигаясь под прямым углом к текущему движению
        //console.log('moveToMedian', moveToMedian(p1_90Angle, mediana) )
        array.push( moveToMedian(p1_90Angle, mediana) );

        array.push(mediana);

        array.push( moveToMedian(p2_90Angle, mediana) );
    }

    array.push(p2_90Angle);
    array.push(p2);
    return array;
}


/**
 * Расстояние от точки до svg.path
 * @param pathNode html нода для svg элемента path
 * @param point точка от которой будем искать кратчайший путь
 * @returns {Array|*[]}
 */
export const closestPoint = (pathNode, point) => {
    //console.group("closestPoint");
    var startTime = (new Date()).getTime();
    var pathLength = pathNode.getTotalLength(),
        precision = 1024,
        best,
        bestLength,
        bestDistance = Infinity;

    var time1 = (new Date()).getTime();
    // linear scan for coarse approximation
    for (var scanLength = 0; scanLength <= pathLength; scanLength += precision) {
        var scan = pathNode.getPointAtLength(scanLength);
        var scanDistance = distance2(scan);
        if (scanDistance < bestDistance) {
            best = scan;
            bestLength = scanLength;
            bestDistance = scanDistance;
        }
    }

    var time2 = (new Date()).getTime();
    // binary search for precise estimate
    precision /= 2;
    while (precision > 0.5) {
        var beforeLength = bestLength - precision;
        var before = pathNode.getPointAtLength(beforeLength);
        var beforeDistance = distance2(before);
        var afterLength = bestLength + precision;
        var after = pathNode.getPointAtLength(afterLength);
        var afterDistance = distance2(after);

        if (beforeLength >= 0 && beforeDistance < bestDistance) {
            best = before; bestLength = beforeLength; bestDistance = beforeDistance;
        } else if (afterLength <= pathLength && afterDistance < bestDistance) {
            best = after; bestLength = afterLength; bestDistance = afterDistance;
        } else {
            precision /= 2;
        }
    }
    var time3 = (new Date()).getTime();

    best = [best.x, best.y];
    best.distance = Math.sqrt(bestDistance);
    var endTime = (new Date()).getTime();
    //console.log("FullTime:", endTime - startTime);
    // console.log("Time 1-2:", time2 - time1);
    // console.log("Time 2-3:", time3 - time2);
    // console.groupEnd();
    return best;

    function distance2(p) {
        var dx = p.x - point.x,
            dy = p.y - point.y;
        return dx * dx + dy * dy;
    }
}


/****
 * Все для расчета пересечения двух path
 */
const p2s = /,?([a-z]),?/gi;

/**
 * Что бы получить путь круга, нужно задать первые три коотрдинаты
 * @param x
 * @param y
 * @param rx
 * @param ry
 * @param a
 * @returns {*[]}
 */
export const ellipsePath = (x, y, rx, ry, a) => {
    var res;
    if (a == null && ry == null) {
        ry = rx;
    }
    x = +x;
    y = +y;
    rx = +rx;
    ry = +ry;
    if (a != null) {
        var rad = Math.PI / 180,
            x1 = x + rx * Math.cos(-ry * rad),
            x2 = x + rx * Math.cos(-a * rad),
            y1 = y + rx * Math.sin(-ry * rad),
            y2 = y + rx * Math.sin(-a * rad),
            res = [["M", x1, y1], ["A", rx, rx, 0, +(a - ry > 180), 0, x2, y2]];
    } else {
        res = [
            ["M", x, y],
            ["m", 0, -ry],
            ["a", rx, ry, 0, 1, 1, 0, 2 * ry],
            ["a", rx, ry, 0, 1, 1, 0, -2 * ry],
            ["z"]
        ];
    }
    return res;
}

export const interPathHelper = (path1curve, path2curve, justCount) => {
    console.log(">>> ",(new Date()).getMilliseconds());
    console.log("snap", snap);
    var Snap = snap;
    snapPath(Snap, {}, {}, {});

    let path1 = Snap.parsePathString(path1curve);
    let path2 = Snap.parsePathString(path2curve);
    //return interHelper(path1, path2, justCount);
    var inters = Snap.path.intersection(path1, path2);
    console.log("<<< ",(new Date()).getMilliseconds());
    return inters;
};


export const pathArrayToString = (pathArray) => {
    return pathArray.join(",").replace(p2s, "$1");
}

export const distanse_point_to_path = (point, path) => {
    //TODO: Изучить алгоритм https://bl.ocks.org/mbostock/8027637  (медленно работает)
}