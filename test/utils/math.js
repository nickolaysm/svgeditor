import React from 'react';
import expect from 'expect';
import assert from 'assert';

import {dist_point_to_segment, point_in_box, dist_point_to_box} from '../../src/utils/math';


describe('Тестирование библиотеки math', function(){

    before('render and locate element', function() {
        this.eps = 10e-8;
    });

    it('Расстояние от точки до сегмента. dist_point_to_segment', function() {
        //expect(dist_point_to_segment({x:1,y:1},{x:1,y:2}, {x:2,y:3})).toBe(1);
        assert.equal(dist_point_to_segment({x:1,y:1},{x:1,y:2}, {x:2,y:3}), 1);
    });

    it('Точка внутри прямоугольника point_in_box', function(){
        assert(point_in_box({x:20, y:20}, {x:10, y:10}, {x:120, y:120}), "точка должна быть в прямоугольнике");
    });

    it('Расстояние от точки до прямоугольника dist_point_to_box', function() {
        assert.equal(dist_point_to_box({x:20, y:20}, {x:10, y:10}, {x:120, y:120}), 0, "Точка внутри прямоугольника");

        assert.equal(dist_point_to_box({x:0, y:20}, {x:10, y:10}, {x:120, y:120}), 10, "Точка слева от прямоугольника");

        assert.equal(dist_point_to_box({x:130, y:20}, {x:10, y:10}, {x:120, y:120}), 10, "Точка справа от прямоугольника");

        assert(dist_point_to_box({x:130, y:130}, {x:10, y:10}, {x:120, y:120}) - Math.sqrt(10*10 + 10*10) < this.eps );
    });
    //
    // it('sidebar toggle should exist', function() {
    //     expect(this.sidebarToggle).toExist();
    // });
    //
    // it('clicking sidebar toggle should open sidebar', function() {
    //     expect(this.wrapper.getAttribute('class')).toBe('wrapper');
    //     TestUtils.Simulate.click(this.sidebarToggle);
    //     expect(this.wrapper.getAttribute('class')).toBe('wrapper open');
    // });
    //
});