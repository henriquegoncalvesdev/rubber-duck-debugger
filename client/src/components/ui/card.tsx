
import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const cardVariants = cva(
    "rounded-xl border bg-card text-card-foreground shadow",
    {
        variants: {
            variant: {
                default: "border-border/50",
                destuctive: "border-destructive/50 text-destructive",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

function Card({
    className,
    variant,
    ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
    return (
        <div
            data-slot="card"
            className={cn(cardVariants({ variant, className }))}
            {...props}
        />
    )
}

function CardHeader({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-header"
            className={cn("flex flex-col space-y-1.5 p-6", className)}
            {...props}
        />
    )
}

function CardTitle({
    className,
    ...props
}: React.ComponentProps<"h3">) {
    return (
        <h3
            data-slot="card-title"
            className={cn("leading-none font-semibold tracking-tight", className)}
            {...props}
        />
    )
}

function CardDescription({
    className,
    ...props
}: React.ComponentProps<"p">) {
    return (
        <p
            data-slot="card-description"
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

function CardContent({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-content"
            className={cn("p-6 pt-0", className)}
            {...props}
        />
    )
}

function CardFooter({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="card-footer"
            className={cn("flex items-center p-6 pt-0", className)}
            {...props}
        />
    )
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
