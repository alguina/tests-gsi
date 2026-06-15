import type { HTMLAttributes, TableHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";
import { typography } from "@/lib/ui/tokens";

type TableWrapProps = HTMLAttributes<HTMLDivElement>;

export function TableWrap({ className, children, ...props }: TableWrapProps) {
  return (
    <div className={cn("overflow-x-auto", className)} {...props}>
      {children}
    </div>
  );
}

type TableProps = TableHTMLAttributes<HTMLTableElement>;

export function Table({ className, children, ...props }: TableProps) {
  return (
    <table
      className={cn("min-w-full text-left text-sm", className)}
      {...props}
    >
      {children}
    </table>
  );
}

type TableSectionProps = HTMLAttributes<HTMLTableSectionElement>;

export function TableHead({
  className,
  children,
  ...props
}: TableSectionProps) {
  return (
    <thead
      className={cn("border-b border-border-subtle", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({
  className,
  children,
  ...props
}: TableSectionProps) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

export function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <tr
      className={cn("border-b border-border-subtle/80 last:border-b-0", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

type TableCellProps = HTMLAttributes<HTMLTableCellElement> & {
  header?: boolean;
};

export function TableCell({
  className,
  children,
  header,
  ...props
}: TableCellProps) {
  const Component = header ? "th" : "td";

  return (
    <Component
      className={cn(
        "px-3",
        header
          ? cn(typography.statLabel, "py-3 text-left align-bottom")
          : "py-3.5 align-top text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
