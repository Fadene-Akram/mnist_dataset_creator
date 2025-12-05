import React, { useRef, useState, useEffect } from "react";
import { Download, Trash2, Save } from "lucide-react";
import "./App.css";

export default function MNISTDigitDrawer() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [label, setLabel] = useState("0");
  const [dataset, setDataset] = useState([]);

  const CANVAS_SIZE = 280;
  const GRID_SIZE = 28;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context.fillStyle = "#000000";
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context.fillStyle = "#000000";
      context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top,
    };
  };

  const draw = (x, y) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      context.fillStyle = "#FFFFFF";
      context.beginPath();
      context.arc(x, y, 8, 0, Math.PI * 2);
      context.fill();
    }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = e.touches ? getTouchPos(e) : getMousePos(e);
    draw(pos.x, pos.y);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const drawing = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = e.touches ? getTouchPos(e) : getMousePos(e);
    draw(pos.x, pos.y);
  };

  const getPixelData = () => {
    const canvas = canvasRef.current;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = GRID_SIZE;
    tempCanvas.height = GRID_SIZE;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.drawImage(canvas, 0, 0, GRID_SIZE, GRID_SIZE);

    const imageData = tempCtx.getImageData(0, 0, GRID_SIZE, GRID_SIZE);
    const pixels = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const gray = Math.round((r + g + b) / 3);
      pixels.push(gray);
    }

    return pixels;
  };

  const saveDigit = () => {
    const pixels = getPixelData();
    const newEntry = {
      label: parseInt(label),
      pixels: pixels,
    };
    setDataset([...dataset, newEntry]);
    clearCanvas();
    alert(`Digit ${label} saved! Total samples: ${dataset.length + 1}`);
  };

  const downloadCSV = () => {
    if (dataset.length === 0) {
      alert("No data to download!");
      return;
    }

    const pixelHeaders = Array.from({ length: 784 }, (_, i) => `pixel${i}`);
    const header = ["label", ...pixelHeaders].join(",");

    const rows = dataset.map((entry) => {
      return [entry.label, ...entry.pixels].join(",");
    });

    const csv = [header, ...rows].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mnist_dataset_${dataset.length}_samples.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearDataset = () => {
    if (window.confirm("Are you sure you want to clear all saved digits?")) {
      setDataset([]);
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <h1 className="title">MNIST Dataset Creator</h1>
        <p className="subtitle">
          Draw digits on the 28×28 canvas and build your dataset
        </p>

        <div className="card">
          <div className="canvas-container">
            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={drawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={drawing}
                className="drawing-canvas"
              />
              <div className="canvas-label">28×28 pixels</div>
            </div>
          </div>

          <div className="controls">
            <div className="label-selector">
              <label className="label-text">Label:</label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="label-dropdown"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="button-row">
              <button onClick={clearCanvas} className="btn btn-clear">
                <Trash2 size={18} />
                Clear Canvas
              </button>
              <button onClick={saveDigit} className="btn btn-save">
                <Save size={18} />
                Save Digit
              </button>
            </div>
          </div>

          <div className="dataset-info">
            <div className="dataset-header">
              <span className="sample-count">
                Saved Samples: {dataset.length}
              </span>
              {dataset.length > 0 && (
                <button onClick={clearDataset} className="clear-all-btn">
                  Clear All
                </button>
              )}
            </div>
            <button
              onClick={downloadCSV}
              disabled={dataset.length === 0}
              className={`btn btn-download ${
                dataset.length === 0 ? "disabled" : ""
              }`}
            >
              <Download size={18} />
              Download CSV Dataset
            </button>
          </div>
        </div>

        <div className="instructions">
          <h3 className="instructions-title">Instructions:</h3>
          <ol className="instructions-list">
            <li>Draw a digit (0-9) on the black canvas using white strokes</li>
            <li>Select the correct label from the dropdown</li>
            <li>Click "Save Digit" to add it to your dataset</li>
            <li>Repeat to create more samples</li>
            <li>Click "Download CSV Dataset" to save as MNIST format</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
