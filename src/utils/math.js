/**
 * Алгоритмы для работы с вычислительной геометрией
 * Переведено с С++ http://hardfire.ru/all_geom
 */

export const eps = 1e-8;
export const pi  = 3.14159265358979323;

export const distanceBetweenPointsCoord = (x1,y1, x2,y2) => Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );

// расстояние между двумя точками
export const dist = (point1, point2) => distanceBetweenPointsCoord(point1.x, point1.y, point2.x, point2.y);

/**
 * Структура данных точки
 */
export const point = (x, y) => ({x:x, y:y});

/**
 * Структура данных прямой задаваемой формулой ax + by + c = 0
 */
export const line = (a,b,c) => ({a:a, b:b, c:c});

/**
 * Создание по двум точкам прямой задаваемой формулой ax + by + c = 0
 */
export const toline = (point1, point2) => {
    var a = point2.y - point1.y;
    var b = point1.x - point2.x;

    return line(a, b, - a * point1.x - b * point1.y);
}


export const concatPoint = (point1, point2) => {
    return {x: point1.x + point2.x, y: point1.y + point2.y};
}

/**
 * лежит ли точка в прямоугольнике, который образуют заданные точки
 * @returns булевое значение
 */
export const point_in_box = (point, point1, point2) => {
    return  (Math.abs (point.x - Math.min(point1.x, point2.x)) <= eps || Math.min(point1.x, point2.x) <= point.x) &&
        (Math.abs (Math.max(point1.x, point2.x) - point.x) <= eps || Math.max(point1.x, point2.x) >= point.x) &&
        (Math.abs (point.y - Math.min(point1.y, point2.y)) <= eps || Math.min(point1.y, point2.y) <= point.y) &&
        (Math.abs (Math.max(point1.y, point2.y) - point.y) <= eps || Math.max(point1.y, point2.y) >= point.y);
}

/**
 * проекция точки на прямую
 * @param line лструктура данных характеризующая линию
 * @param point точка
 * @returns {*}
 */
export const closest_point = (line, p) =>{
    var k = (line.a * p.x + line.b * p.y + line.c) / (line.a * line.a + line.b * line.b);
    return point(p.x - line.a * k, p.y - line.b * k);
}

/**
 * расстояние от точки до отрезка
 * @param point точка
 * @param point1 первая точка задающая прямую
 * @param point2 вторая точка задающая прямую
 * @returns число с плавающей точкой
 */
export const dist_point_to_segment = (point, point1, point2) =>{
    var t = closest_point (toline (point1, point2), point);

    if (point_in_box(t, point1, point2))
        return dist(point, t);
    else
        return Math.min(dist (point, point1), dist (point, point2));
}

/**
 * Расстояние от точки до прямоугольника. Наименьшее расстояние до одной из сторон прямоугольника.
 * Если точка внутри прямоугольника тогда 0.
 * @param point
 * @param point1
 * @param point2
 */
export const dist_point_to_box = (point, point1, point2) => {
    if(point_in_box(point, point1, point2)) return 0;
    var distToLeft = dist_point_to_segment(point, point1, {x: point1.x, y: point2.y});
    var distToTop = dist_point_to_segment(point, point1, {x: point2.x, y: point1.y});
    var distToRight = dist_point_to_segment(point, {x: point2.x, y: point1.y}, point2);
    var distToBottom= dist_point_to_segment(point, {x: point1.x, y: point2.y}, point2);
    return [distToBottom, distToLeft, distToRight, distToTop].reduce( (prev, current) => {return prev < current ? prev : current} , distToBottom);
}