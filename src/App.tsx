import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { MindMap } from './components/MindMap';
import { extractTextFromPDF } from './utils/pdfParser';
import { generateMindMap } from './utils/mindMapGenerator';
import { Node, Edge, NodeChange, EdgeChange, Connection, applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import { Download, FileText, BrainCircuit } from 'lucide-react';
import html2canvas from 'html2canvas';
import 'reactflow/dist/style.css';

function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setFileName(file.name);
    setError('');
    
    try {
      const textContent = await extractTextFromPDF(file);
      const { nodes: newNodes, edges: newEdges } = generateMindMap(textContent);
      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setNodes([]);
      setEdges([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const exportImage = async () => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (element) {
      const canvas = await html2canvas(element);
      const link = document.createElement('a');
      link.download = `${fileName.replace('.pdf', '')}-mindmap.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BrainCircuit className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              PDF to Mind Map
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your PDF documents into interactive mind maps. Upload your PDF
            and watch as it automatically generates a beautiful, organized visualization
            of your content.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {nodes.length === 0 ? (
          <div className="flex justify-center mb-8">
            <FileUpload onFileSelect={handleFileSelect} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">{fileName}</span>
              </div>
              <button
                onClick={exportImage}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg
                         hover:bg-blue-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export as Image
              </button>
            </div>
            
            <MindMap
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
            />
          </div>
        )}

        {isProcessing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
              <p className="mt-4 text-gray-700">Processing your PDF...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;