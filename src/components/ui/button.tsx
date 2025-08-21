import * as React from "react";
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => {
  return <button ref={ref} className={buttonVariants({ className })} {...props} />;
});
Button.displayName = "Button";

export { Button };
