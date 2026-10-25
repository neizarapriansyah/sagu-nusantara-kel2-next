import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "outline";
  children: ReactNode;
};

// tombol berbentuk link (dipakai di hero)
export default function ButtonLink({ href, variant = "primary", children }: ButtonLinkProps) {
  return (
    <a href={href} className={`btn btn-${variant}`}>
      {children}
    </a>
  );
}
