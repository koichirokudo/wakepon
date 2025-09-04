import "./ui.css";
import React from "react";

type CardProps = {
  title?: string;
  children: React.ReactNode;
};

type CardHeaderProps = {
  children: React.ReactNode;
};

type CardBodyProps = {
  children: React.ReactNode;
};

type CardFooterProps = {
  children: React.ReactNode;
};

export function CardHeader({ children }: CardHeaderProps) {
  return <div className="card-header">{children}</div>;
}

export function CardBody({ children }: CardBodyProps) {
  return <div className="card-body">{children}</div>;
}

export function CardFooter({ children }: CardFooterProps) {
  return <div className="card-footer">{children}</div>;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="card">
      {children}
    </div>
  );
}