import React, { Component } from 'react';
import {CONNECTOR} from "../const/entity";
import {NODE} from "../const/entity";
import ImNode from "./ImNode";


export default class Nodes extends Component {

    shouldComponentUpdate(nextProps){
        let isNodeSelected = this.props.selected.get('type') == NODE;
        return nextProps.nodes != this.props.nodes
            || ( isNodeSelected && nextProps.selected != this.props.selected );
    }

    render() {
        let isNodeSelected = this.props.selected.get('type') == NODE;
        let selectedId = this.props.selected.get('id');
        var nodes = this.props.nodes.map(node => {
            let nodeId = node.get('id');
            return (
                <ImNode key={nodeId}
                    node={node}
                    selected={isNodeSelected && selectedId === nodeId}
                />);
        });

        return (
            <g>
                {nodes}
            </g>
        );
    }

}

