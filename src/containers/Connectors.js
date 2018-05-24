import React, { Component } from 'react';
import {CONNECTOR} from "../const/entity";
import Connector from './Connector';


export default class Connectors extends Component {

    shouldComponentUpdate(nextProps){
        return nextProps.connectors != this.props.connectors
            || nextProps.nodes != this.props.nodes
            || nextProps.selected != this.props.selected;
            //|| nextProps.connectorEnd != this.props.connectorEnd;
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
        var isConnectorSelected =this.props.selected.get('type') == CONNECTOR;
        var selectedId = this.props.selected.get('id');
        var connectorEndJSMap = this.convertToIdMap(this.props.connectorEnd);
        var nodesJSMap = this.convertToIdMap(this.props.nodes);

        var connectors = this.props.connectors.map(connector =>{
            // console.log('--- connector', connector.toJS());
            // console.log('--- this.props.connectorEnd', this.props.connectorEnd.toJS());
            let end1Connector = connector.getIn(['end1','connectorEnd']);
            let end2Connector = connector.getIn(['end2','connectorEnd']);
            var end1 = connectorEndJSMap[end1Connector];
            var end2 = connectorEndJSMap[end2Connector];
            // this.props.connectorEnd.forEach( end => {
            //     if(end.get('id') == end1Connector) end1 = end;
            //     if(end.get('id') == end2Connector) end2 = end;
            // })

            let end1Node = end1.get('node');
            let end2Node = end2.get('node');
            var node1 = nodesJSMap[end1Node];
            var node2 = nodesJSMap[end2Node];
            // this.props.nodes.forEach( node => {
            //     if(node.get('id') == end1Node) node1 = node;
            //     if(node.get('id') == end2Node) node2 = node;
            // })

            // return <Connector key={connector.get('id')} connector={connector} end1={end1} end2={end2} node1={node1} node2={node2}
            //                   selected = { isConnectorSelected && selectedId === connector.get('id')}
            //                   tail={this.props.selected.get('tail')}/>
            return <Connector key={connector.get('id')} connector={connector} end1={end1} end2={end2} node1={node1} node2={node2}
                              selected = { isConnectorSelected && selectedId === connector.get('id')}
                              />

        });

        return (
            <g>
                {connectors}
            </g>
        );
    }

}

