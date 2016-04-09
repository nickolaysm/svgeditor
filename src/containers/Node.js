import React, { Component } from 'react'
import {evalConnectorCoordByEdge, getEndsCoordinate} from '../utils'

export default class Node extends Component {

  constructor() {
    super();
    this.state = {x : 50, y : 50, width: 120, height: 100};
  }

  componentWillMount (){
    this.setState({id: this.props.id, x : this.props.x, y : this.props.y, caption: this.props.caption, value: this.props.value, width: this.props.width, height: this.props.height});
  }

  componentWillReceiveProps( nextProps ) {
    this.setState({x : nextProps.x, y : nextProps.y, caption: nextProps.caption, value: nextProps.value, width: nextProps.width, height: nextProps.height});
  }  

  mouseDown(e){
    console.log('mouseDown', e);
    var pt = this.refs.svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    var loc = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());

    //this.props.onSelect(this.state.id, "NODE", null, e.clientX - this.state.x, e.clientY - this.state.y);
    this.props.onSelect(this.state.id, "NODE", null, loc.x - this.state.x, loc.y - this.state.y);
    this.props.startMove();
  }
  
  calculateConnectorEndCoord(node, edge){
    return evalConnectorCoordByEdge(node, edge)
  }
  
  createConnectorEnd(){
    if(! this.props.showConnectorEndOnEdge) return null;
    var cid = this.calculateConnectorEndCoord(this.getNode(), this.props.showConnectorEndOnEdge);
    return (
      <circle cx={cid.x} cy={cid.y} r={5} fill='blue'/>
    );
  }
  
  getNode(){
    return {x: this.state.x, y: this.state.y, width: this.state.width, height: this.state.height};
  }
  
  /**
   * Отображаем возможные места для подключения коннекторов 
   */
  showConnectorEnd(){
    if(! this.props.showConnectorEnd ) return null;
    return this.props.visibleConnectorEnd.map(ends => {
      var cid = getEndsCoordinate(this.getNode(), ends);
      return <circle cx={cid.x} cy={cid.y} r={3} fill='blue'/>
    });
  }

  render() {
    //console.log('=== render Node', this.state);
    var width = this.state.width;
    var height = this.state.height;
    var headerShift = 20;
    var headerHeight = headerShift + 10;
    var baseShift = headerHeight + 25;
    var headerColor = this.props.selected ? 'red' : 'white';
    
    var connectorEnd = this.createConnectorEnd();
    
    return (
      <svg ref='svg' onMouseDown={::this.mouseDown}>
        <rect fill={'blue'} fillOpacity={0.5} x={this.state.x} y={this.state.y} width={width} height={height} rx='10' ry='10'/>
        <text style={{userSelect:'none'}} textAnchor={'middle'} fill={headerColor} x={this.state.x+width/2} y={this.state.y+headerShift}>{this.state.caption}</text>
        <line x1={this.state.x} y1={this.state.y+headerHeight} x2={this.state.x+width} y2={this.state.y+headerHeight} style={{stroke:'rgb(255,255,255)',strokeWidth:'2'}} />
        <text textAnchor={'middle'} fill={'white'} x={this.state.x+width/2} y={this.state.y+baseShift}>{this.state.value}</text>
        {connectorEnd}
        {this.showConnectorEnd()}
      </svg>
    )
  }

}
