import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, LogOut, Shield, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Cart from "./Cart";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const { t } = useTranslation();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <h2 className="text-2xl font-serif font-bold cursor-pointer" onClick={() => navigate("/")}>
            MarketFresh
          </h2>
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className="text-sm font-medium transition-colors hover:text-primary">
              {t("nav.home")}
            </a>
            <a href="/#products" className="text-sm font-medium transition-colors hover:text-primary">
              {t("nav.products")}
            </a>
            <a href="/#about" className="text-sm font-medium transition-colors hover:text-primary">
              {t("nav.about")}
            </a>
            <a href="/#contact" className="text-sm font-medium transition-colors hover:text-primary">
              {t("nav.contact")}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          {user ? (
            <>
              {isAdmin ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin")}
                  className="hidden md:flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {t("nav.admin")}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/profile")}
                  className="hidden md:flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {t("nav.profile")}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:flex">
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.signOut")}
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="hidden md:flex">
              {t("nav.signIn")}
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <Cart />
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 mt-8">
                <a href="/" className="text-lg font-medium transition-colors hover:text-primary">
                  {t("nav.home")}
                </a>
                <a href="/#products" className="text-lg font-medium transition-colors hover:text-primary">
                  {t("nav.products")}
                </a>
                <a href="/#about" className="text-lg font-medium transition-colors hover:text-primary">
                  {t("nav.about")}
                </a>
                <a href="/#contact" className="text-lg font-medium transition-colors hover:text-primary">
                  {t("nav.contact")}
                </a>
                {user ? (
                  <>
                    {isAdmin ? (
                      <Button variant="ghost" onClick={() => navigate("/admin")} className="justify-start px-0">
                        <Shield className="mr-2 h-4 w-4" />
                        {t("nav.admin")}
                      </Button>
                    ) : (
                      <Button variant="ghost" onClick={() => navigate("/profile")} className="justify-start px-0">
                        <User className="mr-2 h-4 w-4" />
                        {t("nav.profile")}
                      </Button>
                    )}
                    <Button variant="ghost" onClick={handleSignOut} className="justify-start px-0">
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("nav.signOut")}
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" onClick={() => navigate("/auth")} className="justify-start px-0">
                    {t("nav.signIn")}
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
