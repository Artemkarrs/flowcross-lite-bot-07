import { useState, useEffect } from 'react';
import { Gem } from 'lucide-react';
import { currentUser, getGems } from '@/lib/localdb';

const GemCounter = () => {
  const [gems, setGems] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const updateGems = () => {
      const currentGems = getGems();
      if (currentGems !== gems) {
        setIsAnimating(true);
        setGems(currentGems);
        setTimeout(() => setIsAnimating(false), 300);
      }
    };

    // Update immediately
    updateGems();

    // Update every second to catch changes
    const interval = setInterval(updateGems, 1000);

    return () => clearInterval(interval);
  }, [gems]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`
        glass px-4 py-2 rounded-full flex items-center space-x-2 
        transition-all duration-300 border border-primary/20
        ${isAnimating ? 'scale-110 animate-pulse-glow' : 'scale-100'}
      `}>
        <Gem className="w-5 h-5 text-primary animate-sparkle" />
        <span className="font-bold text-primary text-lg">
          {gems.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default GemCounter;