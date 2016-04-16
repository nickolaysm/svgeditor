import React, { Component } from 'react'
//import Node from './Node'
//import Connector from './Connector'
import { connect } from 'react-redux'
import { changeNode } from '../actions'
//import {DevTools} from './DevTools'

class Editor extends Component {

  constructor(){
    super();
    this.state ={caption:'', value:''};
  }

  componentWillMount (){
    var caption = this.props.nodes[this.props.selected.id].caption;
    var value = this.props.nodes[this.props.selected.id].value;

    this.setState({caption: caption, value: value}); 
  }

  componentWillReceiveProps( nextProps ) {
    var caption = nextProps.nodes[this.props.selected.id].caption;
    var value = nextProps.nodes[this.props.selected.id].value;
    this.setState({caption: caption, value: value});
  }  

  mouseDown(){
    this.props.startMove();
  }

  mouseUp(){
    this.props.stopMove();
  }

  mouseMove(e){
    console.log('Svg mouseMove');
    this.props.mouseMove(e.clientX, e.clientY);
  }

  change(){
    if(this.props.selected.type == "NODE") {
      var captionInput = this.refs.captionInput.value;
      var valueInput = this.refs.valueInput.value;
      console.log('change', captionInput, valueInput);
      this.props.changeNode(this.props.selected.id, captionInput, valueInput);
    }
  }

  render() {    
    //console.log('render Editor', this.props.nodes[this.props.selectedNode]);
    //var nodes = this.props.nodes.map(node => <Node key={node.id} id={node.id} x={node.x} y={node.y} caption={node.caption} value={node.value} selected={this.props.selectedNode === node.id} onSelect={this.props.onSelect}/>)    
    //var connectors = this.props.connectors.map(connector => <Connector x1={this.props.nodes[connector.id1].x} y1={this.props.nodes[connector.id1].y} x2={this.props.nodes[connector.id2].x} y2={this.props.nodes[connector.id2].y}/>)
    var caption = "";
    var value = "";
    if(this.props.selected.type == "NODE"){
      caption = this.props.nodes[this.props.selected.id].caption;
      value = this.props.nodes[this.props.selected.id].value;
    }
    return (
      <div>
        <input ref="captionInput" type='text' value={caption} onChange={::this.change}/>
        <input ref="valueInput" type='text' value={value} onChange={::this.change}/>
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  //console.log('state', state);
  return {
    nodes: state.svgImmutable.get('nodes'),
    connectors: state.svgImmutable.get('connectors'),
    selected: state.svgImmutable.get('selected')
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeNode: (id, caption, value) => {
      dispatch(changeNode(id, caption, value))
    }
  }
}

const PropertyEditor = connect(
  mapStateToProps
  ,mapDispatchToProps
)(Editor)

export default PropertyEditor
