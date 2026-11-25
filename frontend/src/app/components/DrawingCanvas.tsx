import { useRef, useState, useEffect } from 'react';
import { Palette, Eraser, Trash2 } from 'lucide-react';

const colors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  '#F8B739', '#52C41A', '#FF4757', '#000000'
];

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#FF6B6B');
  const [lineWidth, setLineWidth] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? 'white' : currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-[#0a0e27] mb-2" style={{ fontSize: '28px', fontWeight: '700' }}>
          Drawing Canvas
        </h3>
        <p className="text-gray-600" style={{ fontSize: '16px' }}>
          Create your masterpiece!
        </p>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                setCurrentColor(color);
                setIsEraser(false);
              }}
              className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                currentColor === color && !isEraser ? 'border-gray-800 scale-110' : 'border-gray-300'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mb-4">
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition-colors ${
              isEraser ? 'bg-[#8b7bd8] text-white' : 'bg-gray-200 text-gray-700'
            }`}
            style={{ fontSize: '14px', fontWeight: '600' }}
          >
            <Eraser className="w-4 h-4" />
            Eraser
          </button>

          <div className="flex items-center gap-2">
            <span className="text-gray-600" style={{ fontSize: '14px' }}>Size:</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-gray-600 w-8" style={{ fontSize: '14px' }}>{lineWidth}</span>
          </div>

          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-[#ff8fa3] text-white rounded-full flex items-center gap-2 hover:bg-[#ff7a90] transition-colors"
            style={{ fontSize: '14px', fontWeight: '600' }}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="border-4 border-gray-300 rounded-2xl cursor-crosshair touch-none max-w-full"
          style={{ backgroundColor: 'white' }}
        />
      </div>
    </div>
  );
}
