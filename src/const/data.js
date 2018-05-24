import {EDGE_TOP, EDGE_BOTTOM, EDGE_LEFT, EDGE_RIGHT} from '../const/connectors'
import {/*DISCONNECTED, */CONNECTED} from '../const/connectors'
import {BASE_NODE_WIDTH} from "./entity";
import {BASE_NODE_HEIGHT} from "./entity";


var init_data = {
    //сохраненное состояние до начала некоторого действия, которое мы можем вернуть, если дествие отмениться
    oldState: null,
    //струткура в которой накапливаются изменения
    accumulateChanges: null,
    //Текущее состояние системы, на основе которого строится интерфейс
    currentState: {
        //флаг говорящий о том, что мы находимся в режиме перемещения какой-либо сущности
        moveMode: false,
        //Информация о том, какая сущность сейчас активна.
        //"id - идентификатор выделенного узла или коннектора, type - либо NODE, либо CONNECTOR - тип выделенного узла, tail - в случае коннектора, за какой конец тащим 1 или 2",
        selected: {id: 1, type: "NODE", tail: null},
        //Дополнительная информация о смещении мышки относительно координат отсета прорисовки сущности, если мы схватили эту сущность для перетаскивания (по сути поправка).
        shiftLoc: {x: undefined, y: undefined},
        //Узлы/вершины
        nodes: [
            //{id:"Уникальный идентификаотр узла", cord:"Координаты верхнего левого угла", width:"Ширина узла", height:"Высота узла", ConnectorEnd:[{edge:EDGE_BOTTOM, shiftX: 0, shiftY:0}]},
            {id: 0, loc: {x: 10, y: 10}, width: 120, height: 100, caption: 'Узел 0', value: 'Статус'},
            {id: 1, loc: {x: 270, y: 70}, width: 120, height: 100, caption: 'Узел 1', value: 'Статус'},
            {id: 2, loc: {x: 50, y: 200}, width: 120, height: 100, caption: 'Узел 2', value: 'Статус'}
        ],
        //Точки для присоединения, каждая точка принадлежит какой-то node и одной из ее граней
        //Так же можно указать смещение по оси X и Y оносительно центра грани. Если shiftX: 0, shiftY:0 - то точка будет находится ровно по середине грани
        connectorEnd: [
            {id: 0, node: 0, edge: EDGE_BOTTOM, shiftLoc: {x: 0, y: 0}, visible: true, opacity: 1.0},
            {id: 1, node: 0, edge: EDGE_RIGHT, shiftLoc: {x: 0, y: 0}, visible: true, opacity: 1.0},
            {id: 6, node: 0, edge: EDGE_RIGHT, shiftLoc: {x: 0, y: 10}, visible: true, opacity: 1.0},
            {id: 2, node: 1, edge: EDGE_TOP, shiftLoc: {x: 0, y: 0}, visible: false, opacity: 0.0},
            {id: 3, node: 1, edge: EDGE_LEFT, shiftLoc: {x: 0, y: 0}, visible: false, opacity: 0.0},
            {id: 7, node: 1, edge: EDGE_RIGHT, shiftLoc: {x: 0, y: 0}, visible: false, opacity: 0.0},
            {id: 4, node: 2, edge: EDGE_TOP, shiftLoc: {x: 0, y: 0}, visible: false, opacity: 0.0},
            {id: 5, node: 2, edge: EDGE_RIGHT, shiftLoc: {x: 0, y: 0}, visible: false, opacity: 0.0}
        ],
        //Линии указывающие связь между узлами/вершинами
        //end1 - описание к чему привязан один из концов коннектора.
        //state - прикреплен ли конец коннектора или его перетаскивают
        //connectorEnd - идентификатор точки к которой прикреплен коннектор
        //loc - в случае когда state:DISCONNECTED содержит координаты, где сейчас конец коннектора (когда перетаскивают)
        //highlight - означает, что мышка достаточно близко, что бы выделить этот объект
        connectors: [
            {
                id: 0,
                end1: {state: CONNECTED, connectorEnd: 0, loc: null},
                end2: {state: CONNECTED, connectorEnd: 3, loc: null},
                path: null,
                highlight: false
            },
            {
                id: 1,
                end1: {state: CONNECTED, connectorEnd: 0, loc: null},
                end2: {state: CONNECTED, connectorEnd: 4, loc: null},
                path: null,
                highlight: false
            },
            {
                id: 2,
                end1: {state: CONNECTED, connectorEnd: 0, loc: null},
                end2: {state: CONNECTED, connectorEnd: 7, loc: null},
                path: null,
                highlight: false
            },
            {
                id: 3,
                end1: {state: CONNECTED, connectorEnd: 1, loc: null},
                end2: {state: CONNECTED, connectorEnd: 2, loc: null},
                path: null,
                highlight: false
            }

        ]
    }

}


const generateINITDATA = () =>{
    let data = init_data.currentState;
    //return data;
    for(var i=5; i<100; i++){
        var newObj = {id: i, loc:{x:50+i*10 , y: 200+i*10}, width: BASE_NODE_WIDTH, height:BASE_NODE_HEIGHT, caption: 'Узел '+i, value: 'Статус'};
        data.nodes.push(newObj);
        var newConnectorEnd = {id:i+10, node: i, edge:EDGE_BOTTOM, shiftLoc:{x: 0, y:0}, visible: true , opacity: 1.0 };
        var newConnectorEnd2 = {id:i+2000, node: i, edge:EDGE_TOP, shiftLoc:{x: 0, y:0}, visible: true , opacity: 1.0 };
        var newConnectorEnd3 = {id:i+3000, node: i, edge:EDGE_LEFT, shiftLoc:{x: 0, y:0}, visible: true , opacity: 1.0 };
        var newConnectorEnd4 = {id:i+4000, node: i, edge:EDGE_RIGHT, shiftLoc:{x: 0, y:0}, visible: true , opacity: 1.0 };
        data.connectorEnd.push(newConnectorEnd);
        data.connectorEnd.push(newConnectorEnd2);
        data.connectorEnd.push(newConnectorEnd3);
        data.connectorEnd.push(newConnectorEnd4);
        var newConnector = {id:5+i, end1:{state:CONNECTED, connectorEnd: 0, loc: null}, end2:{state:CONNECTED, connectorEnd: i+10, loc:null}, highlight: false };
        data.connectors.push(newConnector);
    }
    return data;
}

//Инициализирующие тестовые данные
init_data.currentState = generateINITDATA();
init_data.accumulateChanges = init_data.currentState;
export const INIT_DATA =   init_data;// generateINITDATA();