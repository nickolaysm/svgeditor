import React, { Component } from 'react'
//import Node from './Node'
import ImNode from './ImNode'
import Connector from './Connector'
import { connect } from 'react-redux'
import { selectNode, startMove, stopMove, mouseMove } from '../actions'
import ConnectorEnd from './ConnectorEnd'

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
  
  componentWillMount(){
    
  }
  
  componentWillReceiveProps(){
    //this.setState({nodes: nextProps.nodes.toObject()})  
  }

  render() {    
    console.log('this.props',this.props, 'this.props.nodes.toArray()', this.props.nodes.toArray());
    //console.log('render SVG');
    var nodes = this.props.nodes.map(node =>
        <ImNode key={node.get('id')} 
            node={node} 
            connectorEnd={this.props.connectorEnd.filter( end => end.get('node')==node.get('id') )} 
            selected={this.props.selected.get('type') == "NODE" && this.props.selected.get('id') === node.get('id')} 
            onSelect={this.props.onSelect} 
            startMove={this.props.startMove} />);

    var connectorEnds = this.props.connectorEnd.map( end => {
      var node = this.props.nodes.filter( node => node.get('id') == end.get('node') );
      //console.log('find node for connectorEnds',node.toJS())
      return <ConnectorEnd key={end.get('id')} end={end} node={node.get(0)}/>
    });
    
    var connectors = this.props.connectors.map(connector =>{
      var end1 = null;
      var end2 = null;
      this.props.connectorEnd.forEach( end => {
        if(end.get('id') == connector.getIn(['end1','connectorEnd'])) end1 = end;
        if(end.get('id') == connector.getIn(['end2','connectorEnd'])) end2 = end;
      })
      
      var node1 = null;
      var node2 = null;
      this.props.nodes.forEach( node => {
        if(node.get('id') == end1.get('node')) node1 = node;
        if(node.get('id') == end2.get('node')) node2 = node;
      })
      
      return <Connector key={connector.get('id')} startMove={this.props.startMove} connector={connector} end1={end1} end2={end2} node1={node1} node2={node2} onSelect={this.props.onSelect}/>
    });
        
    var style = {WebkitUserSelect: 'none',  userSelect: 'none'};
    return (
      <div style={{padding:0, margin:0, bordedWidth:0}}>
        <svg  ref='svg' width='600px' height='600px' onMouseDown={::this.mouseDown} onMouseUp={::this.mouseUp} onMouseMove={::this.mouseMove} style={style}>
          {nodes}
          {connectorEnds}
          {connectors}
        </svg>
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  console.log('SVG Container state', state);
  return {
    nodes: state.svgImmutable.get('nodes'),
    connectors: state.svgImmutable.get('connectors'),
    selected: state.svgImmutable.get('selected'),
    connectorEnd: state.svgImmutable.get('connectorEnd')
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
