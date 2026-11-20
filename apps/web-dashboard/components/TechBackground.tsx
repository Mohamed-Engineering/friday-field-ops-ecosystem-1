"use client";

import { useEffect, useRef } from "react";

export default function TechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nodes = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const gradient = context.createRadialGradient(
        width * 0.7, height * 0.35, 0,
        width * 0.7, height * 0.35, Math.max(width, height) * 0.7,
      );
      gradient.addColorStop(0, "rgba(0, 240, 255, 0.07)");
      gradient.addColorStop(1, "rgba(10, 15, 28, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      nodes.forEach((node) => {
        if (!reduceMotion) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < 0 || node.x > 1) node.vx *= -1;
          if (node.y < 0 || node.y > 1) node.vy *= -1;
        }
      });

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        const ax = a.x * width;
        const ay = a.y * height;
        context.fillStyle = "rgba(88, 226, 238, 0.55)";
        context.beginPath();
        context.arc(ax, ay, 1, 0, Math.PI * 2);
        context.fill();
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const bx = b.x * width;
          const by = b.y * height;
          const distance = Math.hypot(ax - bx, ay - by);
          if (distance < 115) {
            context.strokeStyle = `rgba(0, 240, 255, ${0.11 * (1 - distance / 115)})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(ax, ay);
            context.lineTo(bx, by);
            context.stroke();
          }
        }
      }
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = window.requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="tech-background" aria-hidden="true" />;
}
