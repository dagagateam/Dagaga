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
    
    // Set canvas width to container width
    const updateCanvasSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = 100;
    };
    updateCanvasSize();
    
    // Update on resize
    window.addEventListener('resize', updateCanvasSize);
    
    const ctx = canvas.getContext('2d');
    
    // Draw idle state (static bars)
    const drawIdle = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = 8;
      const gap = 4;
      const barCount = Math.floor(width / (barWidth + gap));
      const centerY = height / 2;
      
      for (let i = 0; i < barCount; i++) {
        // Static small bars
        const barHeight = 10;
        
        const x = i * (barWidth + gap);
        
        // Draw bar
        const mainOrange = getComputedStyle(document.documentElement).getPropertyValue('--main-orange').trim();
        ctx.fillStyle = mainOrange || '#F3AE5C';
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 3);
        ctx.fill();
      }
      // No animation loop - just draw once
    };
    
    // Draw active recording visualization
    const drawRecording = () => {
      if (!analyser) return;
      
      const width = canvas.width;
      const height = canvas.height;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = 8;
      const gap = 4;
      const barCount = Math.floor(width / (barWidth + gap));
      const centerY = height / 2;
      
      for (let i = 0; i < barCount; i++) {
        // Map frequency data to bar height
        const dataIndex = Math.floor(i * bufferLength / barCount);
        const value = dataArray[dataIndex];
        const barHeight = Math.max((value / 255) * (height / 2 - 5), 8);
        
        const x = i * (barWidth + gap);
        
        // Draw bar - red when recording
        ctx.fillStyle = '#E74C3C';
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 3);
        ctx.fill();
      }
      
      animationIdRef.current = requestAnimationFrame(drawRecording);
    };
    
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
