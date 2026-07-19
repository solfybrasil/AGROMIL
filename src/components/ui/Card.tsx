"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// BASE CARD
// ─────────────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Estilo visual do card */
  variant?: "default" | "glass" | "dark" | "bordered" | "flat";
  /** Aplica hover lift com sombra */
  hoverable?: boolean;
  /** Desativa padding interno */
  noPadding?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hoverable = false, noPadding = false, ...props }, ref) => {
    const variants = {
      default:
        "bg-white border border-gray-100 shadow-xs",
      glass:
        "bg-white/60 backdrop-blur-xl border border-white/40 shadow-md",
      dark:
        "bg-gradient-to-b from-[#0d1f17] to-[#091510] border border-emerald-950/30 text-white shadow-xl",
      bordered:
        "bg-white border-2 border-primary/20 shadow-none",
      flat:
        "bg-gray-50 border border-gray-100 shadow-none",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          variants[variant],
          hoverable && "hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
          !noPadding && "p-5",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

// ─────────────────────────────────────────────────────────────────────────────
// CARD HEADER
// ─────────────────────────────────────────────────────────────────────────────

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 pb-4 mb-4 border-b border-gray-100", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// ─────────────────────────────────────────────────────────────────────────────
// CARD TITLE
// ─────────────────────────────────────────────────────────────────────────────

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    icon?: LucideIcon;
    iconClassName?: string;
  }
>(({ className, icon: Icon, iconClassName, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-[10px] font-black text-[#1b4332] uppercase tracking-widest flex items-center gap-1.5",
      className
    )}
    {...props}
  >
    {Icon && (
      <Icon className={cn("h-3.5 w-3.5 text-primary flex-shrink-0", iconClassName)} />
    )}
    {children}
  </h3>
));
CardTitle.displayName = "CardTitle";

// ─────────────────────────────────────────────────────────────────────────────
// CARD DESCRIPTION
// ─────────────────────────────────────────────────────────────────────────────

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[10px] text-gray-400 font-semibold mt-0.5 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// ─────────────────────────────────────────────────────────────────────────────
// CARD CONTENT
// ─────────────────────────────────────────────────────────────────────────────

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ─────────────────────────────────────────────────────────────────────────────
// CARD FOOTER
// ─────────────────────────────────────────────────────────────────────────────

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center pt-4 mt-4 border-t border-gray-100 gap-2",
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARD — KPI compacto com ícone, valor, tendência
// ─────────────────────────────────────────────────────────────────────────────

export interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  trend?: string;
  trendUp?: boolean | null; // true=alta, false=baixa, null=neutro
  icon: LucideIcon;
  iconColor?: string; // ex: "text-emerald-600"
  iconBg?: string;   // ex: "bg-emerald-500/15 border-emerald-500/20"
  accentColor?: string; // ex: "from-emerald-500/5"
  pulse?: boolean;
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  trendUp,
  icon: Icon,
  iconColor = "text-primary",
  iconBg = "bg-primary/10 border-primary/20",
  accentColor = "from-primary/5",
  pulse = false,
  href,
  className,
}: StatCardProps) {
  const trendStyle =
    trendUp === true
      ? "text-emerald-600 bg-emerald-50 border-emerald-100"
      : trendUp === false
      ? "text-rose-600 bg-rose-50 border-rose-100"
      : "text-gray-500 bg-gray-50 border-gray-100";

  const trendSymbol = trendUp === true ? "↑" : trendUp === false ? "↓" : "";

  const inner = (
    <div
      className={cn(
        "relative overflow-hidden bg-white border border-gray-100 rounded-2xl p-4 md:p-5",
        "shadow-xs hover:shadow-sm transition-all duration-300 hover:-translate-y-0.5 group cursor-default",
        className
      )}
    >
      {/* Gradient hover overlay */}
      <div
        className={cn(
          `absolute inset-0 bg-gradient-to-br ${accentColor} to-transparent`,
          "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        )}
      />

      <div className="relative z-10 flex items-start justify-between mb-3">
        {/* Icon badge */}
        <div
          className={cn(
            "rounded-xl border p-2.5 flex-shrink-0",
            iconBg,
            iconColor,
            pulse && "animate-pulse"
          )}
        >
          <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </div>

        {/* Trend badge */}
        {trend && (
          <span
            className={cn(
              "text-[8px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider",
              trendStyle
            )}
          >
            {trendSymbol} {trend}
          </span>
        )}
      </div>

      <div className="relative z-10 space-y-0.5">
        <span className="text-[8px] md:text-[9px] text-gray-400 font-black uppercase tracking-widest block leading-none">
          {label}
        </span>
        <span className="text-xl md:text-2xl font-black text-gray-800 tracking-tight block leading-tight">
          {value}
        </span>
        {subValue && (
          <span className="text-[9px] text-gray-400 font-semibold block">{subValue}</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION CARD — Card com header padronizado e slot de action
// ─────────────────────────────────────────────────────────────────────────────

export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  titleIcon?: LucideIcon;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  variant?: CardProps["variant"];
  noPadding?: boolean;
}

export function SectionCard({
  title,
  titleIcon,
  description,
  badge,
  action,
  children,
  className,
  variant = "default",
  noPadding = false,
  ...props
}: SectionCardProps) {
  return (
    <Card variant={variant} noPadding className={className} {...props}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        <div className="flex-1 min-w-0">
          <CardTitle icon={titleIcon}>
            {title}
            {badge && <span className="ml-2">{badge}</span>}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Divider */}
      <div className="mx-5 mt-4 border-t border-gray-50" />

      {/* Content */}
      <div className={cn(!noPadding && "p-5")}>{children}</div>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALERT CARD — Banner de alerta colorido
// ─────────────────────────────────────────────────────────────────────────────

export interface AlertCardProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "info" | "success" | "warning" | "error";
  icon?: LucideIcon;
  title?: string;
}

export function AlertCard({
  type = "info",
  icon: Icon,
  title,
  children,
  className,
  ...props
}: AlertCardProps) {
  const styles = {
    info:    { wrap: "bg-blue-50 border-blue-100",   text: "text-blue-700",   iconBg: "bg-blue-100 text-blue-600" },
    success: { wrap: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", iconBg: "bg-emerald-100 text-emerald-600" },
    warning: { wrap: "bg-amber-50 border-amber-100", text: "text-amber-700",  iconBg: "bg-amber-100 text-amber-600" },
    error:   { wrap: "bg-rose-50 border-rose-100",   text: "text-rose-700",   iconBg: "bg-rose-100 text-rose-600" },
  };

  const s = styles[type];

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex items-start gap-3",
        s.wrap,
        className
      )}
      {...props}
    >
      {Icon && (
        <div className={cn("rounded-lg p-1.5 flex-shrink-0", s.iconBg)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("text-[11px] font-black mb-0.5", s.text)}>{title}</p>
        )}
        <div className={cn("text-[10px] font-semibold leading-relaxed", s.text)}>
          {children}
        </div>
      </div>
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
