import { Node, Edge } from 'reactflow';

interface MindMapData {
  nodes: Node[];
  edges: Edge[];
}

function sanitizeText(text: string): string {
  return text.trim()
    .replace(/\s+/g, ' ')
    .slice(0, 100) + (text.length > 100 ? '...' : '');
}

function extractKeyPhrases(text: string): string[] {
  // Split by common delimiters and filter out noise
  return text.split(/[.!?;:]/)
    .map(phrase => phrase.trim())
    .filter(phrase => {
      // Filter out phrases that are too short or contain only numbers/special chars
      return phrase.length >= 10 &&
             phrase.length <= 100 &&
             /[a-zA-Z]{3,}/.test(phrase) &&
             !/^\d+$/.test(phrase);
    })
    .slice(0, 8); // Limit to 8 key phrases per section
}

export function generateMindMap(textContent: string[]): MindMapData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;

  // Create root node
  const rootId = `${nodeId}`;
  nodes.push({
    id: rootId,
    position: { x: 0, y: 0 },
    data: { label: 'Document Overview' },
    type: 'default',
    style: {
      background: '#3b82f6',
      color: 'white',
      border: '1px solid #2563eb',
      borderRadius: '8px',
      padding: '10px 20px',
    },
  });

  // Process each text section
  let sectionCount = 0;
  textContent.forEach((text) => {
    const keyPhrases = extractKeyPhrases(text);
    
    keyPhrases.forEach((phrase, index) => {
      nodeId++;
      const currentId = `${nodeId}`;
      
      // Calculate position using polar coordinates
      const angle = ((2 * Math.PI) / keyPhrases.length) * index + (sectionCount * Math.PI / 4);
      const radius = 300;
      
      nodes.push({
        id: currentId,
        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        },
        data: { label: sanitizeText(phrase) },
        type: 'default',
        style: {
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '8px 16px',
          fontSize: '14px',
          width: 'auto',
          maxWidth: '250px',
        },
      });

      edges.push({
        id: `e${rootId}-${currentId}`,
        source: rootId,
        target: currentId,
        type: 'smoothstep',
        style: { stroke: '#94a3b8' },
        animated: false,
      });
    });
    
    sectionCount++;
  });

  return { nodes, edges };
}