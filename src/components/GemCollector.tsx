import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gem, Sparkles } from 'lucide-react';
import { currentUser, addGems } from '@/lib/localdb';
import { toast } from '@/hooks/use-toast';

type GemButton = {
  id: string;
  value: number;
  x: number;
  y: number;
  createdAt: number;
};

const GemCollector = () => {
  const [gemButtons, setGemButtons] = useState<GemButton[]>([]);
  const [particles, setParticles] = useState<Array<{id: string, x: number, y: number}>>([]);

  useEffect(() => {
    // Spawn gem buttons every minute
    const spawnInterval = setInterval(() => {
      spawnGemButtons();
    }, 60000); // 60 seconds

    // Initial spawn
    spawnGemButtons();

    return () => clearInterval(spawnInterval);
  }, []);

  useEffect(() => {
    // Remove expired buttons (after 30 seconds)
    const cleanupInterval = setInterval(() => {
      setGemButtons(prev => 
        prev.filter(button => Date.now() - button.createdAt < 30000)
      );
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const spawnGemButtons = () => {
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 buttons
    const newButtons: GemButton[] = [];

    for (let i = 0; i < count; i++) {
      const button: GemButton = {
        id: `gem-${Date.now()}-${i}`,
        value: Math.floor(Math.random() * 20) + 5, // 5-24 gems
        x: Math.random() * 80 + 10, // 10-90% from left
        y: Math.random() * 60 + 20, // 20-80% from top
        createdAt: Date.now()
      };
      newButtons.push(button);
    }

    setGemButtons(prev => [...prev, ...newButtons]);
  };

  const collectGem = (button: GemButton) => {
    // Add gems to user
    addGems(button.value);
    
    // Create particle effect
    const particleId = `particle-${Date.now()}`;
    setParticles(prev => [...prev, { id: particleId, x: button.x, y: button.y }]);
    
    // Remove particle after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== particleId));
    }, 1000);

    // Remove button
    setGemButtons(prev => prev.filter(b => b.id !== button.id));

    // Show toast
    toast({
      title: "💎 Гемы собраны!",
      description: `+${button.value} гемов`,
    });
  };

  if (gemButtons.length === 0) return null;

  return (
    <>
      {/* Gem buttons */}
      {gemButtons.map(button => (
        <Button
          key={button.id}
          onClick={() => collectGem(button)}
          className="fixed z-40 p-3 rounded-full glass-button animate-pulse-glow hover:scale-110 transition-all duration-300"
          style={{
            left: `${button.x}%`,
            top: `${button.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Gem className="w-5 h-5 mr-1" />
          <span className="text-sm font-bold">+{button.value}</span>
        </Button>
      ))}

      {/* Particle effects */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="animate-bounce">
            <Sparkles className="w-8 h-8 text-primary animate-spin" />
          </div>
        </div>
      ))}
    </>
  );
};

export default GemCollector;