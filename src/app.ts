import * as d3 from "d3";


interface Node {
    name: string;
    row: number;
    column: number;
    value: number;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
}

interface Link {
    source: Node;
    target: Node;
    value: number;
}

interface Data {
    nodes: Node[],
    links: Link[],
}

let data: Data = {
    nodes: [],
    links: []
};


const COUNT_COLUMNS: number = 4;
const COUNT_ROWS: number = 5;
const WIDTH: number = 800;
const HEIGHT: number = 500;
const COLUMN_WIDTH: number = 40;
const START_COUNT: number = 500;

function randInt(min: number, max: number): number {
    let range = max - min;
    let r = min + range * Math.random();
    return Math.floor(r);
}

// Calculate buffer space.
let totalColumnWidth = COUNT_COLUMNS * COLUMN_WIDTH;
let unusedWidth = WIDTH - totalColumnWidth;
let spaceBetweenColumns = unusedWidth / (COUNT_COLUMNS - 1);

let xPos = 0;
let yPos = 0;

for (let i = 0; i < COUNT_COLUMNS; i++) {
    let remainingCount = START_COUNT;
    yPos = 0;
    for (let j = 0; j < COUNT_ROWS; j++) {
        let value = 0;
        if (j === COUNT_ROWS - 1) {
            value = remainingCount;
        }
        else {
            value = randInt(10, 100);
            remainingCount -= value;
        }
        let height = value / START_COUNT * HEIGHT;
        let node: Node = {
            name: `State ${j + 1}`,
            row: j,
            column: i,
            value: value,
            fill: d3.interpolateRainbow(j / COUNT_ROWS),
            x: xPos,
            y: yPos,
            width: COLUMN_WIDTH,
            height: height
        }
        data.nodes.push(node);
        yPos += height;
    }

    xPos += COLUMN_WIDTH + spaceBetweenColumns;
}

console.log(data);

let body = d3.select("body");
let svg = body.append("svg")
    .classed("visual", true)
    .attr("width", WIDTH)
    .attr("height", HEIGHT);

svg.selectAll("rect.node")
    .data(data.nodes)
    .enter()
    .append("rect")
    .classed("node", true)
    .attr("fill", d => d.fill)
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("width", d => d.width)
    .attr("height", d => d.height)
