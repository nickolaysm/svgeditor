import React, { Component } from 'react'
import ImNode from './ImNode'
import Connector from './Connector'
import { connect } from 'react-redux'
import { mouseMove, mouseUp, mouseDown, domReady } from '../actions/system'
import ConnectorEnd from './ConnectorEnd'
import {CONNECTOR, NODE} from "../const/entity";
import throttle from "lodash/throttle";
import {MOUSE_MOVE_ACTION_DELAY} from "../const/entity";
import {timer} from 'd3-timer';

//import {DevTools} from './DevTools'
var hasChange = false;
var mousePoint = null;

class Svg extends Component {

  componentDidUpdate(){
    //console.log('---',(new Date()).getMilliseconds(),"Svg componentDidUpdate");
  }

  mouseDown(e){
    //console.log('mouseDown', e);
    var pt = this.refs.svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    var point = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());

    this.props.mouseDown(point);
  }

  mouseUp(){
    this.props.mouseUp();
  }

  mouseMove(e){
    //console.log('+++', (new Date()).getMilliseconds(),'Svg mouseMove', this);
    //this.state.throttleMouseMove(e.clientX, e.clientY);
      this.mouseMoveThrottle(e.clientX, e.clientY);
  }

    mouseMoveThrottle(clientX, clientY){
        var pt = this.refs.svg.createSVGPoint();
        pt.x = clientX; pt.y = clientY;
        var point = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());
        //console.log('--= Svg  ',point, clientX, clientY, this.refs.svg);
        hasChange = true;
        mousePoint = point;
        //this.props.mouseMove(point);
      }

  domReadyHandler(){
    if(hasChange && mousePoint != null)
      this.props.domReady(mousePoint);
    hasChange = false;
  }

  componentWillMount(){
    //Функция подготовлена, так что бы событие бросалось не чаще одного раза в определенный интерфал времени
    hasChange = false;
    timer(::this.domReadyHandler);
    this.setState({throttleMouseMove: throttle((x, y)=>{this.mouseMoveThrottle(x,y)}, MOUSE_MOVE_ACTION_DELAY, { 'leading': true,'trailing': true }) });
  }
  
  componentWillReceiveProps(){
    //this.setState({nodes: nextProps.nodes.toObject()})  
  }

  render() {    
    //console.log('this.props',this.props, 'this.props.nodes.toArray()', this.props.nodes.toArray());
    //console.log('render SVG');
    var nodes = this.props.nodes.map(node =>
        <ImNode key={node.get('id')} 
            node={node} 
            connectorEnd={this.props.connectorEnd.filter( end => end.get('node')==node.get('id') )} 
            selected={this.props.selected.get('type') == NODE && this.props.selected.get('id') === node.get('id')}
            />);

    var connectorEnds = this.props.connectorEnd.map( end => {
      var node = this.props.nodes.filter( node => node.get('id') == end.get('node') );
      //console.log('find node for connectorEnds',node.toJS())
      return <ConnectorEnd key={end.get('id')} end={end} node={node.get(0)}/>
    });
    
    var connectors = this.props.connectors.map(connector =>{
      var end1 = null;
      var end2 = null;
      // console.log('--- connector', connector.toJS());
      // console.log('--- this.props.connectorEnd', this.props.connectorEnd.toJS());

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

      return <Connector key={connector.get('id')} connector={connector} end1={end1} end2={end2} node1={node1} node2={node2}
                        selected = {this.props.selected.get('type') == CONNECTOR && this.props.selected.get('id') === connector.get('id')}
                        tail={this.props.selected.get('tail')}/>
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
  //console.log('SVG Container state', state);
  return {
    nodes: state.svgImmutable.get('nodes'),
    connectors: state.svgImmutable.get('connectors'),
    selected: state.svgImmutable.get('selected'),
    connectorEnd: state.svgImmutable.get('connectorEnd')
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    mouseMove: (mouseX, mouseY) => {
      dispatch(mouseMove(mouseX, mouseY))
    },
    mouseUp: () =>{
      dispatch(mouseUp())
    },
    mouseDown: (e) =>{
      dispatch(mouseDown(e))
    },
    domReady: (point)=>{
      dispatch(domReady(point))
    }

  }
}

const SvgContainer = connect(
  mapStateToProps
  ,mapDispatchToProps
)(Svg)

export default SvgContainer
