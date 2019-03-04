import * as d3 from "d3";
import { sankey, SankeyGraph, SankeyLayout, sankeyLinkHorizontal, SankeyNode } from "d3-sankey";
import { Node, DataSet, Link } from "./classes";
import { rawData, RawData } from "./data";

const HEIGHT: number = 500;
const WIDTH: number = 1200;

function getStatuses(rawData: RawData[]): string[] {
    let statuses: string[] = [];
    rawData.forEach(datum => {
        datum.statuses.forEach(status => {
            if (statuses.indexOf(status.status) === -1) {
                statuses.push(status.status);
            }
        });
    });
    statuses = statuses.sort();
    return statuses;
}

function getWeeks(rawData: RawData[]): string[] {
    let weeks: string[] = [];
    rawData.forEach(datum => {
        datum.statuses.forEach(status => {
            if (weeks.indexOf(status.week) === -1) {
                weeks.push(status.week);
            }
        })
    });
    weeks = weeks.sort();
    return weeks;
}

function transformData(rawData: RawData[], weeks: string[], statuses: string[]): DataSet {
    // Create a new DataSet instance.
    let dataSet = new DataSet();

    // Loop through the data, collecting the nodes.
    rawData.forEach(rawDatum => {
        rawDatum.statuses.forEach(status => {
            let depth = weeks.indexOf(status.week);
            let stackPosition = statuses.indexOf(status.status);
            let node = dataSet.findNode(depth, stackPosition);
            if (node) {
                node.value++;
            }
            else {
                node = new Node(status.status, depth, stackPosition);
                dataSet.addNode(node);
            }
        });
    });

    // Now that we have all of the nodes, we need to loop through the raw data
    // and collect all of the links.
    rawData.forEach(rawDatum => {
        for (let i = 1; i < rawDatum.statuses.length; i++) {
            let sourceDepth = weeks.indexOf(rawDatum.statuses[i - 1].week);
            let targetDepth = weeks.indexOf(rawDatum.statuses[i].week);
            let sourceStackPosition = statuses.indexOf(rawDatum.statuses[i - 1].status);
            let targetStackPosition = statuses.indexOf(rawDatum.statuses[i].status);
            let sourceNode = dataSet.findNode(sourceDepth, sourceStackPosition);
            let targetNode = dataSet.findNode(targetDepth, targetStackPosition);
            if (!sourceNode) {
                throw Error(`No source node for depth ${sourceDepth} and stack position ${sourceStackPosition}.`);
            }
            if (!targetNode) {
                throw Error(`No target node for depth ${targetDepth} and stack position ${targetStackPosition}.`);
            }
            let link = dataSet.findLink(sourceNode, targetNode);
            if (link) {
                link.value++;
            }
            else {
                link = new Link(sourceNode, targetNode);
                dataSet.addLink(link);
            }
        }
    });

    for (let i = 0; i < weeks.length - 1; i++) {
        for (let j = 0; j < statuses.length; j++) {
            for (let k = 0; k < statuses.length; k++) {
                let source = dataSet.findNode(i, j);
                let target = dataSet.findNode(i + 1, k);
                if (source && target) {
                    let link = dataSet.findLink(source, target);
                    if (link) {
                        link.value++;
                    }
                    else {
                        link = new Link(source, target);
                        dataSet.addLink(link);
                    }
                }
            }
        }
    }
    return dataSet;
}

function updateColors(dataSet: DataSet, statuses: string[]): void {
    let colorMap: Map<string, string> = new Map<string, string>();
    let colorScale = d3.interpolateRainbow;
    statuses.forEach((status, idx) => {
        let color = colorScale((idx + 1) / statuses.length);
        colorMap.set(status, color);
    });
    dataSet.setColors(colorMap);
}

let weeks = getWeeks(rawData);
let statuses = getStatuses(rawData);
let dataSet = transformData(rawData, weeks, statuses);
updateColors(dataSet, statuses);

let layout: SankeyLayout<SankeyGraph<Node, Link>, Node, Link> = sankey<Node, Link>()
    .size([WIDTH, HEIGHT])
    .nodePadding(0)
    .nodeWidth(40)
    .nodeSort((a: SankeyNode<Node, Link>, b: SankeyNode<Node, Link>) => {
        if (a.label < b.label) return -1;
        if (a.label > b.label) return 1;
        return 0;
    });
let graph: SankeyGraph<Node, Link> = layout(dataSet);
console.log(graph);

let svg = d3.select("body")
    .append("svg")
    .classed("visual", true)
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

svg.selectAll("rect")
    .data(graph.nodes)
    .enter()
    .append("rect")
    .attr("fill", d => d.fill)
    .attr("height", d => (d.y1 || 0) - (d.y0 || 0))
    .attr("width", d => (d.x1 || 0) - (d.x0 || 0))
    .attr("x", d => d.x0 || 0)
    .attr("y", d => d.y0 || 0);

svg.selectAll("path")
    .data(graph.links)
    .enter()
    .append("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-opacity", 0.2)
    .attr("stroke-width", d => (d.width || 0))