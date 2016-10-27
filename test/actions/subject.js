/**
 * Created by nsmirnov on 07.06.2016.
 */
import React from 'react'
import expect from 'expect'
import assert from 'assert'
import {INIT_DATA} from '../../src/const/data'
import Immutable from 'immutable'
import {findSelectedNode, findNearestConnector, isNearConnectorTail, distanceToNode, computeConnectorEndVisibility} from '../../src/actions/subject'
import {getEndByID} from "../../src/actions/utils";


describe('Action. Предметные обработчики.', function(){

    before('Создание иммутабельной модели', function() {
        this.initState = Immutable.fromJS(INIT_DATA);
    });

    it('Проверка клика по ноде findSelectedNode', function() {
        //expect(dist_point_to_segment({x:1,y:1},{x:1,y:2}, {x:2,y:3})).toBe(2);
        assert.equal(findSelectedNode(this.initState, {x:20,y:20}) , this.initState.get('nodes').get(0));
    });

    it('Нахождение ближайшего коннектора findNearestConnector', function(){
        var connector1 = findNearestConnector( this.initState, {x:80,y:105});
        assert.equal( connector1 , this.initState.getIn(['connectors',0]) );
        var connector2 = findNearestConnector( this.initState, {x:80,y:120});
        assert.equal( connector2, this.initState.getIn(['connectors',1]) );
    });

    it('Находится ли точка близко к концу коннектора isNearConnectorTail', function(){
        var point = {x:80,y:105};
        var connector1 = findNearestConnector( this.initState, point);
        assert.equal( isNearConnectorTail(this.initState, connector1, point) ,  this.initState.getIn(['connectorEnd',0]) );
        //getEndByID(this.initState, connector1.getIn(['end1', 'connectorEnd']))
    })

    it('Расстояние до ноды. distanceToNode', function(){
        var point = {x:140, y:105};
        assert.equal( distanceToNode(point, this.initState.getIn(['nodes',0])), 10);
    })

    it('Проверка подсветки концевиков. computeConnectorEndVisibility', function(){
        //TODO: тоже стоило бы написать
        // var connectorEnd = computeConnectorEndVisibility(this.initState, {x:80,y:105});
        // assert.equal(connectorEnd, null);
    })
});