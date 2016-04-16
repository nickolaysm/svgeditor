import React, { Component } from 'react'
import {computeEndLocation} from '../utils'

const SELECT_DISTANCE = 20

export default class Connector extends Component {

    constructor() {
        super();
        this.state = {width: 2, edge:null};
    }

    createStateObject(connector, end1, end2, node1, node2){
        var end1Loc = computeEndLocation(end1.get('edge'), end1.get('shiftLoc').toJS(), node1.get('loc').toJS(), node1.get('width'), node1.get('height') );
        var end2Loc = computeEndLocation(end2.get('edge'), end2.get('shiftLoc').toJS(), node2.get('loc').toJS(), node2.get('width'), node2.get('height') );
        return {...connector.toJS(), end1:end1Loc, end2:end2Loc}
    }
    
    componentWillMount(){
        this.setState(this.createStateObject(this.props.connector, this.props.end1, this.props.end2, this.props.node1, this.props.node2))  
    }
    
    componentWillReceiveProps(nextProps){
        this.setState(this.createStateObject(nextProps.connector, nextProps.end1, nextProps.end2, nextProps.node1, nextProps.node2))
    }

    handleClick(){
        console.log('===========Handle line click');
    }

    distance(x1, y1, x2, y2){
        return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    }

    mouseDown(e){
        //var x = e.clientX; var y = e.clientY;
        //var x1 = this.props.x1; var x2 = this.props.x2; var y1 = this.props.y1; var y2 = this.props.y2;
        //var a = y2 - y1;
        //var b = x1 - x2;
        //var c = x1*(y1-y2) + y1*(x2-x1);
        //var fun = a*x + b*y + c;
        //var D = (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
        //var d = Math.abs(a*x + b*y +c)/Math.sqrt(a*a + b*b);
        //console.log('Connector mouseDown',e, e1, e2, e.clientX, e.clientY, 'line res: ', a,'*(',x,')+',b,'*(',y,')+',c,'=',fun, 'D=',D, 'd=', d);
        var pt = this.refs.svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        var loc = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());
        //d = Math.abs(a*loc.x + b*loc.y +c)/Math.sqrt(a*a + b*b);
        //console.log('Connector mouseDown after transform','d=', d);

        if(this.distance(this.props.x1, this.props.y1, loc.x, loc.y) < SELECT_DISTANCE) {
          this.props.onSelect(this.props.id, "CONNECTOR", 1, 0, 0)
          this.props.startMove();
        }
        else if(this.distance(this.props.x2, this.props.y2, loc.x, loc.y) < SELECT_DISTANCE) {
          this.props.onSelect(this.props.id, "CONNECTOR", 2, 0, 0)
          this.props.startMove();
        }
    }

    mouseOver(e){
        var pt = this.refs.svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        var loc = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());

        console.log("mouseEnter()");
        if(this.distance(this.props.x1, this.props.y1, loc.x, loc.y) < SELECT_DISTANCE){
            this.setState({width: 4, edge: 1});
        } else if(this.distance(this.props.x2, this.props.y2, loc.x, loc.y) < SELECT_DISTANCE) {
            this.setState({width: 4, edge: 2});
        } else {
            this.setState({width: 2, edge:null});
        }

    }

    mouseOut(){
      console.log("mouseLeave()");
      this.setState({width: 2, edge:null});
    }

  
    render() {
        console.log('+++ connector render', this.state.end1, this.state.end2);

        return (
          <svg ref='svg'>
            <line onMouseOver={::this.mouseOver} onMouseMove={::this.mouseOver} onMouseOut={::this.mouseOut}  onClick={this.handleClick} onMouseDown={::this.mouseDown} x1={this.state.end1.x} y1={this.state.end1.y} x2={this.state.end2.x} y2={this.state.end2.y} style={{fillOpacity:'0',strokeOpacity:'0', strokeWidth:'30', stroke:'blue', fill:'red', strokeLinecap:'round'}} />
            <line onMouseOver={::this.mouseOver} onMouseOut={::this.mouseOut} onMouseDown={::this.mouseDown} x1={this.state.end1.x} y1={this.state.end1.y} x2={this.state.end2.x} y2={this.state.end2.y} style={{stroke:'rgb(255, 0,0)',strokeWidth:this.state.width}} />
          </svg>
        )
    }


}
