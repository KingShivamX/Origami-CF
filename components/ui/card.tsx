import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, useMotionTemplate } from "framer-motion";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, onMouseMove, ...props }, ref) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Destructure to omit problematic handlers from props spread
  const { onDrag, ...safeProps } = props as any;

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    mouseX.set((clientX - left) / width);
    mouseY.set((clientY - top) / height);
  }

  const rotateX = useTransform(mouseY, [0, 1], [10, -10]);
  const rotateY = useTransform(mouseX, [0, 1], [-10, 10]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{
        scale: 1.02,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      className={cn(
        `
        group relative
        rounded-[16px]
        border border-borderColor/20
        bg-surface/50
        backdrop-blur-xl
        text-textPrimary
        shadow-sm
        transition-colors duration-500
        hover:shadow-2xl hover:shadow-accentPrimary/10
        dark:shadow-black/20
        dark:hover:shadow-black/40
        perspective-1000
        `,
        className
      )}
      {...safeProps}
    >
      {/* Glossy light effect overlay */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${useTransform(mouseX, [0, 1], ["0%", "100%"])} ${useTransform(mouseY, [0, 1], ["0%", "100%"])},
              rgba(124, 58, 237, 0.12),
              transparent 80%
            )
          `,
        }}
      />
      <div className="relative z-10 h-full w-full">{props.children}</div>
    </motion.div>
  );
});

Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      flex flex-col
      space-y-2
      px-[32px]
      pt-[32px]
      pb-2
      `,
      className
    )}
    {...props}
  />
));

CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      text-[28px]
      font-bold
      leading-tight
      tracking-tight
      text-textPrimary
      `,
      className
    )}
    {...props}
  />
));

CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      text-[16px]
      text-textSecondary
      leading-relaxed
      `,
      className
    )}
    {...props}
  />
));

CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      px-[32px]
      pb-[32px]
      text-[16px]
      leading-relaxed
      text-textSecondary
      `,
      className
    )}
    {...props}
  />
));

CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      `
      flex items-center
      justify-between
      px-[32px]
      pb-[32px]
      `,
      className
    )}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
