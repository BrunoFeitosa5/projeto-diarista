import { Logo } from "./Logo";
import { NavMenu } from "./NavMenu";

export function Header() {
  return (
    <header className="relative bg-white px-4 max-md:py-6">
      <div className="mx-auto flex max-w-site items-center justify-between md:min-h-[143px]">
        <Logo />
        <NavMenu />
      </div>
    </header>
  );
}
