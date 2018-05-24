import React, { Component } from 'react'
import ImNode from './ImNode'
import Connectors from './Connectors'
import Nodes from './Nodes'
import { connect } from 'react-redux'
import { mouseMove, mouseUp, mouseDown, domReady } from '../actions/system'
import ConnectorEnds from './ConnectorEnds'
import ConnectorEnd from './ConnectorEnd'
import {CONNECTOR, NODE} from "../const/entity";
import throttle from "lodash/throttle";
import {MOUSE_MOVE_ACTION_DELAY} from "../const/entity";
import {timer} from 'd3-timer';
import {addNodeSimple} from "../actions/system";


//TODO: Для красоты. Попробовать применить вот это https://habrahabr.ru/post/207908/

//import {DevTools} from './DevTools'
// var hasChange = false;
// var mousePoint = null;
var start = (new Date()).getTime();
class Svg extends Component {

    componentDidUpdate(){
      console.log('-------',(new Date()).getTime() - start,"Svg componentDidUpdate");
    }

    shouldComponentUpdate(nextProps){
        return nextProps.currentState != this.props.currentState;
    }

  mouseDown(e){
    console.log('mouseDown', e);
    var pt = this.refs.svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    var point = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());

    this.props.mouseDown(point);
    window.requestAnimationFrame(::this.domReadyHandler)
  }

  mouseUp(){
    this.props.mouseUp();
    window.requestAnimationFrame(::this.domReadyHandler)
  }

  mouseMove(e){
    start = (new Date()).getTime();
    //console.log('+++',(new Date()).getTime(),"mouseMove");
    //console.log('+++', (new Date()).getMilliseconds(),'Svg mouseMove', this);
    //this.state.throttleMouseMove(e.clientX, e.clientY);
      this.mouseMoveThrottle(e.clientX, e.clientY);
  }

    mouseMoveThrottle(clientX, clientY){
        var pt = this.refs.svg.createSVGPoint();
        pt.x = clientX; pt.y = clientY;
        var point = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());
        //console.log('--= Svg  ',point, clientX, clientY, this.refs.svg);
        this.props.mouseMove(point);
        window.requestAnimationFrame(::this.domReadyHandler)
    }

  domReadyHandler(){
    if(this.props.currentState != this.props.accumulateChanges)
      this.props.domReady();
  }

  componentWillMount(){
    //Функция подготовлена, так что бы событие бросалось не чаще одного раза в определенный интерфал времени
    //hasChange = false;
    //timer(::this.domReadyHandler);
    //this.setState({throttleMouseMove: throttle((x, y)=>{this.mouseMoveThrottle(x,y)}, MOUSE_MOVE_ACTION_DELAY, { 'leading': true,'trailing': true }) });
  }
  
  componentWillReceiveProps(){
    //this.setState({nodes: nextProps.nodes.toObject()})  
  }

  onAddClick(){
    this.props.addNodeSimple("NewNode", "new value");
  }

  render() {    
    //console.log('this.props',this.props, 'this.props.connectorEnd', this.props.connectorEnd);
    //console.log('render SVG');
    // let isNodeSelected = this.props.selected.get('type') == NODE;
    // let selectedId = this.props.selected.get('id');
    // var nodes = this.props.nodes.map(node =>
    //     <ImNode key={node.get('id')}
    //         node={node}
    //         connectorEnd={this.props.connectorEnd.filter( end => end.get('node')==node.get('id') )}
    //         selected={isNodeSelected && selectedId === node.get('id')}
    //         />);

    // var connectorEnds = this.props.connectorEnd.map( end => {
    //   var node = this.props.nodes.filter( node => node.get('id') == end.get('node') );
    //   //console.log('find node for connectorEnds',node.toJS())
    //   return <ConnectorEnd key={end.get('id')} end={end} node={node.get(0)}/>
    // });
    
    // var connectors = this.props.connectors.map(connector =>{
    //   var end1 = null;
    //   var end2 = null;
    //   // console.log('--- connector', connector.toJS());
    //   // console.log('--- this.props.connectorEnd', this.props.connectorEnd.toJS());
    //   let end1Connector = connector.getIn(['end1','connectorEnd']);
    //   let end2Connector = connector.getIn(['end2','connectorEnd']);
    //   this.props.connectorEnd.forEach( end => {
    //     if(end.get('id') == end1Connector) end1 = end;
    //     if(end.get('id') == end2Connector) end2 = end;
    //   })
    //
    //   let end1Node = end1.get('node');
    //   let end2Node = end2.get('node');
    //   var node1 = null;
    //   var node2 = null;
    //   this.props.nodes.forEach( node => {
    //     if(node.get('id') == end1Node) node1 = node;
    //     if(node.get('id') == end2Node) node2 = node;
    //   })
    //
    //   return <Connector key={connector.get('id')} connector={connector} end1={end1} end2={end2} node1={node1} node2={node2}
    //                     selected = {this.props.selected.get('type') == CONNECTOR && this.props.selected.get('id') === connector.get('id')}
    //                     tail={this.props.selected.get('tail')}/>
    // });
        
    var style = {WebkitUserSelect: 'none',  userSelect: 'none'};
    return (
      <div style={{padding:0, margin:0, bordedWidth:0}}>
        <div onClick={::this.onAddClick}> + </div>
        <svg  ref='svg' width='1000px' height='1000px' onMouseDown={::this.mouseDown} onMouseUp={::this.mouseUp} onMouseMove={::this.mouseMove} style={style}>
          <Nodes nodes={this.props.nodes} connectorEnd={this.props.connectorEnd} selected={this.props.selected}/>
          <ConnectorEnds connectorEnd={this.props.connectorEnd} nodes={this.props.nodes}/>
          <Connectors connectors={this.props.connectors} nodes={this.props.nodes} connectorEnd={this.props.connectorEnd} selected={this.props.selected}/>
        </svg>
      </div>
    )
  }

}

const mapStateToProps = (state) => {
  //console.log('SVG Container state', state);
  return {
    nodes: state.svgImmutable.getIn(['currentState','nodes']),
    connectors: state.svgImmutable.getIn(['currentState','connectors']),
    selected: state.svgImmutable.getIn(['currentState','selected']),
    connectorEnd: state.svgImmutable.getIn(['currentState','connectorEnd']),
    currentState: state.svgImmutable.get('currentState'),
    accumulateChanges: state.svgImmutable.get('accumulateChanges')
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
    },
    addNodeSimple: (caption, value)=>{
      dispatch(addNodeSimple(caption, value))
    }
  }
}

const SvgContainer = connect(
  mapStateToProps
  ,mapDispatchToProps
)(Svg)

export default SvgContainer
