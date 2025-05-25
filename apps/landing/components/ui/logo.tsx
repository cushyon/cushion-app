import Image from "next/image";

export function Logo({ className = "", size = 160 }) {
  return (
    <Image
      src="/logo_white.svg"
      width={size}
      height={size * 0.286} // keeps the original aspect ratio (≈ 280×80)
      priority
      alt="Cushion logo"
      className={`block ${className}`}
    />
  );
}
