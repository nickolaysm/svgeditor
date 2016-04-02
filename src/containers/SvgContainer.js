import React, { Component } from 'react'
import Node from './Node'
import Connector from './Connector'
import { connect } from 'react-redux'
import { selectNode, startMove, stopMove, mouseMove } from '../actions'
//import {DevTools} from './DevTools'

class Svg extends Component {

  mouseDown(){
    //this.props.startMove();
  }

  mouseUp(){
    this.props.stopMove();
  }

  mouseMove(e){
    //console.log('Svg mouseMove');
    var pt = this.refs.svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    var loc = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());
    this.props.mouseMove(loc.x, loc.y);
  }


  render() {    
    //console.log('render SVG');
    var nodes = this.props.nodes.map(node =>
        //<Node key={node.id} id={node.id} x={node.x} y={node.y} caption={node.caption} value={node.value} width={node.width} height={node.height} selected={this.props.selected.type == "NODE" && this.props.selected.id === node.id} onSelect={this.props.onSelect} startMove={this.props.startMove}/>);
        <Node key={node.id} {...node} selected={this.props.selected.type == "NODE" && this.props.selected.id === node.id} onSelect={this.props.onSelect} startMove={this.props.startMove}/>);
    //var connectors = this.props.connectors.map(connector =>
    //    <Connector key={connector.id} id={connector.id}
    //               x1={this.props.nodes[connector.node1.id].x} y1={this.props.nodes[connector.node1.id].y}
    //               x2={this.props.nodes[connector.node2.id].x} y2={this.props.nodes[connector.node2.id].y}
    //               onSelect={this.props.onSelect} startMove={this.props.startMove}/>);
    var connectors = this.props.connectors.map(connector =>{
        //console.log("+++++++ connector", connector);
        return (<Connector key={connector.id} id={connector.id}
                   x1={connector.cid1.x} y1={connector.cid1.y}
                   x2={connector.cid2.x} y2={connector.cid2.y}
                   onSelect={this.props.onSelect} startMove={this.props.startMove}/>)
    });

    var style = {WebkitUserSelect: 'none',  userSelect: 'none'};
    return (
      <div style={{padding:0, margin:0, bodredWidth:0}}>
        <svg  ref="svg" width='500px' height='500px' onMouseDown={::this.mouseDown} onMouseUp={::this.mouseUp} onMouseMove={::this.mouseMove} style={style}>
          {connectors}
          {nodes}
        </svg>
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  //console.log('state', state);
  return {
    nodes: state.svg.nodes,
    connectors: state.svg.connectors,
    selected: state.svg.selected
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSelect: (id, type, tail, switchX, switchY) => {
      dispatch(selectNode(id, type, tail, switchX, switchY))
    },
    startMove: () => {
      dispatch(startMove())
    },
    stopMove: () => {
      dispatch(stopMove())
    },
    mouseMove: (mouseX, mouseY) => {
      dispatch(mouseMove(mouseX, mouseY))
    }

  }
}

const SvgContainer = connect(
  mapStateToProps
  ,mapDispatchToProps
)(Svg)

export default SvgContainer
