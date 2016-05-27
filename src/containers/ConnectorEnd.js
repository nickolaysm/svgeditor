import React, { Component } from 'react'
//import {evalConnectorCoordByEdge, getEndsCoordinate} from '../utils'
import {computeEndLocation} from '../utils'

export default class ConnectorEnd extends Component {

  createStateObject(end, node){
    //console.log("ConnectorEnd, createStateObject ", node.get('loc').toJS());
    var data = end.toJS();
    var endLoc = computeEndLocation(data.edge, data.shiftLoc, node.get('loc').toJS(), node.get('width'), node.get('height') );
    //console.log("========== ConnectorEnd, createStateObject ", endLoc);
    return {...data,  loc: endLoc};
  }
  
  componentWillMount(){
    this.setState(this.createStateObject(this.props.end, this.props.node))  
  }
  
  componentWillReceiveProps(nextProps){
    this.setState(this.createStateObject(nextProps.end, nextProps.node))
  }

  shouldComponentUpdate(nextProps){
   // console.log("%cConnectorEnd shouldComponentUpdate","color:red",nextProps.end != this.props.end);
    return nextProps.end != this.props.end;
  }
  
  render() {
    //console.log('===== render ConnectorEnd', this.state);
    var opacity = this.state.opacity;
    var crossSize = 4;
    if(! this.state.visible) return null;
    
    //Рисуем кросс крест
    return (
      <svg ref='svg'>
          <line x1={this.state.loc.x-crossSize} y1={this.state.loc.y-crossSize} x2={this.state.loc.x+crossSize} y2={this.state.loc.y+crossSize} strokeOpacity={opacity} style={{stroke:'rgb(0,150,150)',strokeWidth:'1'}} />
          <line x1={this.state.loc.x+crossSize} y1={this.state.loc.y-crossSize} x2={this.state.loc.x-crossSize} y2={this.state.loc.y+crossSize} strokeOpacity={opacity} style={{stroke:'rgb(0,150,150)',strokeWidth:'1'}} />
      </svg>
    )
  }

}
