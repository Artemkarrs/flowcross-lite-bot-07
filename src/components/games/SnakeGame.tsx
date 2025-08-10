import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Trophy, Award, Target, Zap, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Position {
  x: number;
  y: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: (stats: GameStats) => boolean;
  icon: React.ReactNode;
}

interface GameStats {
  highScore: number;
  totalScore: number;
  gamesPlayed: number;
  foodEaten: number;
  perfectGames: number; // Игры без столкновений со стенами
}

const GRID_SIZE = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }];
const INITIAL_FOOD = { x: 10, y: 10 };
const GAME_SPEED = 200;

const SnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [gameRunning, setGameRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeHighScore') || '0');
  });
  const [totalScore, setTotalScore] = useState(() => {
    return parseInt(localStorage.getItem('snakeTotalScore') || '0');
  });
  const [gamesPlayed, setGamesPlayed] = useState(() => {
    return parseInt(localStorage.getItem('snakeGamesPlayed') || '0');
  });
  const [foodEaten, setFoodEaten] = useState(() => {
    return parseInt(localStorage.getItem('snakeFoodEaten') || '0');
  });
  const [perfectGames, setPerfectGames] = useState(() => {
    return parseInt(localStorage.getItem('snakePerfectGames') || '0');
  });
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(() => 
    JSON.parse(localStorage.getItem('snakeAchievements') || '[]')
  );
  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [hitWall, setHitWall] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Touch handling for swipe controls
  const [touchStart, setTouchStart] = useState<Position | null>(null);

  const achievements: Achievement[] = [
    {
      id: 'first_food',
      name: 'Первая еда',
      description: 'Съешьте свою первую еду',
      requirement: (stats) => stats.foodEaten >= 1,
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'score_50',
      name: 'Полсотни',
      description: 'Наберите 50 очков в одной игре',
      requirement: (stats) => stats.highScore >= 50,
      icon: <Trophy className="w-4 h-4" />
    },
    {
      id: 'score_100',
      name: 'Сотня',
      description: 'Наберите 100 очков в одной игре',
      requirement: (stats) => stats.highScore >= 100,
      icon: <Award className="w-4 h-4" />
    },
    {
      id: 'games_10',
      name: 'Упорство',
      description: 'Сыграйте 10 игр',
      requirement: (stats) => stats.gamesPlayed >= 10,
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'perfect_game',
      name: 'Идеальная игра',
      description: 'Завершите игру, ни разу не ударившись о стену',
      requirement: (stats) => stats.perfectGames >= 1,
      icon: <Clock className="w-4 h-4" />
    },
    {
      id: 'food_master',
      name: 'Мастер еды',
      description: 'Съешьте 100 единиц еды',
      requirement: (stats) => stats.foodEaten >= 100,
      icon: <Target className="w-4 h-4" />
    }
  ];

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setGameRunning(false);
    setShowHint(true);
    setHitWall(false);
  };

  const startGame = () => {
    setGameRunning(true);
    setShowHint(false);
  };

  const pauseGame = () => {
    setGameRunning(!gameRunning);
  };

  // Game loop
  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const gameInterval = setInterval(() => {
      setSnake(currentSnake => {
        const newSnake = [...currentSnake];
        const head = { ...newSnake[0] };
        
        head.x += direction.x;
        head.y += direction.y;

        // Check wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setHitWall(true);
          setGameOver(true);
          setGameRunning(false);
          return currentSnake;
        }

        // Check self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          setGameRunning(false);
          return currentSnake;
        }

        newSnake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => {
            const newScore = prev + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snakeHighScore', newScore.toString());
            }
            return newScore;
          });
          setFoodEaten(prev => prev + 1);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(gameInterval);
  }, [direction, food, gameRunning, gameOver, generateFood, highScore]);

  // Game over effect - save stats and check achievements
  useEffect(() => {
    if (gameOver && score > 0) {
      const newGamesPlayed = gamesPlayed + 1;
      const newTotalScore = totalScore + score;
      const newPerfectGames = perfectGames + (!hitWall ? 1 : 0);
      
      setGamesPlayed(newGamesPlayed);
      setTotalScore(newTotalScore);
      if (!hitWall) {
        setPerfectGames(newPerfectGames);
      }
      
      // Save to localStorage
      localStorage.setItem('snakeGamesPlayed', newGamesPlayed.toString());
      localStorage.setItem('snakeTotalScore', newTotalScore.toString());
      localStorage.setItem('snakeFoodEaten', foodEaten.toString());
      localStorage.setItem('snakePerfectGames', newPerfectGames.toString());
    }
  }, [gameOver, score, gamesPlayed, totalScore, foodEaten, perfectGames, hitWall]);

  // Check achievements
  useEffect(() => {
    const stats: GameStats = { highScore, totalScore, gamesPlayed, foodEaten, perfectGames };
    achievements.forEach(achievement => {
      if (!unlockedAchievements.includes(achievement.id) && achievement.requirement(stats)) {
        setUnlockedAchievements(prev => [...prev, achievement.id]);
        localStorage.setItem('snakeAchievements', JSON.stringify([...unlockedAchievements, achievement.id]));
        toast({
          title: "Достижение разблокировано!",
          description: achievement.name,
        });
      }
    });
  }, [highScore, totalScore, gamesPlayed, foodEaten, perfectGames]);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    };

    const diffX = touchStart.x - touchEnd.x;
    const diffY = touchStart.y - touchEnd.y;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > 50 && direction.x !== 1) {
        setDirection({ x: -1, y: 0 }); // Left
      } else if (diffX < -50 && direction.x !== -1) {
        setDirection({ x: 1, y: 0 }); // Right
      }
    } else {
      // Vertical swipe
      if (diffY > 50 && direction.y !== 1) {
        setDirection({ x: 0, y: -1 }); // Up
      } else if (diffY < -50 && direction.y !== -1) {
        setDirection({ x: 0, y: 1 }); // Down
      }
    }

    setTouchStart(null);
  };

  return (
    <div className="space-y-6 slide-in-right">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          FlowSnake
        </h1>
        <div className="flex items-center justify-center space-x-4 text-sm">
          <span className="text-primary font-medium">Счёт: {score}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">Рекорд: {highScore}</span>
        </div>
      </div>

      {/* Game Area */}
      <Card className="glass p-4">
        <div className="relative">
          {showHint && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center hint-fade">
              <div className="text-center space-y-2">
                <div className="text-lg font-semibold">Управление свайпом</div>
                <div className="text-sm text-muted-foreground">
                  Проведите пальцем для движения змейки
                </div>
              </div>
            </div>
          )}
          
          <div
            ref={gameAreaRef}
            className="w-full aspect-square bg-secondary/20 rounded-lg relative border border-border"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%`,
            }}
          >
            {/* Физические стрелки управления */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Стрелка вверх */}
              <div 
                className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 transition-opacity duration-300 ${
                  direction.y === -1 ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className="w-0 h-0 border-l-3 border-r-3 border-b-6 border-l-transparent border-r-transparent border-b-primary"></div>
              </div>
              
              {/* Стрелка вниз */}
              <div 
                className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 transition-opacity duration-300 ${
                  direction.y === 1 ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className="w-0 h-0 border-l-3 border-r-3 border-t-6 border-l-transparent border-r-transparent border-t-primary"></div>
              </div>
              
              {/* Стрелка влево */}
              <div 
                className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 transition-opacity duration-300 ${
                  direction.x === -1 ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className="w-0 h-0 border-t-3 border-b-3 border-r-6 border-t-transparent border-b-transparent border-r-primary"></div>
              </div>
              
              {/* Стрелка вправо */}
              <div 
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 transition-opacity duration-300 ${
                  direction.x === 1 ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className="w-0 h-0 border-t-3 border-b-3 border-l-6 border-t-transparent border-b-transparent border-l-primary"></div>
              </div>
            </div>
            {/* Snake */}
            {snake.map((segment, index) => (
              <div
                key={index}
                className={`absolute rounded-sm transition-all duration-100 ${
                  index === 0 
                    ? 'bg-primary shadow-lg' 
                    : 'bg-primary/70'
                }`}
                style={{
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                }}
              />
            ))}
            
            {/* Food */}
            <div
              className="absolute bg-accent rounded-full animate-pulse-glow"
              style={{
                left: `${(food.x / GRID_SIZE) * 100}%`,
                top: `${(food.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="flex gap-2">
        {!gameRunning && !gameOver && (
          <Button onClick={startGame} className="glass-button flex-1">
            <Play className="w-4 h-4 mr-2" />
            Начать
          </Button>
        )}
        
        {gameRunning && (
          <Button onClick={pauseGame} className="glass-button flex-1">
            <Pause className="w-4 h-4 mr-2" />
            Пауза
          </Button>
        )}
        
        <Button onClick={resetGame} variant="outline" className="glass">
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Game Over */}
      {gameOver && (
        <Card className="glass p-6 text-center space-y-4">
          <Trophy className="w-12 h-12 text-primary mx-auto" />
          <div>
            <h3 className="text-xl font-bold">Игра окончена!</h3>
            <p className="text-muted-foreground">Ваш счёт: {score}</p>
            {score === highScore && score > 0 && (
              <p className="text-primary font-medium">🎉 Новый рекорд!</p>
            )}
            {!hitWall && score > 0 && (
              <p className="text-green-400 font-medium">✨ Идеальная игра!</p>
            )}
          </div>
          <Button onClick={resetGame} className="glass-button">
            Играть снова
          </Button>
        </Card>
      )}

      {/* Achievements */}
      <Card className="glass p-4">
        <h3 className="text-lg font-semibold flex items-center mb-3">
          <Award className="w-5 h-5 mr-2 text-primary" />
          Достижения ({unlockedAchievements.length}/{achievements.length})
        </h3>
        <div className="space-y-2">
          {achievements.map((achievement) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            
            return (
              <div key={achievement.id} className={`flex items-center space-x-3 p-2 rounded-lg ${isUnlocked ? 'bg-primary/20' : 'bg-muted/20'}`}>
                <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{achievement.name}</span>
                    {isUnlocked && <Badge variant="default" className="text-xs">✓</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Stats */}
      <Card className="glass p-4">
        <h3 className="text-lg font-semibold mb-3">Статистика</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Игр сыграно</div>
            <div className="font-medium">{gamesPlayed}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Еды съедено</div>
            <div className="font-medium">{foodEaten}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Общий счёт</div>
            <div className="font-medium">{totalScore}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Идеальных игр</div>
            <div className="font-medium">{perfectGames}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SnakeGame;