type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
  type?: "button" | "submit";
};

export default function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
}: ButtonProps) {
  const base =
    "px-6 py-2 rounded-xl text-white shadow transition-all duration-200";
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-green-600 hover:bg-green-700",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
