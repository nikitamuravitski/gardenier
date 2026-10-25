import type { Position } from '@/components/Position'
import type { RoadNode } from '@/components/RoadNode'
import type { RoadEdge } from '@/components/RoadEdge'
import { distance } from '@/utils/geometry'

/**
 * RoadGraph - manages logical road network
 * Separate from visual representation
 * Used for pathfinding, connectivity, gameplay logic
 */
export class RoadGraph {
  private nodes = new Map<string, RoadNode>()
  private edges = new Map<string, RoadEdge>()
  private nextNodeId = 1
  private nextEdgeId = 1

  /**
   * Create a new node
   */
  createNode(position: Position, type: RoadNode['type']): string {
    const id = `node_${this.nextNodeId++}`
    const node: RoadNode = {
      id,
      position,
      type,
      connectedEdges: [],
    }
    this.nodes.set(id, node)
    return id
  }

  /**
   * Create a new edge between two nodes
   */
  createEdge(
    nodeA: string,
    nodeB: string,
    visualSegmentId: number,
    width: number
  ): string {
    const id = `edge_${this.nextEdgeId++}`
    const edge: RoadEdge = {
      id,
      nodeA,
      nodeB,
      visualSegmentId,
      width,
    }
    this.edges.set(id, edge)

    // Add edge to both nodes' connection lists
    const nodeAData = this.nodes.get(nodeA)
    const nodeBData = this.nodes.get(nodeB)
    if (nodeAData) nodeAData.connectedEdges.push(id)
    if (nodeBData) nodeBData.connectedEdges.push(id)

    return id
  }

  /**
   * Split an edge at an intersection point
   * If existingNodeId provided, uses that node instead of creating new one
   * Returns node ID and new edge IDs
   */
  splitEdge(
    edgeId: string,
    intersectionPoint: Position,
    visualSegmentIdA: number,
    visualSegmentIdB: number,
    existingNodeId?: string
  ): { nodeId: string; edgeA: string; edgeB: string } | null {
    const edge = this.edges.get(edgeId)
    if (!edge) return null

    // Use existing node or create new intersection node
    const nodeId = existingNodeId || this.createNode(intersectionPoint, 'intersection')

    // Create two new edges
    const edgeA = this.createEdge(edge.nodeA, nodeId, visualSegmentIdA, edge.width)
    const edgeB = this.createEdge(nodeId, edge.nodeB, visualSegmentIdB, edge.width)

    // Remove original edge from node connections
    const nodeAData = this.nodes.get(edge.nodeA)
    const nodeBData = this.nodes.get(edge.nodeB)
    if (nodeAData) {
      nodeAData.connectedEdges = nodeAData.connectedEdges.filter((e) => e !== edgeId)
    }
    if (nodeBData) {
      nodeBData.connectedEdges = nodeBData.connectedEdges.filter((e) => e !== edgeId)
    }

    // Delete original edge
    this.edges.delete(edgeId)

    console.log(`Split edge ${edgeId} at ${existingNodeId ? 'existing' : 'new'} node ${nodeId} → edges ${edgeA}, ${edgeB}`)

    return { nodeId, edgeA, edgeB }
  }

  /**
   * Find node at position (within tolerance)
   */
  findNodeAt(position: Position, tolerance: number = 5): string | null {
    for (const [id, node] of this.nodes) {
      if (distance(node.position, position) < tolerance) {
        return id
      }
    }
    return null
  }

  /**
   * Get node by ID
   */
  getNode(id: string): RoadNode | undefined {
    return this.nodes.get(id)
  }

  /**
   * Get edge by ID
   */
  getEdge(id: string): RoadEdge | undefined {
    return this.edges.get(id)
  }

  /**
   * Get all nodes
   */
  getAllNodes(): RoadNode[] {
    return Array.from(this.nodes.values())
  }

  /**
   * Get all edges
   */
  getAllEdges(): RoadEdge[] {
    return Array.from(this.edges.values())
  }

  /**
   * Get edges connected to a node
   */
  getNodeEdges(nodeId: string): RoadEdge[] {
    const node = this.nodes.get(nodeId)
    if (!node) return []

    return node.connectedEdges.map((edgeId) => this.edges.get(edgeId)).filter(Boolean) as RoadEdge[]
  }

  /**
   * Debug: print graph state
   */
  debugPrint(): void {
    console.log('=== Road Graph ===')
    console.log(`Nodes: ${this.nodes.size}`)
    for (const node of this.nodes.values()) {
      console.log(`  ${node.id} (${node.type}) at (${node.position.x.toFixed(0)}, ${node.position.y.toFixed(0)}) - ${node.connectedEdges.length} edges`)
    }
    console.log(`Edges: ${this.edges.size}`)
    for (const edge of this.edges.values()) {
      console.log(`  ${edge.id}: ${edge.nodeA} → ${edge.nodeB} (visual: ${edge.visualSegmentId})`)
    }
  }
}
