import type { FC, PropsWithChildren } from "react";

interface ButtonProps {
  onClick: () => void;
}

export const Button: FC<PropsWithChildren<ButtonProps>> = ({
  onClick,
  children,
}) => (
  <div className="container">
    <button className="button" onClick={onClick}>
      {children}
    </button>
  </div>
);
