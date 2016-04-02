import React, { Component } from 'react'

const SELECT_DISTANCE = 20

export default class Connector extends Component {

    constructor() {
        super();
        this.state = {width: 2, edge:null};
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
        console.log('+++ connector render', this.props.x1, this.props.y1, this.props.x2, this.props.y2);
        var circle = null;
        //if(this.state.edge != null)
        //    circle = this.state.edge == 1
        //        ? <circle cx={this.props.x1} cy={this.props.y1} r={SELECT_DISTANCE} fill='blue'/>
        //        : <circle cx={this.props.x2} cy={this.props.y2} r={SELECT_DISTANCE} fill='blue'/>;

        return (
          <svg ref='svg'>
              {circle}
            <line onMouseOver={::this.mouseOver} onMouseMove={::this.mouseOver} onMouseOut={::this.mouseOut}  onClick={this.handleClick} onMouseDown={::this.mouseDown} x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} style={{fillOpacity:'0',strokeOpacity:'0', strokeWidth:'30', stroke:'blue', fill:'red', strokeLinecap:'round'}} />
            <line onMouseOver={::this.mouseOver} onMouseOut={::this.mouseOut} onMouseDown={::this.mouseDown} x1={this.props.x1} y1={this.props.y1} x2={this.props.x2} y2={this.props.y2} style={{stroke:'rgb(255, 0,0)',strokeWidth:this.state.width}} />
          </svg>
        )
    }


}
