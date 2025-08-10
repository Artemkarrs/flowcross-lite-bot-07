import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-md border border-white/10",
  {
    variants: {
      variant: {
        default: "bg-primary/80 text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl",
        destructive:
          "bg-destructive/80 text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl",
        outline:
          "border border-input/50 bg-background/30 hover:bg-accent/50 hover:text-accent-foreground shadow-md hover:shadow-lg",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary/90 shadow-lg hover:shadow-xl",
        ghost: "hover:bg-accent/30 hover:text-accent-foreground backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline backdrop-blur-sm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      createClickParticles(e);
      onClick?.(e);
    };

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), "relative overflow-hidden")}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Функция создания частиц при клике
const createClickParticles = (e: React.MouseEvent<HTMLButtonElement>) => {
  const button = e.currentTarget;
  const rect = button.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Создаем 8-12 частиц
  const particleCount = Math.floor(Math.random() * 5) + 8;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'button-particle';
    
    // Случайное направление и скорость
    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
    const velocity = Math.random() * 100 + 50;
    const size = Math.random() * 4 + 2;
    
    particle.style.cssText = `
      position: fixed;
      left: ${rect.left + x}px;
      top: ${rect.top + y}px;
      width: ${size}px;
      height: ${size}px;
      background: hsl(var(--primary));
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      box-shadow: 0 0 6px hsl(var(--primary));
    `;
    
    document.body.appendChild(particle);
    
    // Анимация
    const animation = particle.animate([
      {
        transform: 'translate(0, 0) scale(1)',
        opacity: 1
      },
      {
        transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`,
        opacity: 0
      }
    ], {
      duration: 600 + Math.random() * 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    });
    
    animation.onfinish = () => {
      document.body.removeChild(particle);
    };
  }
};

export { Button, buttonVariants }
