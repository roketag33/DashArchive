export interface TreeNode {
  name: string
  size: number
  path: string
  children?: TreeNode[]
  category?: string
}

export function buildFileTree(files: { path: string; size: number; name: string }[]): TreeNode[] {
  const root: TreeNode = {
    name: 'root',
    size: 0,
    path: '',
    children: []
  }

  // Helper to find or create a child node
  const findOrCreateChild = (node: TreeNode, name: string): TreeNode => {
    if (!node.children) node.children = []
    let child = node.children.find((c) => c.name === name)
    if (!child) {
      child = { name, size: 0, path: '', children: [] }
      node.children.push(child)
    }
    return child
  }

  files.forEach((file) => {
    const parts = file.path.split(/[/\\]/)
    // On Mac, first part is usually empty string for absolute paths starting with /
    // Adjust based on OS or input. Assuming absolute paths like /Users/...
    // Let's iterate parts.

    let currentNode = root

    // Simple way: just group by direct parent folder relative to workspace?
    // Actually, Tresemap usually visualizes the scanned folder.
    // If we have multiple folders scanned, we might want one root per folder.

    // For now, let's just make a flat list of "files" into a tree based on their path structure.
    // BUT 'files' input might come from different roots.

    // Let's assume we want to visualize strictly the structure.

    parts.forEach((part, index) => {
      if (!part) return // skip empty parts from split

      const isFile = index === parts.length - 1

      if (isFile) {
        if (!currentNode.children) currentNode.children = []
        currentNode.children.push({
          name: file.name,
          size: file.size,
          path: file.path,
          category: 'file' // simplified
        })
        // Propagate size up? Recharts might calc it automatically or we need to sum.
        // Recharts Treemap usually needs value on leaf.
      } else {
        currentNode = findOrCreateChild(currentNode, part)
      }
    })
  })

  // Treemap needs nested children with 'size' (value) at leaves.
  // Recharts might need 'value' key. Let's ensure leaf nodes have 'size' property which we will map to 'value'.

  return root.children || []
}

export function transformFilesToTreemap(
  files: { path: string; size: number; name: string }[]
): TreeNode[] {
  // Recharts Treemap expects an array of objects.
  // Let's simplify: A simple level grouping for now.
  // Or just a flat list? Treemap supports nested data.

  // Let's build a proper tree.
  // However, for performance and simplicity given we are visualizing "Folders",
  // maybe we just want to show the top-level folders and their files?

  // Let's implement a real tree builder.
  const tree = buildFileTree(files)

  // Calculate sizes for directories (sum of children)
  const calculateSize = (node: TreeNode): number => {
    if (!node.children || node.children.length === 0) {
      return node.size // File size
    }
    const sum = node.children.reduce((acc, child) => acc + calculateSize(child), 0)
    node.size = sum
    return sum
  }

  tree.forEach((rootNode) => calculateSize(rootNode))

  return tree
}
