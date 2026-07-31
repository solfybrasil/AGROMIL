import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  className?: string;
  replace?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, replace, ...props }, ref) => {
    return (
      <RouterLink to={href || '#'} replace={replace} ref={ref} {...props}>
        {children}
      </RouterLink>
    );
  }
);

Link.displayName = 'NextLinkCompat';

export default Link;
