
import { colorPalette } from '../theme.js';
import { ChartLayout } from '../utils/layout.js';

export async function drawChildLaborSankey(containerId) {
    const dataPath = 'data/abandono_escolar.json';
    const titleText = 'Ocupación infantil en México';

    // BOX MODEL
    const layout = new ChartLayout(containerId, {
        padding: { top: 80, right: 0, bottom: 0, left: 0 }
    });
    const { svg, g, width, height } = layout.createSVG(true);

    svg.append('text')
        .attr('x', (layout.totalWidth - layout.margin.left - layout.margin.right) / 2)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('font-weight', '600')
        .attr('fill', colorPalette.story.textMain)
        .text(titleText);

    const response = await fetch(dataPath);
    const sData = await response.json();

    const nodeDepths = {};
    const visited = new Set();
    function calculateDepth(nodeId, depth = 0) {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        nodeDepths[nodeId] = depth;
        sData.links.forEach(l => { if (l.source === nodeId) calculateDepth(l.target, depth + 1); });
    }
    calculateDepth(0);

    const nodeValues = {};
    sData.nodes.forEach(n => nodeValues[n.id] = 0);
    sData.nodes.forEach(node => {
        const outSum = sData.links.filter(l => l.source === node.id).reduce((a, b) => a + b.value, 0);
        const inSum = sData.links.filter(l => l.target === node.id).reduce((a, b) => a + b.value, 0);
        nodeValues[node.id] = Math.max(outSum, inSum, 0.1);
    });

    const maxDepth = Math.max(...Object.values(nodeDepths));
    const depthColorScale = d3.scaleLinear().domain([0, maxDepth]).range([colorPalette.story.hope, colorPalette.story.crisis]);

    const nodesByDepth = {};
    sData.nodes.forEach(n => {
        const d = nodeDepths[n.id] !== undefined ? nodeDepths[n.id] : 0;
        if (!nodesByDepth[d]) nodesByDepth[d] = [];
        nodesByDepth[d].push(n);
    });

    const nodeWidth = 30;
    const nodePadding = 40;
    const maxValue = Math.max(...Object.values(nodeValues));
    const heightScale = d3.scaleLinear().domain([0, maxValue]).range([0, height * 0.8]);

    const depths = Object.keys(nodesByDepth).map(Number).sort((a, b) => a - b);
    const depthSpacing = width / (depths.length + 0.5);

    sData.nodes.forEach(node => {
        const depth = nodeDepths[node.id] !== undefined ? nodeDepths[node.id] : 0;
        const nodesAtDepth = nodesByDepth[depth];
        const index = nodesAtDepth.indexOf(node);

        node.x = (depth) * depthSpacing + 50;
        node.value = nodeValues[node.id];
        node.h = heightScale(node.value);

        const totalH = nodesAtDepth.reduce((s, n) => s + heightScale(nodeValues[n.id]), 0);
        const totalP = nodePadding * (nodesAtDepth.length - 1);
        const startY = (height - totalH - totalP) / 2;

        let yOffset = startY;
        for (let i = 0; i < index; i++) yOffset += heightScale(nodeValues[nodesAtDepth[i].id]) + nodePadding;
        node.y = yOffset;
    });

    const linkPositions = new Map();
    sData.nodes.forEach(node => {
        let outY = node.y;
        sData.links.filter(l => l.source === node.id).forEach(l => {
            const h = heightScale(l.value);
            linkPositions.set(`${l.source}-${l.target}-source`, { y: outY + h / 2 });
            outY += h;
        });
        let inY = node.y;
        sData.links.filter(l => l.target === node.id).forEach(l => {
            const h = heightScale(l.value);
            linkPositions.set(`${l.source}-${l.target}-target`, { y: inY + h / 2 });
            inY += h;
        });
    });

    // Helper for Metric Formatting (M, K)
    const formatMetric = (val) => {
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
        return val;
    };

    // Tooltip Setup (Append to BODY for safety)
    let tooltip = d3.select('body').select('.custom-tooltip');
    if (tooltip.empty()) {
        tooltip = d3.select('body').append('div')
            .attr('class', 'custom-tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', '#fff')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '14px')
            .style('pointer-events', 'none')
            .style('z-index', '9999')
            .style('box-shadow', '0 2px 5px rgba(0,0,0,0.2)');
    }

    const links = g.selectAll('.link').data(sData.links).enter().append('path')
        .attr('d', l => {
            const s = sData.nodes.find(n => n.id === l.source);
            const t = sData.nodes.find(n => n.id === l.target);
            const sp = linkPositions.get(`${l.source}-${l.target}-source`);
            const tp = linkPositions.get(`${l.source}-${l.target}-target`);
            if (!s || !t || !sp || !tp) return '';
            const x0 = s.x + nodeWidth, x1 = t.x, y0 = sp.y, y1 = tp.y;
            const xi = d3.interpolateNumber(x0, x1), x2 = xi(0.5), x3 = xi(0.5);
            return `M${x0},${y0} C${x2},${y0} ${x3},${y1} ${x1},${y1}`;
        })
        .attr('stroke', l => {
            // FIX: Darken link 2->3 (No Asisten -> Sin Trabajo / Inactivos)
            if (l.source === 2 && l.target === 3) return '#888888'; // Visible Gray
            return l.color || depthColorScale(nodeDepths[l.source] || 0);
        })
        .attr('stroke-width', l => Math.max(1, heightScale(l.value)))
        .attr('fill', 'none')
        .attr('opacity', 0); // Start hidden for dramatic reveal

    // Dramatic Link Animation: Staggered, slower, eased (SOBER)
    links.transition().duration(2500)
        .delay((d, i) => i * 200) // Slow stagger
        .ease(d3.easeCubicOut) // Smooth, serious entry
        .attr('opacity', l => {
            if (l.source === 2 && l.target === 3) return 0.6; // Higher opacity for faint link
            return 0.5;
        });

    // Filter interaction
    links.on('mouseover', function (event, d) {
        d3.select(this).transition().duration(200).attr('opacity', 0.8).attr('stroke-width', l => Math.max(1, heightScale(l.value)) + 2);
        tooltip.style('visibility', 'visible')
            .html(`<strong>${d.source} → ${d.target}</strong><br>${d.value.toLocaleString()}`);
    }).on('mousemove', function (event) {
        tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
    }).on('mouseout', function (event, d) {
        const opacity = (d.source === 2 && d.target === 3) ? 0.6 : 0.5;
        d3.select(this).transition().duration(200).attr('opacity', opacity).attr('stroke-width', l => Math.max(1, heightScale(l.value)));
        tooltip.style('visibility', 'hidden');
    });

    const nodes = g.selectAll('.node').data(sData.nodes).enter().append('rect')
        .attr('x', d => d.x).attr('y', d => d.y + d.h / 2) // Start from vertical center
        .attr('width', nodeWidth).attr('height', 0) // Grow from center
        .attr('fill', d => d.color || depthColorScale(nodeDepths[d.id] || 0))
        .attr('rx', 3);

    // Dramatic Node Animation: Slow Growth (SOBER)
    nodes.transition().duration(2000)
        .delay((d, i) => i * 250)
        .ease(d3.easeCubicOut) // No bounce. Smooth growth.
        .attr('y', d => d.y)
        .attr('height', d => d.h);

    nodes.on('mouseover', function (event, d) {
        tooltip
            .style('visibility', 'visible')
            .text(`${d.tooltip}`);
    }).on('mousemove', function (event) {
        tooltip.style('top', (event.pageY - 10) + 'px').style('left', (event.pageX + 10) + 'px');
    }).on('mouseout', function () {
        tooltip.style('visibility', 'hidden');
    });

    // Labels Group
    const labelGroup = g.selectAll('.labelGroup').data(sData.nodes).enter().append('g')
        .attr('transform', d => `translate(${d.x + nodeWidth + 10}, ${d.y + d.h / 2})`)
        .attr('opacity', 0); // Start hidden

    // We add text first to measure it, then insert rect behind
    labelGroup.each(function (d) {
        const grp = d3.select(this);

        // 1. Label Text
        const textLabel = grp.append('text')
            .attr('class', 'main-label')
            .attr('y', -5)
            .text(d.label)
            .attr('font-size', '14px') // Standardized
            // .attr('font-weight', '600')
            .attr('font-family', 'sans-serif')
            .attr('fill', colorPalette.story.textMain)
            .attr('alignment-baseline', 'bottom');

        // 2. Count Text
        const textValue = grp.append('text')
            .attr('class', 'value-label')
            .attr('y', 15)
            .text(formatMetric(d.value || 0))
            .attr('font-size', '14px') // Standardized size, bold
            // .attr('font-weight', 'bold')
            .attr('font-family', 'sans-serif')
            .attr('fill', colorPalette.story.textMain) // Dark Blue as requested
            .attr('alignment-baseline', 'top');

        // 3. Background Rect (Inserted before text)
        // We calculate BBox of the whole group content (approximate relative to group)
        // Simple heuristic: width = max width of texts + padding
        // OR better: use getBBox() if rendered. Since we are in enter() and opacity 0, it renders geometry.

        // Let's use a fixed padding approach for simplicity in this specific "enter" context
        // or just append a rect that fits mostly.
        // Actually, we can just insert the rect at the beginning of the group now.
        // We'll approximate width based on char count to avoid complex async measurement issues in some envs,
        // but getBBox usually works in D3 enter selections if SVG is in DOM.

        try {
            const bbox1 = textLabel.node().getBBox();
            const bbox2 = textValue.node().getBBox();
            const w = Math.max(bbox1.width, bbox2.width) + 10;
            const h = (bbox2.y + bbox2.height) - bbox1.y + 10;
            const y = bbox1.y - 5;

            grp.insert('rect', 'text')
                .attr('x', -5).attr('y', y)
                .attr('width', w).attr('height', h)
                .attr('fill', '#ffffff')
                .attr('fill-opacity', 0.6) // High contrast background
                .attr('rx', 4);
        } catch (e) {
            // Fallback if getBBox fails (e.g. not in DOM yet)
            grp.insert('rect', 'text')
                .attr('x', -5).attr('y', -20)
                .attr('width', 80).attr('height', 50)
                .attr('fill', '#ffffff')
                .attr('fill-opacity', 0.6)
                .attr('rx', 4);
        }
    });

    // Sober Label Reveal: Fade in only (no bouncy slide)
    labelGroup.transition().duration(1500)
        .delay((d, i) => 1500 + i * 200) // Wait for nodes
        .ease(d3.easeQuadOut)
        .attr('opacity', 1);

}
