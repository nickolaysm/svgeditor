/**
 * Набор элементарных системных обработчиков
 */
import {STOP_MOVE, START_MOVE, SELECT_CONNECTOR, SELECT_NODE, HIGHLIGHT_CONNECTOR, CONNECTOR_END_VISIBILITY} from '../const/actions'
import {NODE, CONNECTOR} from "../const/entity"
import {MOVE_NODE, MOVE_CONNECTOR} from "../const/actions"

import {stopMove, findNearestConnector, nearestConnectorTailName, findSelectedNode} from './subject'
import {computeConnectorEndVisibility} from "./subject";
import {computeHighlightConnector} from "./subject";
import {computeMovedNodes} from "./subject";
import {computeEnds} from "./subject";
import {computeMovedConnector} from "./subject";

/**
 * Событие на отжатие кнопки мыши
 */
export const mouseUp = () => {
    return (dispatcher, getState) => {
        var state = getState().svgImmutable;
        if(state.get('moveMode')) dispatcher( stopMove(state) );
    }
}

/**
 * Событие на нажатие кнопки мышки
 * @param point точка в которой произошло нажатие на кнопку мыши
 */
export const mouseDown = (point) => {
    return (dispatcher, getState) => {
        var state = getState().svgImmutable;
        //Необходимо найти по какому элементу щелкнули, был ли это коннектор или же нода
        var selectedConnector = findNearestConnector(state, point);
        var tail = null;
        var selectedNode = null;
        if(selectedConnector){
            tail = nearestConnectorTailName(state, selectedConnector, point);
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

/**
 * Операции во время перемещения мышки
 * @param point
 * @returns {function()}
 */

export const mouseMove = (point) => {
    console.log((new Date()).getMilliseconds(),"mouseMove action");
    return (dispatcher, getState) => {
        var state = getState().svgImmutable;
        console.log("Mouse position:", point);

        //Вычисляем близость к ноде и подсвечиваем ее концевики
        var ends = state.get('connectorEnd');
        var ends = computeConnectorEndVisibility(state, point);
        dispatcher({ type: CONNECTOR_END_VISIBILITY, ends: ends });

        //Если не в режиме перемещения, какой-нибудь сущности
        if(!state.get('moveMode')){
            //Выделяем коннектор если мышка близко к нему
            dispatcher({type: HIGHLIGHT_CONNECTOR, connectors: computeHighlightConnector(state, point) });
            return;
        }

        //мы в режиме перемещения
        if (state.getIn(['selected','type']) == NODE){
            //в режиме перемещения ноды
            console.log((new Date()).getMilliseconds());
            //Расчитываем координаты прорисовки ноды
            var nodes = computeMovedNodes(state, point);
            console.log((new Date()).getMilliseconds());
            //Расчитываем координаты прорисовки концевиков
            ends = computeEnds(state, ends, point);
            console.log((new Date()).getMilliseconds());
            dispatcher({type: MOVE_NODE, nodes: nodes, ends: ends });
        } else if(state.getIn(['selected','type']) == CONNECTOR){
            //в режиме перемещения коннектора

            //Расчитываем новые координаты коннектора
            var connectors = computeMovedConnector(state, point);
            dispatcher({type: MOVE_CONNECTOR, connectors: connectors});
        }

    }
}

export const domReady = (point) => {
    console.log('%%% EVENT domReady: ', point);
    return mouseMove(point);
}

