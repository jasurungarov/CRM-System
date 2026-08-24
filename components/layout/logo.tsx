import Image from "next/image";
import Link from "next/link";

function Logo() {
  return (
    <Link 
      href="/" 
      className="group flex items-center gap-3 p-2 transition-all hover:bg-sidebar-accent/50 bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border-accent border-b"
    >
      <div className="relative flex shrink-0 items-center justify-center p-1">
        <Image
          src="/logo.png"
          alt="logo"
          width={36}
          height={36}
          priority
          className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col min-w-0 leading-none gap-1">
        <span className="font-space-grotesk text-base font-bold tracking-tight text-sidebar-foreground truncate text-primary">
          Ansor Edu CRM
        </span>
        <span className="text-xs font-medium text-muted-foreground truncate">
          Ichki xodimlar tizimi
        </span>
      </div>
    </Link>
  );
}

export default Logo;