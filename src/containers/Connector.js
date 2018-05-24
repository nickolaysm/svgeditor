import React, { Component } from 'react'
import {computeEndLocation} from '../utils'
import {SELECT_DISTANCE} from '../const/connectors'
import {calculatePointArray} from "../utils/pathCalculator";
import d3 from "d3";
import {interPathHelper} from "../utils/pathCalculator";
import {ellipsePath} from "../utils/pathCalculator";
import {pathArrayToString} from "../utils/pathCalculator";
import {CONNECTOR_TYPE} from "../const/connectors";
import {CONNECTOR_TYPE_LINE} from "../const/connectors";
import {EDGE_TOP} from "../const/connectors";
import {CONNECTOR_TYPE_PATH} from "../const/connectors";
import {calculateCircleLinePointArray} from "../utils/pathCalculator";


export default class Connector extends Component {

    constructor() {
        super();
        this.state = {width: 2, edge:null, canDrag: false, arrowKey:0};
    }

    checkOnUpdate(nextProps){
        return (nextProps.connector != this.props.connector) || (nextProps.end1 != this.props.end1) || (nextProps.end2 != this.props.end2) || (nextProps.selected != this.props.selected);
    }

    createStateObject(connector, end1, end2, node1, node2, selected, state){
        // console.log("connector.get('end1').get('state')",connector.get('end1').get('state'), connector.toJS());
        // console.log("connector.get('end2').get('state')",connector.get('end2').get('state'), connector.toJS());
        var propName = ["1", "2"];
        var obj = {end1:end1, end2:end2, node1:node1, node2:node2};
        var locs = propName.map(name =>{
            var endName = "end"+name;
            // console.log("connector.get(endName).get('state')",endName, connector.get(endName).get('state'));
            if(connector.get(endName).get('state') == "DISCONNECTED") {
                return {
                    x: connector.getIn([endName, 'loc', 'x']),
                    y: connector.getIn([endName, 'loc', 'y']),
                    edge: EDGE_TOP
                }
            }else {
                return computeEndLocation(
                    obj[endName].get('edge'),
                    obj[endName].get('shiftLoc').toJS(),
                    obj["node" + name].get('loc').toJS(),
                    obj["node" + name].get('width'),
                    obj["node" + name].get('height'));
            }
        });
        

        // console.log("locs", locs);
        var arrowKey =  state.arrowKey < 10 ? "" + connector.get('id') +state.arrowKey+1 : "0";
        let result = {...connector.toJS(), end1:locs[0], end2:locs[1], arrowKey: arrowKey, selected: selected, isSameNode: node1 == node2 /*, end1Obj: end1.toJS(), end2Obj: end2.toJS()*/};
        return result;
    }
    
    componentWillMount(){
        this.setState(this.createStateObject(this.props.connector, this.props.end1, this.props.end2, this.props.node1, this.props.node2, this.props.selected , this.state))
    }
    
    componentWillReceiveProps(nextProps, nextState){
        if(this.checkOnUpdate(nextProps))
            this.setState(this.createStateObject(nextProps.connector, nextProps.end1, nextProps.end2, nextProps.node1, nextProps.node2, nextProps.selected, nextState))
    }

    shouldComponentUpdate(nextProps){
        return this.checkOnUpdate(nextProps);
    }

    handleClick(){
        console.log('===========Handle line click');
    }

    mouseDown(e){
        // var pt = this.refs.svg.createSVGPoint();
        // pt.x = e.clientX; pt.y = e.clientY;
        // var loc = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());
        //
        // if(this.distance(this.state.end1.x, this.state.end1.y, loc.x, loc.y) < SELECT_DISTANCE) {
        //   this.props.onSelect(this.state.id, "CONNECTOR", 1, 0, 0)
        //   this.props.startMove();
        // }
        // else if(this.distance(this.state.end2.x, this.state.end2.y, loc.x, loc.y) < SELECT_DISTANCE) {
        //   this.props.onSelect(this.state.id, "CONNECTOR", 2, 0, 0)
        //   this.props.startMove();
        // }
    }

