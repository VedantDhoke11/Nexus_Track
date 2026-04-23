"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [follower, setFollower] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleHoverStart = () => setIsHovering(true);
    const handleHoverEnd = () => setIsHovering(false);

    window.addEventListener("mousemove", moveCursor);

    // Add listeners for interactive elements
    const targets = document.querySelectorAll('button, a, input, select, .interactive');
    targets.forEach(t => {
      t.addEventListener('mouseenter', handleHoverStart);
      t.addEventListener('mouseleave', handleHoverEnd);
    });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      targets.forEach(t => {
        t.removeEventListener('mouseenter', handleHoverStart);
        t.removeEventListener('mouseleave', handleHoverEnd);
      });
    };
  }, []);

  useEffect(() => {
    const followerMove = setTimeout(() => {
      setFollower(position);
    }, 50);
    return () => clearTimeout(followerMove);
  }, [position]);

  return (
    <div className={isHovering ? "cursor-hovering" : ""}>
      <div 
        className="custom-cursor" 
        style={{ left: `${position.x}px`, top: `${position.y}px`, transform: `translate(-50%, -50%)` }}
      />
      <div 
        className="custom-cursor-follower" 
        style={{ left: `${follower.x}px`, top: `${follower.y}px`, transform: `translate(-50%, -50%)` }}
      />
    </div>
  );
}
