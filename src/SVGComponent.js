import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getRandomPosition, calculateIntersectionPoint } from './utility';

const SVGComponent = ({ graph, setGraph, deleteMode, setSelectedNode, setSelectedEdge, highlight, setHighligtedNodes, highlightNodes }) => {
    const svgRef = useRef();

    let dragStartPosition = { x: null, y: null };

    const onDragStart = (event, d) => {
        d3.select(event.sourceEvent.target).raise(); // Bring to front
        dragStartPosition = { x: event.x, y: event.y };
    };

    const onDrag = (event, d) => {
        d.x = event.x;
        d.y = event.y;
        d3.select(event.sourceEvent.target)
            .attr('cx', d.x)
            .attr('cy', d.y);
    };

    const onDragEnd = (event, d) => {
        const dx = event.x - dragStartPosition.x;
        const dy = event.y - dragStartPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {  // Threshold for treating the action as a click and not a drag
            if (deleteMode) {
                setGraph(prevGraph => {
                    const newNodes = prevGraph.nodes.filter(node => node.id !== d.id);
                    const newEdges = prevGraph.edges.filter(edge => (edge.source !== d.id && edge.target !== d.id));
                    return { nodes: newNodes, edges: newEdges };
                });
            }
            if (highlight) {
                setHighligtedNodes(nodes => {
                    if (nodes.includes(d.id)) {
                        return nodes.filter(node => node !== d.id);
                    }
                    return [...nodes, d.id];
                });
            }
        }

        setGraph(prevGraph => {
            const updatedNodes = prevGraph.nodes.map(node => {
                if (node.id === d.id) {
                    return { ...node, x: event.x, y: event.y };
                }
                return node;
            });
            return { ...prevGraph, nodes: updatedNodes };
        });
    };

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous render

        const nodeRadius = 20;

        svg.selectAll("circle")
            .data(graph.nodes, d => d.id)
            .join(
                enter => enter.append("circle")
                    .attr("r", nodeRadius)
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y)
                    .classed("highlighted-circle", d => highlightNodes.includes(d.id))
                    .call(d3.drag()
                        .on("start", onDragStart)
                        .on("drag", onDrag)
                        .on("end", onDragEnd)),
                update => update
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y),
                exit => exit.remove()
            );

        svg.selectAll("text")
            .data(graph.nodes)
            .enter()
            .append("text")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("dy", ".35em") // Vertically center text
            .attr("text-anchor", "middle") // Horizontally center text
            .text(d => d.id)
            .style("fill", "white")
            .style("font-size", "20px");

        svg.selectAll("line")
            .data(graph.edges)
            .enter()
            .append("line")
            .attr("x1", edge => {
                const sourceNode = graph.nodes.find(node => node.id === edge.source);
                const targetNode = graph.nodes.find(node => node.id === edge.target);
                return sourceNode && targetNode ? calculateIntersectionPoint(sourceNode, targetNode, nodeRadius).x : 0;
            })
            .attr("y1", edge => {
                const sourceNode = graph.nodes.find(node => node.id === edge.source);
                const targetNode = graph.nodes.find(node => node.id === edge.target);
                return sourceNode && targetNode ? calculateIntersectionPoint(sourceNode, targetNode, nodeRadius).y : 0;
            })
            .attr("x2", edge => {
                const sourceNode = graph.nodes.find(node => node.id === edge.source);
                const targetNode = graph.nodes.find(node => node.id === edge.target);
                return sourceNode && targetNode ? calculateIntersectionPoint(targetNode, sourceNode, nodeRadius).x : 0;
            })
            .attr("y2", edge => {
                const sourceNode = graph.nodes.find(node => node.id === edge.source);
                const targetNode = graph.nodes.find(node => node.id === edge.target);
                return sourceNode && targetNode ? calculateIntersectionPoint(targetNode, sourceNode, nodeRadius).y : 0;
            })
            .attr('marker-end', 'url(#arrowhead)')
            .style("stroke", "black")
            .style("stroke-width", 2)
            .on("click", function(event, edge) {
                if (deleteMode) {
                    setGraph(prevGraph => {
                        const newEdges = prevGraph.edges.filter(e => e !== edge);
                        return { ...prevGraph, edges: newEdges };
                    });
                } else {
                    setSelectedEdge(edge);
                    setSelectedNode(null);
                }
            });

        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 5)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke', 'none');
    }, [graph, deleteMode, highlightNodes]);

    return (
        <svg ref={svgRef} width="800" height="600" style={{ border: '1px solid black' }}>
            {/* ... SVG content */}
        </svg>
    );
};

export default SVGComponent;