    mouseOver(){
        /*
        var pt = this.refs.svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        var loc = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());

        console.log("mouseEnter()");
        if(this.distance(this.state.end1.x, this.state.end1.y, loc.x, loc.y) < SELECT_DISTANCE){
            this.setState({canDrag: true, width: 2, edge: 1});
        } else if(this.distance(this.state.end2.x, this.state.end2.y, loc.x, loc.y) < SELECT_DISTANCE) {
            this.setState({canDrag: true, width: 2, edge: 2});
        } else {
            this.setState({canDrag: false, width: 2, edge:null});
        }
        */

    }

    mouseOut(){
      //console.log("mouseLeave()");
      //this.setState({canDrag: false, width: 2, edge:null});
    }


    render() {
      //console.log('======== Connector render', this.state.end1, this.state.end2);
        var cursor = this.state.highlight  ? 'copy' : 'default';
        var stroke = this.state.highlight  ? 'rgb(100, 0, 255)' : 'rgb(255, 0,0)';
        stroke = this.state.selected ? 'rgb(100, 255, 0)' : stroke;
        var arrowColor  = this.state.highlight  ? 'rgb(100, 0, 255)' : 'rgb(255, 0,0)';
        //console.log('Connector state', this.state);
        var path = calculatePointArray({x: this.state.end1.x, y: this.state.end1.y, position: this.state.end1.edge}, {x: this.state.end2.x, y: this.state.end2.y, position: this.state.end2.edge});
        var lineFunction = null;
        if(this.state.isSameNode){
            path = calculateCircleLinePointArray({x: this.state.end1.x, y: this.state.end1.y, position: this.state.end1.edge}, {x: this.state.end2.x, y: this.state.end2.y, position: this.state.end2.edge});
            console.log("================ path:", path);
            lineFunction = d3.svg.line()
                .x( d => d.x )
                .y( d => d.y )
                .interpolate("linear");
        }

        if(CONNECTOR_TYPE === CONNECTOR_TYPE_PATH) {
            lineFunction = d3.svg.line()
                .x( d => d.x )
                .y( d => d.y )
                .interpolate("basis");
            //.interpolate("linear");
        }

      return (
          <svg ref='svg' style={{cursor:cursor}}>
            <defs>
                <marker id='markerBegin' markerWidth='6' markerHeight='6' refX='-10' refY='2' orient='auto'>
                    <circle cx='2' cy='2' r='2' style={{stroke: 'none', fill:'#000000'}}/>
                </marker>

                <marker id={"Arrow"+this.state.id} key={this.state.arrowKey}
                       markerWidth='6' markerHeight='6' viewBox='-3 -3 6 6'
                       refX='2' refY='0'
                       markerUnits='strokeWidth' orient='auto'>
                  <polygon key={this.state.arrowKey} points='-1,0 -3,3 3,0 -3,-3' fill={arrowColor}/>
                </marker>

            </defs>
              { CONNECTOR_TYPE === CONNECTOR_TYPE_LINE
                   ? ( this.state.isSameNode
                            ? <path id={"connector_path_"+this.state.id} d={lineFunction(path)} stroke={stroke} fill={'none'} style={{strokeWidth:'2px'}}  markerEnd={'url(#Arrow'+this.state.id+')'}/>
                            : <line markerEnd={'url(#Arrow'+this.state.id+')'} markerStart='url(#markerBegin)' x1={this.state.end1.x} y1={this.state.end1.y} x2={this.state.end2.x} y2={this.state.end2.y} stroke={stroke} fill={stroke} style={{strokeWidth:'2px'}} />
                     )
                   : <path id={"connector_path_"+this.state.id} d={lineFunction(path)} stroke={stroke} fill={'none'} style={{strokeWidth:'2px'}}  markerEnd={'url(#Arrow'+this.state.id+')'}/>
              }
          </svg>
      )
    }

}

