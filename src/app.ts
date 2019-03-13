import * as d3 from "d3";
import { sankey, SankeyGraph, SankeyLayout, sankeyLinkHorizontal, SankeyNode } from "d3-sankey";

/**
 *
 */
interface Factor {
    index: number;
    fill: string;
    label: string;
    maxValue: number;
    minValue: number;
}

/**
 *
 */
interface Node {
    depth: number;
    factor: Factor;
    fill: string;
    id: string;
    index: number;
    label: string;
    stack: number;
    treatment: string;
    value: number;
    week: string;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
}

interface Link {
    source: Node;
    target: Node;
    value: number;
    width: number;
}

interface GraphData {
    nodes: Node[];
    links: Link[];
}

// const FACTORS: Factor[] = [
//     { index: 0, minValue: 0.00, maxValue: 0.30, label: "[0.00, 0.30)", fill: color(0.75) },
//     { index: 1, minValue: 0.30, maxValue: 0.50, label: "[0.30, 0.50)", fill: color(0.50) },
//     { index: 2, minValue: 0.50, maxValue: 1.00, label: "[0.50, 1.00]", fill: color(0.25) },
// ];

const FACTORS: Factor[] = [
    { index: 0, minValue: 1.0, maxValue: 1.9999, label: "[0.00, 0.30)", fill: color(0.25) },
    { index: 1, minValue: 2.0, maxValue: 2.9999, label: "[0.30, 0.50)", fill: color(0.50) },
    { index: 2, minValue: 3.0, maxValue: 3.9999, label: "[0.50, 1.00]", fill: color(0.75) }
];

// const CSV_FILE_NAME: string = "data/sample-data-1.csv";
const CSV_FILE_NAME: string = "data/womac_pain_resp_sankey.csv";
const TREATMENT_COLUMN: number = 1;
const FIRST_DATA_COLUMN: number = 2;
const NODE_PADDING: number = 0;
const NODE_WIDTH: number = 50;
const HEIGHT: number = 280;
const WIDTH: number = 1200;
const TITLE_FONT_SIZE: number = 20;
const LABEL_FONT_SIZE: number = 12;
const LABEL_FONT_FAMILY: string = 'Consolas, "Lucida Console", "Courier New", Courier, monospace';
const PATH_STROKE_OPACITY: number = 0.5;
const LEGEND_WIDTH: number = 140;
const LEGEND_BOX_SIZE: number = 20;
const LEGEND_TEXT_PADDING: number = 4;
const MARGIN = {
    bottom: 0,
    left: 10,
    right: 10,
    top: 36,
}

function color(value: number) {
    return d3.interpolateViridis(value);
}

function createAllNodes(headings: string[], factors: Factor[]): Node[] {
    let nodes: Node[] = [];
    let index: number = 0;

    headings.forEach((heading, i) => {
        if (i >= FIRST_DATA_COLUMN) {
            factors.forEach((factor, j) => {
                let node = {
                        depth: i - 1,
                        factor: factor,
                        fill: factor.fill,
                        id: `${i}x${j}`,
                        index: index++,
                        label: "",
                        stack: j,
                        treatment: "",
                        value: 0,
                        week: heading,
                        x0: 0,
                        x1: 0,
                        y0: 0,
                        y1: 0
                };
                nodes.push(node);
            });
        }
    });

    return nodes;
}

function drawLegend() {
    let totalLength = FACTORS.length * LEGEND_WIDTH;
    let xOffset = (WIDTH - totalLength) / 2.0;
    console.log(`"Total length: ${totalLength}, x offset: ${xOffset}.`);

    let svg = d3.select("body")
        .append("svg")
        .classed("legend", true)
        .attr("height", 2 * LABEL_FONT_SIZE)
        .attr("width", WIDTH);

    svg.selectAll("rect")
        .data(FACTORS)
        .enter()
        .append("rect")
        .attr("x", d => xOffset + d.index * LEGEND_WIDTH)
        .attr("y", 4)
        .attr("width", LEGEND_BOX_SIZE)
        .attr("height", LEGEND_BOX_SIZE)
        .attr("fill", d => d.fill);

    svg.selectAll("text")
        .data(FACTORS)
        .enter()
        .append("text")
        .attr("font-family", LABEL_FONT_FAMILY)
        .attr("font-size", LABEL_FONT_SIZE)
        .attr("x", d => (d.index * LEGEND_WIDTH) + LEGEND_BOX_SIZE + xOffset + LEGEND_TEXT_PADDING)
        .attr("y", 1.4 * LABEL_FONT_SIZE)
        .text(d => d.label)
}

