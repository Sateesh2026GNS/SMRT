import { forwardRef } from "react";

const variantClasses = {
  primary: "ui-btn-primary",
  secondary: "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50",
};

const ActionButton = forwardRef(function ActionButton({ children, variant = "secondary", className = "", ...props }, ref) {
  const classes = [variantClasses[variant] || variantClasses.secondary, className].filter(Boolean).join(" ");
  return (
    <button ref={ref} type="button" className={classes} {...props}>
      {children}
    </button>
  );
});

export default ActionButton;
