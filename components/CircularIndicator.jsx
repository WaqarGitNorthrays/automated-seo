"use client";

import { useEffect, useRef } from "react";

const CircularIndicator = ({
  value,
  max,
  label,
  unit = "",
  size = 100,
  strokeWidth = 10,
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const getColor = () => {
    if (label === "LCP") return value < 2.5 ? "#10B981" : value < 4 ? "#F59E0B" : "#EF4444";
    if (label === "INP") return value < 0.2 ? "#10B981" : value < 0.5 ? "#F59E0B" : "#EF4444";
    if (label === "CLS") return value < 0.1 ? "#10B981" : value < 0.25 ? "#F59E0B" : "#EF4444";
    if (label === "Mobile" || label === "Desktop") {
      if (value >= 90) return "#10B981";
      if (value >= 50) return "#F59E0B";
      return "#EF4444";
    }
    return "#3B82F6";
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const color = getColor();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (Math.min(canvas.width, canvas.height) - strokeWidth) / 2;

    let currentProgress = 0;
    const targetProgress = Math.min(value / max, 1);
    const animationSpeed = 0.08;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background Circle
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(229, 231, 235, 0.7)";
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      // Progress Circle with Gradient
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "#60A5FA");

      const endAngle = -Math.PI / 2 + Math.PI * 2 * currentProgress;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.shadowBlur = 6;
      ctx.shadowColor = color;
      ctx.stroke();

      // Value Text
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${size * 0.18}px Inter, sans-serif`;

      const numValue = Number(value);
      const displayValue =
        label === "CLS"
          ? isNaN(numValue)
            ? "N/A"
            : numValue.toFixed(2)
          : label === "LCP" || label === "INP"
          ? numValue.toFixed(1)
          : numValue;

      ctx.fillText(`${displayValue}${unit}`, centerX, centerY - 8);

      // Label Text
      ctx.font = `${size * 0.13}px Inter, sans-serif`;
      ctx.fillStyle = "#6B7280";
      ctx.fillText(label, centerX, centerY + 14);

      // Animate progress
      if (currentProgress < targetProgress) {
        currentProgress += animationSpeed * (targetProgress - currentProgress + 0.02);
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationRef.current);
  }, [value, max, label, unit, strokeWidth, size]);

  return (
    <div className="flex flex-col items-center p-3 bg-white/60 backdrop-blur-lg rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)] transition-all duration-300">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="select-none"
      />
    </div>
  );
};

export default CircularIndicator;
