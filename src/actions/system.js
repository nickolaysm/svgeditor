/**
 * Набор элементарных системных обработчиков
 */
import {STOP_MOVE, START_MOVE, SELECT_CONNECTOR, SELECT_NODE, HIGHLIGHT_CONNECTOR, CONNECTOR_END_VISIBILITY} from '../const/actions'
import {NODE, CONNECTOR} from "../const/entity"
import {MOVE_NODE, MOVE_CONNECTOR} from "../const/actions"
import {HIGHLIGHT} from "../const/actions";
import {FRAME_READY} from "../const/actions";

import {stopMove, findNearestConnector, nearestConnectorTailName, findSelectedNode} from './subject'
import {computeConnectorEndVisibility} from "./subject";
import {highlightElements} from "./subject";
import {computeMovedNodes} from "./subject";
import {computeEnds} from "./subject";
import {computeMovedConnector} from "./subject";
import {findNearestConnectorOrSelected} from "./subject";
import {BASE_NODE_WIDTH} from "../const/entity";
import {BASE_NODE_HEIGHT} from "../const/entity";
import Immutable from 'immutable';
import {ADD_NODE} from "../const/actions";

/**
 * Событие на отжатие кнопки мыши
 */
export const mouseUp = () => {
    return (dispatcher, getState) => {
        //var state = getState().svgImmutable.get('currentState');
        var state = getState().svgImmutable.get('accumulateChanges');
        if(state.get('moveMode')) dispatcher( stopMove(state) );
    }
}

/**
 * Событие на нажатие кнопки мышки
 * @param point точка в которой произошло нажатие на кнопку мыши
 */
export const mouseDown = (point) => {
    return (dispatcher, getState) => {
        //var state = getState().svgImmutable.get('currentState');
        var state = getState().svgImmutable.get('accumulateChanges');
        state.json = {
            nodes: convertToIdMap(state.get('nodes')),
            connectorEnd: convertToIdMap(state.get('connectorEnd')),
            connectors: convertToIdMap(state.get('connectors'))
        };

        //Необходимо найти по какому элементу щелкнули, был ли это коннектор или же нода
        var ms = (new Date()).getTime();
        var selectedConnector = findNearestConnectorOrSelected(state, point);
        console.log("--- mouseDown findNearestConnectorOrSelected",(new Date()).getTime() - ms);
        var tail = null;
        var selectedNode = null;
        if(selectedConnector){
            tail = nearestConnectorTailName(state, selectedConnector, point);
            ////TODO: тут что-то не так с логикой, нужно сделать так что бы если точка подключения близко, то мы брали уже выделенный коннектор, если точки подключения нет близко , то берем ближайший коннекотр
            if(tail == null) selectedConnector = findNearestConnector(state, point);
            dispatcher({type: SELECT_CONNECTOR, connector: selectedConnector, mousePosition: point, tail: tail});
        } else {
            selectedNode = findSelectedNode(state, point);
            if(selectedNode) {
                dispatcher({type: SELECT_NODE, node: selectedNode, mousePosition: point});
            }
        }

        //Если нашли кого выделить, то устанавливаем, что можно начать перетаскивать
        if(tail || selectedNode) {
            dispatcher({type: START_MOVE, mousePosition: point});
        }

    }
}

const convertToIdMap = (immutableList) =>{
    var map = {};
    for(var i=0; i<immutableList.size; i++){
        let element = immutableList.get(i);
        map[element.get("id")] = element;
    }
    return map;
}

/**
 * Операции во время перемещения мышки
 * @param point
 * @returns {function()}
 */

export const mouseMove = (point) => {
    //console.log((new Date()).getMilliseconds(),"mouseMove action");
    return (dispatcher, getState) => {
        var start = (new Date()).getTime();
        //var state = getState().svgImmutable.get('currentState');
        var state = getState().svgImmutable.get('accumulateChanges');
        state.json = {
            nodes: convertToIdMap(state.get('nodes')),
            connectorEnd: convertToIdMap(state.get('connectorEnd')),
            connectors: convertToIdMap(state.get('connectors'))
        };

        //console.log("Mouse position:", point);

        //Вычисляем близость к ноде и подсвечиваем ее концевики
        var ends = state.get('connectorEnd');
        if(!state.get('moveMode') || ( state.get('moveMode') && state.getIn(['selected','type']) != NODE) ) {
            var start = (new Date()).getTime();
            var ends = computeConnectorEndVisibility(state, point);
            //console.log("computeConnectorEndVisibility time", (new Date()).getTime() - start );
            dispatcher({type: CONNECTOR_END_VISIBILITY, ends: ends});
        }

        //Если не в режиме перемещения, какой-нибудь сущности
        if(!state.get('moveMode')){
            //Выделяем элемент (коннектор или ноду) если мышка близко к нему или на нем
            var start = (new Date()).getTime();
            let highlights = highlightElements(state, point);
            //console.log("highlightElements time", (new Date()).getTime() - start );
            //dispatcher({type: HIGHLIGHT_CONNECTOR, connectors: computeHighlightConnector(state, point) });
            dispatcher({type: HIGHLIGHT, connectors: highlights.connectors, nodes: highlights.nodes });
            console.log("====== mouseMove", (new Date()).getTime() - start );
            return;
        }

        //мы в режиме перемещения
        if (state.getIn(['selected','type']) == NODE){
            //в режиме перемещения ноды
            //console.log((new Date()).getMilliseconds());
            //Расчитываем координаты прорисовки ноды
            var nodes = computeMovedNodes(state, point);
            //console.log((new Date()).getMilliseconds());
            //Расчитываем координаты прорисовки концевиков
            ends = computeEnds(state, ends, point);
            //console.log((new Date()).getMilliseconds());
            dispatcher({type: MOVE_NODE, nodes: nodes, ends: ends });
        } else if(state.getIn(['selected','type']) == CONNECTOR){
            //в режиме перемещения коннектора

            //Расчитываем новые координаты коннектора
            var connectors = computeMovedConnector(state, point);
            dispatcher({type: MOVE_CONNECTOR, connectors: connectors});
        }
        console.log("====== mouseMove", (new Date()).getTime() - start );
    }
}

/**
 * Событие срабатывает на запрос по перерисовке на window.requestAnimationFrame
 * @param point
 * @returns {{type}}
 */
export const domReady = (point) => {

    return {type:FRAME_READY};
}

/**
 * Событие на добавление нового узла
 */
export const addNode = (location, caption, value, width, height) => {
    return (dispatcher, getState) => {
        let state = getState().svgImmutable.get('accumulateChanges');
        let newId = 1;
        state.get('nodes').forEach(node => {
            console.log(node.get('id'));
            if(node.get('id') >= newId){
                newId = node.get('id') + 1;
            }
        });
        let nodes = state.get('nodes').push(Immutable.fromJS(
            {
                id: newId,
                loc: location,
                caption: caption,
                value: value,
                width: width,
                height: height
            }
        ));
        dispatcher({type: ADD_NODE, nodes: nodes });
    }
}

export const addNodeSimple = (caption, value) => {
    return addNode({x:10, y:10}, caption, value, BASE_NODE_WIDTH, BASE_NODE_HEIGHT);
    return null;
}

