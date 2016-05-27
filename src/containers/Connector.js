import React, { Component } from 'react'
import {computeEndLocation} from '../utils'
import {SELECT_DISTANCE} from '../const/connectors'


export default class Connector extends Component {

    constructor() {
        super();
        this.state = {width: 2, edge:null, canDrag: false, arrowKey:0};
    }

    createStateObject(connector, end1, end2, node1, node2, state){
        // console.log("connector.get('end1').get('state')",connector.get('end1').get('state'), connector.toJS());
        // console.log("connector.get('end2').get('state')",connector.get('end2').get('state'), connector.toJS());
        var propName = ["1", "2"];
        var obj = {end1:end1, end2:end2, node1:node1, node2:node2};
        var locs = propName.map(name =>{
            var endName = "end"+name;
            // console.log("connector.get(endName).get('state')",endName, connector.get(endName).get('state'));
            return connector.get(endName).get('state') == "DISCONNECTED" 
                ? { x: connector.getIn([endName,'loc','x']), y: connector.getIn([endName,'loc','y']) }
                : computeEndLocation(obj[endName].get('edge'), obj[endName].get('shiftLoc').toJS(), obj["node"+name].get('loc').toJS(), obj["node"+name].get('width'), obj["node"+name].get('height') );
        })
        

        // console.log("locs", locs);
        var arrowKey =  state.arrowKey < 10 ? "" + connector.get('id') +state.arrowKey+1 : "0";
        return {...connector.toJS(), end1:locs[0], end2:locs[1], arrowKey: arrowKey}
    }
    
    componentWillMount(){
        this.setState(this.createStateObject(this.props.connector, this.props.end1, this.props.end2, this.props.node1, this.props.node2, this.state))  
    }
    
    componentWillReceiveProps(nextProps, nextState){
        this.setState(this.createStateObject(nextProps.connector, nextProps.end1, nextProps.end2, nextProps.node1, nextProps.node2, nextState))
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

        if(this.distance(this.state.end1.x, this.state.end1.y, loc.x, loc.y) < SELECT_DISTANCE) {
          this.props.onSelect(this.state.id, "CONNECTOR", 1, 0, 0)
          this.props.startMove();
        }
        else if(this.distance(this.state.end2.x, this.state.end2.y, loc.x, loc.y) < SELECT_DISTANCE) {
          this.props.onSelect(this.state.id, "CONNECTOR", 2, 0, 0)
          this.props.startMove();
        }
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

    //TODO: Продумать как производить выделение коннектора
    render() {
      //console.log('+++ connector render', this.state.end1, this.state.end2);
      var cursor = this.state.highlight  ? 'copy' : 'default';
      var stroke = this.state.highlight  ? 'rgb(100, 0, 255)' : 'rgb(255, 0,0)';
      var arrowColor  = this.state.highlight  ? 'rgb(100, 0, 255)' : 'rgb(255, 0,0)';
      //var width = this.state.selected ? 4 : 2;
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
              {/*<line onMouseOver={::this.mouseOver} onMouseMove={::this.mouseOver} onMouseOut={::this.mouseOut}  onClick={this.handleClick} onMouseDown={::this.mouseDown} x1={this.state.end1.x} y1={this.state.end1.y} x2={this.state.end2.x} y2={this.state.end2.y} style={{fillOpacity:'0',strokeOpacity:'0', strokeWidth:'30', stroke:'blue', fill:'red', strokeLinecap:'round'}} /> */}
            <line onClick={this.handleClick} onMouseDown={::this.mouseDown} x1={this.state.end1.x} y1={this.state.end1.y} x2={this.state.end2.x} y2={this.state.end2.y} style={{fillOpacity:'0',strokeOpacity:'0', strokeWidth:'30', stroke:'blue', fill:'red', strokeLinecap:'round'}} />
            <line markerEnd={'url(#Arrow'+this.state.id+')'} markerStart='url(#markerBegin)' onMouseOver={::this.mouseOver} onMouseOut={::this.mouseOut} onMouseDown={::this.mouseDown} x1={this.state.end1.x} y1={this.state.end1.y} x2={this.state.end2.x} y2={this.state.end2.y} stroke={stroke} fill={stroke} style={{strokeWidth:'2px'}} />
          </svg>
      )
    }

}

//<line onMouseOver={::this.mouseOver} onMouseMove={::this.mouseOver} onMouseOut={::this.mouseOut}  onClick={this.handleClick} onMouseDown={::this.mouseDown} x1={this.state.end1.x} y1={this.state.end1.y} x2={this.state.end2.x} y2={this.state.end2.y} style={{fillOpacity:'0',strokeOpacity:'0', strokeWidth:'30', stroke:'blue', fill:'red', strokeLinecap:'round'}} />