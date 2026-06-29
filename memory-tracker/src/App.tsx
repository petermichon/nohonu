import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './index.css';
import { symbols, parseSymbols } from './fileSystem';

function App() {
  const svgRef = useRef<SVGSVGElement>(null);

  const { nodes: generatedNodes, edges: generatedEdges } = parseSymbols(symbols);

  // Extract folder names for coloring
  const folderMap = new Map<string, string>();
  generatedNodes.forEach((node: any) => {
    const folder = node.data.folder || 'root';
    folderMap.set(node.id, folder);
  });

  const folders = Array.from(new Set(Array.from(folderMap.values())));
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(folders);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = window.innerWidth;
    const height = window.innerHeight;

    svg.attr('viewBox', [-width / 2, -height / 2, width, height]);

    const g = svg.append('g');
    const labelGroup = svg.append('g').attr('pointer-events', 'none');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0, Infinity])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        labelGroup.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    const simulation = d3
      .forceSimulation(generatedNodes as any)
      .force(
        'link',
        d3.forceLink(generatedEdges as any).id((d: any) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('x', d3.forceX())
      .force('y', d3.forceY());

    // Create arrowheads for each link
    const defs = svg.append('defs');
    generatedEdges.forEach((edge: any, i: number) => {
      const sourceColor = colorScale(folderMap.get(edge.source.id) || 'root');

      // Create arrowhead with source color
      defs
        .append('marker')
        .attr('id', `arrowhead-${i}`)
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 1)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 3)
        .attr('markerHeight', 3)
        .append('path')
        .attr('d', 'M 0,-5 L 10,0 L 0,5')
        .attr('fill', sourceColor);
    });

    const link = g
      .append('g')
      .selectAll('line')
      .data(generatedEdges)
      .enter()
      .append('line')
      .attr('stroke', (d: any) => colorScale(folderMap.get(d.source.id) || 'root'))
      .attr('stroke-width', 2)
      .attr('marker-end', (_: any, i: number) => `url(#arrowhead-${i})`);

    const node = g
      .append('g')
      .selectAll('g')
      .data(generatedNodes)
      .enter()
      .append('g')
      .call(
        d3
          .drag<SVGGElement, any>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append('circle')
      .attr('r', 5)
      .attr('fill', (d: any) => colorScale(folderMap.get(d.id) || 'root'))
      .attr('stroke', '#171717')
      .attr('stroke-width', 1.5);

    node
      .on('mouseover', function (_, d: any) {
        labelGroup
          .append('text')
          .attr('class', 'hover-label')
          .datum(d)
          .attr('x', d.x + 10)
          .attr('y', d.y + 4)
          .attr('fill', '#b4b4b4')
          .attr('font-size', '12px')
          .attr('font-family', 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif')
          .text(d.id);
      })
      .on('mouseout', function () {
        labelGroup.selectAll('.hover-label').remove();
      });

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const offset = 11;
          if (distance === 0) return d.target.x;
          return d.source.x + (dx / distance) * (distance - offset);
        })
        .attr('y2', (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const offset = 11;
          if (distance === 0) return d.target.y;
          return d.source.y + (dy / distance) * (distance - offset);
        });

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);

      // Update label position if it exists
      labelGroup
        .selectAll('.hover-label')
        .attr('x', (d: any) => d.x + 10)
        .attr('y', (d: any) => d.y + 4);
    });

    return () => {
      simulation.stop();
    };
  }, [generatedNodes, generatedEdges]);

  return (
    <div className="h-screen w-screen bg-neutral-900">
      <div className="absolute top-4 left-4 z-10">
        <h1 className="font-semibold text-neutral-50">Memory Dependency Tracker</h1>
      </div>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}

export default App;
