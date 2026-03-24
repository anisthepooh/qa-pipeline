import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border',
  {
    variants: {
      variant: {
        default: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        secondary: 'bg-secondary text-secondary-foreground border-border',
        destructive: 'bg-red-50 text-red-600 border-red-200',
        outline: 'text-foreground border-border',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
