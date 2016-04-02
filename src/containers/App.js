import React, { Component } from 'react'
import Element from './Element';
import Connector from './Connector';
import Node from './Node';

export default class App extends Component {

  constructor() {
	var coords = [];
	for(var i=0; i<=100; i++){
		coords.push({id: i, x : 50 + Math.random()*300, y: 50 + Math.random()*300});
	}
	super();
	this.state = {mouseX:0, mouseY:0, inMove: false, selected:undefined, elementsCoord:coords, connector: [{id1:1, id2:2},{id1:3, id2:4},{id1:5, id2:4}]};
  }
  

  handlerSVG(){
    console.log('click on svg');
  }

  HandlerMove(e){
    this.setState({mouseX : e.clientX, mouseY : e.clientY});
  }

  mouseUp(){
	console.log('= mouseUp svg');
	this.setState({inMove:false});
  }

  mouseDown(){
	console.log('= mouseDown svg');
	this.setState({inMove:true});
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextState.inMove || (nextState.inMove != this.state.inMove) || (nextState.selected != this.state.selected);
  }  

  onSelect(id){
	this.setState({selected:id})
  }

  onChangeCoord(id, x, y){
	this.state.elementsCoord[id].x = x;
	this.state.elementsCoord[id].y = y;
	console.log('App onChangeCoord', this.state);
	//this.setState({elementsCoord: this.state.elementsCoord});
	this.forceUpdate();
  }
  
  render() {
	console.log('render, selected:', this.state.selected);
	var elements = this.state.elementsCoord.map(element => <Element key={element.id} id={element.id} x={element.x} y={element.y} inMove={this.state.inMove} selected={element.id === this.state.selected} onSelect={::this.onSelect} mouseX={this.state.mouseX} mouseY={this.state.mouseY} onChangeCoord={::this.onChangeCoord}/>)

	var connector = this.state.connector.map(connector => <Connector x1={this.state.elementsCoord[connector.id1].x} y1={this.state.elementsCoord[connector.id1].y} x2={this.state.elementsCoord[connector.id2].x} y2={this.state.elementsCoord[connector.id2].y} />)

    return (
      <svg width={'400px'} height={'400px'} onClick={this.handlerSVG} onMouseMove={::this.HandlerMove} onMouseUp={::this.mouseUp} onMouseDown={::this.mouseDown}>
		{connector}
		{elements}
		<Node/>
      </svg>
    )
  }

}