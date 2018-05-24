import React, { Component } from 'react'
//import {evalConnectorCoordByEdge, getEndsCoordinate} from '../utils'
//import ConnectorEnd from './ConnectorEnd'

export default class ImNode extends Component {

    componentDidUpdate(){
        //console.log('---',(new Date()).getMilliseconds(),"Node componentDidUpdate");
    }

    checkOnUpdate(nextProps) {
        return nextProps.node != this.props.node || nextProps.selected != this.props.selected
    }

    createStateObject(node){
        return node.toJS()
    }
  
    componentWillMount(){
        this.setState(this.createStateObject(this.props.node))
    }
  
    componentWillReceiveProps(nextProps){
        if(this.checkOnUpdate(nextProps))
            this.setState(this.createStateObject(nextProps.node))
    }
  
    shouldComponentUpdate(nextProps){
        return this.checkOnUpdate(nextProps);
    }


    mouseDown(e){
        // console.log('mouseDown', e);
        // var pt = this.refs.svg.createSVGPoint();
        // pt.x = e.clientX; pt.y = e.clientY;
        // var loc = pt.matrixTransform(this.refs.svg.getScreenCTM().inverse());
        //
        // //this.props.onSelect(this.state.id, "NODE", null, e.clientX - this.state.x, e.clientY - this.state.y);
        // this.props.onSelect(this.state.id, "NODE", null, loc.x - this.state.loc.x, loc.y - this.state.loc.y);
        // this.props.startMove();
    }

    render() {
        //console.log('===== render Node', this.state);
        if(this.state.highlight)
            console.log('===== render Node highlighted', this.state);
        var baseColor = "#bbbbf9";
        var highlightColor = "#0000AA";
        var headerShift = 20;
        var headerHeight = headerShift + 10;
        var baseShift = headerHeight + 25;
        var headerColor = this.props.selected ? 'orange' : 'white';

        return (
            <svg>
                <rect fill={baseColor} fillOpacity={0.8} x={this.state.loc.x} y={this.state.loc.y} width={this.state.width} height={this.state.height} rx='10' ry='10'/>
                <text style={{userSelect:'none', MozUserSelect: 'none'}} textAnchor={'middle'} fill={headerColor} x={this.state.loc.x+this.state.width/2} y={this.state.loc.y+headerShift}>{this.state.caption}</text>
                <line x1={this.state.loc.x} y1={this.state.loc.y+headerHeight} x2={this.state.loc.x+this.state.width} y2={this.state.loc.y+headerHeight} style={{stroke:'rgb(255,255,255)',strokeWidth:'2'}} />
                <text style={{userSelect:'none', MozUserSelect: 'none'}} textAnchor={'middle'} fill={'white'} x={this.state.loc.x+this.state.width/2} y={this.state.loc.y+baseShift}>{this.state.value}</text>
                {this.state.highlight
                    ? <rect strokeOpacity={0.5} stroke={highlightColor} fillOpacity={0} x={this.state.loc.x} y={this.state.loc.y} width={this.state.width} height={this.state.height} rx='10' ry='10'/>
                    : null
                }

            </svg>
        )
    }

}
