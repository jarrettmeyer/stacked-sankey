import { SankeyExtraProperties, SankeyLayout, SankeyNode } from "d3-sankey";

declare module "d3-sankey" {
    export interface SankeyLayout<Data, N extends SankeyExtraProperties, L extends SankeyExtraProperties> {
        nodeSort(): ((nodeA: SankeyNode<N, L>, nodeB: SankeyNode<N, L>) => number) | undefined;
        nodeSort(sort: (nodeA: SankeyNode<N, L>, nodeB: SankeyNode<N, L>) => number): this;
    }
}
