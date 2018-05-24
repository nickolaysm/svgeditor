import React, { Component } from 'react';
import ConnectorEnd from './ConnectorEnd';


export default class ConnectorEnds extends Component {

    shouldComponentUpdate(nextProps){
        return nextProps.connectorEnd != this.props.connectorEnd;
    }

    convertToIdMap(array){
        var ends = {};
        for(var i=0; i<array.size; i++){
            let end = array.get(i);
            ends[end.get("id")] = end;
        }
        return ends;
    }

    render() {
        var nodesJSMap = this.convertToIdMap(this.props.nodes);
        var connectorEnds = this.props.connectorEnd.map( end => {
            //let node = this.props.nodes.filter( node => node.get('id') == end.get('node') );
            let node = nodesJSMap[end.get('node')];
            //console.log('find node for connectorEnds',node.toJS())
            return <ConnectorEnd key={end.get('id')} end={end} node={node}/>
        });
        return (
            <g>
                {connectorEnds}
            </g>
        );
    }

}

