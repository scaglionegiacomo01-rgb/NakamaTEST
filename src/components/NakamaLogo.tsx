import { cn } from "@/lib/utils";

export function NakamaLogo({
  size = 32,
  withWordmark = false,
  className,
  variant = "transparent",
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  variant?: "transparent" | "boxed";
}) {
  const src =
    variant === "transparent"
      ? "/brand/nakama-logo-transparent.png"
      : "/brand/nakama-logo.png";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <img
        src={src}
        alt="Nakama logo"
        width={size}
        height={size}
        className={cn(
          "object-contain",
          variant === "boxed" && "rounded-lg bg-[#0b0f12]"
        )}
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="font-display font-bold tracking-tight">Nakama</span>
      )}
    </span>
  );
}
