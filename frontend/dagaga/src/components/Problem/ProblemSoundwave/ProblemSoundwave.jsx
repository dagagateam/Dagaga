import { useRef, useEffect } from "react";
import "./ProblemSoundwave.css";

const ProblemSoundwave = ({ analyser, isRecording }) => {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');

    // Draw idle state (static bars)
    const drawIdle = () => {
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0) return; // Wait for width

      ctx.clearRect(0, 0, width, height);
      
      const barWidth = 8;
      const gap = 4;
      const barCount = Math.floor(width / (barWidth + gap));
      const centerY = height / 2;
      
      for (let i = 0; i < barCount; i++) {
        const barHeight = 10;
        const x = i * (barWidth + gap);
        
        const mainOrange = getComputedStyle(document.documentElement).getPropertyValue('--main-orange').trim();
        ctx.fillStyle = mainOrange || '#F3AE5C';
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 3);
        ctx.fill();
      }
    };

    // Draw active recording visualization
    const drawRecording = () => {
      if (!analyser) return;
      
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = 8;
      const gap = 4;
      const barCount = Math.floor(width / (barWidth + gap));
      const centerY = height / 2;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount);
        const value = dataArray[dataIndex];
        const barHeight = Math.max((value / 255) * (height / 2 - 5), 8);
        
        const x = i * (barWidth + gap);
        
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 3);
        ctx.fill();
      }
      
      animationIdRef.current = requestAnimationFrame(drawRecording);
    };

    // Set canvas width to container width and trigger redraw
    const updateCanvasSize = () => {
      if (!container || !canvas) return;
      const newWidth = container.clientWidth;
      if (newWidth > 0 && canvas.width !== newWidth) {
        canvas.width = newWidth;
        canvas.height = 100;
        if (!isRecording || !analyser) {
          drawIdle();
        }
      }
    };

    // Initial size update
    updateCanvasSize();
    
    // Update on resize
    window.addEventListener('resize', updateCanvasSize);
    
    // Start appropriate animation
    if (isRecording && analyser) {
      drawRecording();
    } else {
      drawIdle();
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [analyser, isRecording]);

  return (
    <div className="soundwave-container" ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        className="soundwave-canvas"
      />
    </div>
  );
};

export default ProblemSoundwave;
