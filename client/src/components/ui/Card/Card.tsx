import React, { forwardRef, type HTMLAttributes } from "react";

/**
 * Card component props
 * @interface CardProps
 * @extends HTMLAttributes<HTMLDivElement>
 * @property {React.ReactNode} children - Card content (typically CardHeader, CardBody, CardFooter)
 */
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  'data-testid'?: string;
}

/**
 * Card - A container component with header, body, and footer sections
 *
 * Wraps the .card utility classes. Use with CardHeader, CardBody, and CardFooter
 * for consistent layout.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <h3>Product Details</h3>
 *   </CardHeader>
 *   <CardBody>
 *     <p>Product description here</p>
 *   </CardBody>
 *   <CardFooter>
 *     <Button>Edit</Button>
 *     <Button variant="danger">Delete</Button>
 *   </CardFooter>
 * </Card>
 * ```
 *
 * @component
 * @category Primitives
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`card ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

/**
 * CardHeader component props
 * @interface CardHeaderProps
 * @extends HTMLAttributes<HTMLDivElement>
 */
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * CardHeader - Header section of a Card
 * @component
 * @category Primitives
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`card-header ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

/**
 * CardBody component props
 * @interface CardBodyProps
 * @extends HTMLAttributes<HTMLDivElement>
 */
interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * CardBody - Main content section of a Card
 * @component
 * @category Primitives
 */
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`card-body ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = "CardBody";

/**
 * CardFooter component props
 * @interface CardFooterProps
 * @extends HTMLAttributes<HTMLDivElement>
 */
interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * CardFooter - Footer section of a Card
 * @component
 * @category Primitives
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={`card-footer ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = "CardFooter";