function drawSankeyGraph(graphData: GraphData, treatment?: string) {
    let graphSize: [number, number] = [
        WIDTH - MARGIN.left - MARGIN.right,
        HEIGHT - MARGIN.top - MARGIN.bottom
    ];

    let layout: SankeyLayout<SankeyGraph<Node, Link>, Node, Link> = sankey<Node, Link>()
        .size(graphSize)
        .nodeId(d => d.index)
        .nodePadding(NODE_PADDING)
        .nodeWidth(NODE_WIDTH)
        .nodeSort(sortNodes);
    let graph: SankeyGraph<Node, Link> = layout(graphData);

    graph.nodes.forEach(node => {
        let nodesAtDepth = graphData.nodes.filter(n => n.depth === node.depth);
        let sumAtDepth = d3.sum(nodesAtDepth, d => d.value);
        let percent = node.value / sumAtDepth * 100;
        node.label = `${percent.toFixed(0)}%`;
    });

    let weeks = graph.nodes.map(n => n.week).reduce(reduceUnique(), []).map((week, i) => {
        let x0 = d3.min(graph.nodes.filter(n => n.depth === i), n => n.x0) || 0;
        let x1 = d3.min(graph.nodes.filter(n => n.depth === i), n => n.x1) || 0;
        return {
            label: week,
            x: (x0 + x1) / 2,
            y: LABEL_FONT_SIZE + TITLE_FONT_SIZE
        };
    });

    let svg = d3.select("body")
        .append("svg")
        .classed("visual", true)
        .attr("width", WIDTH)
        .attr("height", HEIGHT);

    if (treatment) {
        svg.append("text")
            .classed("treatment", true)
            .attr("x", MARGIN.left)
            .attr("y", TITLE_FONT_SIZE)
            .attr("font-weight", "bold")
            .attr("font-family", LABEL_FONT_FAMILY)
            .attr("font-size", TITLE_FONT_SIZE)
            .attr("text-anchor", "left")
            .text(treatment);
    }

    svg.selectAll("text.column-heading")
        .data(weeks)
        .enter()
        .append("text")
        .classed("column-heading", true)
        .attr("x", d => d.x + MARGIN.left)
        .attr("y", d => d.y)
        .attr("font-size", LABEL_FONT_SIZE)
        .attr("font-family", LABEL_FONT_FAMILY)
        .attr("text-anchor", "middle")
        .text(d => d.label);

    let gradients = svg.selectAll("linearGradient")
        .data(graph.links)
        .enter()
        .append("linearGradient")
        .attr("id", d => `gradient-${d.source.id}-${d.target.id}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", d => d.source.x1)
        .attr("x2", d => d.target.x0);
    gradients.append("stop").attr("offset", 0.0).attr("stop-color", d => d.source.fill);
    gradients.append("stop").attr("offset", 1.0).attr("stop-color", d => d.target.fill);

    let view = svg.append("g")
        .classed("view", true)
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    view.selectAll("rect.node")
        .data(graph.nodes)
        .enter()
        .append("rect")
        .classed("node", true)
        .attr("fill", d => d.fill)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("x", d => d.x0)
        .attr("y", d => d.y0);

    view.selectAll("text.node-label")
        .data(graph.nodes)
        .enter()
        .filter(d => (d.y1 - d.y0) > 0.5 * LABEL_FONT_SIZE)
        .append("text")
        .classed("node-label", true)
        .attr("font-size", LABEL_FONT_SIZE)
        .attr("font-family", LABEL_FONT_FAMILY)
        .attr("x", d => (d.x0 + d.x1) / 2)
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("dy", LABEL_FONT_SIZE / 2)
        .attr("text-anchor", "middle")
        .text(d => d.label);

    view.selectAll("path.link")
        .data(graph.links)
        .enter()
        .append("path")
        .classed("link", true)
        .attr("d", sankeyLinkHorizontal())
        .attr("fill", "none")
        .attr("stroke", d => `url(#gradient-${d.source.id}-${d.target.id})`)
        .attr("stroke-opacity", PATH_STROKE_OPACITY)
        .attr("stroke-width", d => d.width);
}

function getFactorForValue(value: number): Factor {
    for (let factor of FACTORS) {
        if (factor.minValue <= value && value < factor.maxValue) {
            return factor;
        }
    }
    throw Error(`No factor found for value ${value}.`);
}

function reduceUnique<T>(): (previous: T[], current: T) => T[] {
    return (previous: T[], current: T): T[] => {
        if (previous.indexOf(current) === -1) {
            previous.push(current);
        }
        return previous;
    }
}

function setTitle(): void {
    let title = CSV_FILE_NAME;
    title = title.replace("data/", "");
    title = title.replace(".csv", "");
    d3.select("title").text(title);
}

function sortNodes(a: SankeyNode<Node, Link>, b: SankeyNode<Node, Link>): number {
    if (a.index < b.index) return +1;
    if (a.index > b.index) return -1;
    return 0;
}

function transformData(headings: string[], csv: string[][]): GraphData {
    let nodes: Node[] = createAllNodes(headings, FACTORS);
    let links: Link[] = [];

    for (let i = 0; i < csv.length; i++) {
        let line: string[] = csv[i];
        for (let j = FIRST_DATA_COLUMN; j < line.length; j++) {
            let week = headings[j];
            let value = +line[j];
            let factor = getFactorForValue(value);
            let node = nodes.find(n => n.week === week && n.factor === factor) as Node;
            node.value++;
            if (j >= FIRST_DATA_COLUMN + 1) {
                let prevValue = +line[j - 1];
                let prevFactor = getFactorForValue(prevValue);
                let prevNode = nodes.find(n => n.week === headings[j - 1] && n.factor === prevFactor) as Node;
                let link = links.find(l => l.source === prevNode && l.target === node) as Link;
                if (link) {
                    link.value++;
                }
                else {
                    link = {
                        source: prevNode,
                        target: node,
                        value: 1,
                        width: 0
                    }
                    links.push(link);
                }
            }

        }
    }

    return {
        nodes: nodes,
        links: links
    };
}

d3.text(CSV_FILE_NAME)
    .then((text: string) => {
        setTitle();
        let csv = d3.csvParseRows(text);
        let headings = csv.slice(0, 1)[0];
        console.log(`Headings: ${headings.join(", ")}.`);
        let body = csv.slice(1);
        let treatments = body.map(line => line[TREATMENT_COLUMN]).reduce(reduceUnique(), []);
        treatments.forEach(treatment => {
            let filteredCSV = body.filter(line => line[TREATMENT_COLUMN] === treatment);
            console.log(`Treatment ${treatment} has ${filteredCSV.length} lines.`);
            let graphData = transformData(headings, filteredCSV);
            drawSankeyGraph(graphData, treatment);
        });
        drawLegend();
    });
