"use client";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

// ─── Button ───────────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  as?: React.ElementType;
  href?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#1A7A3A] text-white hover:bg-[#166031] shadow-sm",
  secondary: "bg-[#E8F5EC] text-[#1A7A3A] hover:bg-[#c3e6cc]",
  ghost: "text-[#374151] hover:bg-[#F3F4F6]",
  danger: "bg-[#DC2626] text-white hover:bg-red-700",
  outline: "border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, as: Component = "button", ...props }, ref) => (
    <Component
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30 disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </Component>
  )
);
Button.displayName = "Button";

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "green" | "amber" | "red" | "gray" | "blue";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  green: "bg-[#E8F5EC] text-[#1A7A3A]",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  gray: "bg-[#F3F4F6] text-[#374151]",
  blue: "bg-blue-50 text-blue-700",
};

export function Badge({ variant = "gray", children, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-[#E5E7EB] shadow-sm",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-base font-semibold text-[#1F2937]", className)}>{children}</h3>;
}

// ─── Stat Tile ────────────────────────────────────────────────────────────────
interface StatTileProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  color?: string;
}

export function StatTile({ label, value, change, changeType = "neutral", icon, color = "#1A7A3A" }: StatTileProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-[#1F2937]">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs mt-1",
                changeType === "up" ? "text-green-600" : changeType === "down" ? "text-red-500" : "text-gray-500"
              )}
            >
              {changeType === "up" ? "↑" : changeType === "down" ? "↓" : ""} {change}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="p-2.5 rounded-lg"
            style={{ backgroundColor: color + "20", color }}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[#374151] mb-1">{label}</label>}
      <input
        ref={ref}
        className={cn(
          "w-full px-3 py-2 rounded-lg border text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A]",
          error ? "border-red-400" : "border-[#E5E7EB]",
          className
        )}
        {...props}
      />
      {helper && !error && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-[#374151] mb-1">{label}</label>}
      <select
        ref={ref}
        className={cn(
          "w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm bg-white",
          "focus:outline-none focus:ring-2 focus:ring-[#1A7A3A]/30 focus:border-[#1A7A3A]",
          className
        )}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
);
Select.displayName = "Select";

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm", className)}>{children}</table>
    </div>
  );
}
export function Thead({ children }: { children: React.ReactNode }) {
  return <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">{children}</thead>;
}
export function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider", className)}>{children}</th>;
}
export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 text-[#374151]", className)}>{children}</td>;
}
export function Tr({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr
      className={cn("border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors", onClick && "cursor-pointer", className)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-[#E8F5EC] rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#1A7A3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[#1F2937] mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}
