
export class Node {
    depth: number;
    fill: string = "#c0c0c0";
    label: string;
    stackPosition: number;
    value: number = 1;

    constructor(label: string, depth: number, stackPosition: number) {
        this.label = label;
        this.depth = depth;
        this.stackPosition = stackPosition;
    }
}

export class Link {
    source: Node;
    target: Node;
    value: number = 1;

    constructor(source: Node, target: Node) {
        this.source = source;
        this.target = target;
        this.value;
    }
}

export class DataSet {
    nodes: Node[] = [];
    links: Link[] = [];

    get maxDepth(): number {
        let depths: number[] = this.nodes.map(n => n.depth);
        return Math.max.apply(null, depths);
    }

    addLink(link: Link): DataSet {
        if (this.findLink(link.source, link.target)) {
            // This link already exists. Do nothing.
            return this;
        }
        this.links.push(link);
        return this;
    }

    addNode(node: Node): DataSet {
        if (this.findNode(node.depth, node.stackPosition)) {
            // This node already exists. Do nothing.
            return this;
        }
        this.nodes.push(node);
        return this;
    }

    findLink(source: Node, target: Node): Link | undefined {
        return this.links.find(l => l.source === source && l.target === target);
    }

    findNode(depth: number, stackPosition: number): Node | undefined {
        return this.nodes.find(n => n.depth === depth && n.stackPosition === stackPosition);
    }

    setColors(colorMap: Map<string, string>): void {
        for (let i = 0; i < this.nodes.length; i++) {
            let color: string = colorMap.get(this.nodes[i].label) || "#c0c0c0";
            this.nodes[i].fill = color;
        }
    }
}
