import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VisualInspector = ({ screenshot, activeViolation }) => {
  const [scale, setScale] = useState(1);
  const imgRef = useRef(null);

  // Calculate the ratio between the captured size (1280px) and displayed size
  const calculateScale = () => {
    if (imgRef.current && imgRef.current.complete) {
      const { clientWidth, naturalWidth } = imgRef.current;
      // If image is 1280px naturally but 640px on screen, scale is 0.5
      setScale(clientWidth / naturalWidth);
    }
  };

  // Recalculate scale if the user resizes their browser window
  useEffect(() => {
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  return (
    <div className="relative border-2 border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-inner group">
      {screenshot ? (
        <div className="relative inline-block w-full">
          {/* THE BASE IMAGE */}
          <img 
            ref={imgRef}
            src={screenshot} 
            alt="Scan Viewport" 
            onLoad={calculateScale}
            className="w-full h-auto block select-none"
          />

          {/* THE HIGHLIGHT OVERLAY */}
          <AnimatePresence>
            {activeViolation?.nodes?.map((node, idx) => {
              // Ensure we have coordinate data (node.rect from our backend update)
              if (!node.rect) return null;

              return (
                <motion.div
                  key={`${activeViolation.id}-${idx}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{
                    position: 'absolute',
                    // Multiply backend coordinates by the current scale factor
                    top: (node.rect.top) * scale,
                    left: (node.rect.left) * scale,
                    width: (node.rect.width) * scale,
                    height: (node.rect.height) * scale,
                    pointerEvents: 'none',
                    zIndex: 20,
                    border: '3px solid #ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.3), 0 0 15px rgba(239, 68, 68, 0.6)',
                  }}
                >
                  {/* Small Label for the Rule ID */}
                  <div className="absolute -top-7 left-0 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded shadow-lg font-bold whitespace-nowrap">
                    {activeViolation.id}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p className="italic">Waiting for scan results...</p>
        </div>
      )}
    </div>
  );
};

export default VisualInspector;