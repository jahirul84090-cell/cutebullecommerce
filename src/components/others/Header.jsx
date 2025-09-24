"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useCartWithSession } from "@/lib/cartStore";
import useWishlistStore from "@/lib/wishlistStore";

// UI Components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Icons
import {
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  AlignJustify,
  Plus,
  Minus,
  Trash2,
  Home,
  ShoppingBag,
  Info,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Loader2,
  User2Icon,
  Search,
} from "lucide-react";
import AutocompleteSearch from "./AutoCompleteSearch";

// Data
const MEGA_MENU_LINKS = {
  "Fresh Produce": [
    "Fruits",
    "Vegetables",
    "Organic Selection",
    "Seasonal Picks",
  ],
  "Dairy & Bakery": ["Milk & Eggs", "Cheese", "Bread", "Pastries"],
  "Meat & Seafood": ["Beef", "Chicken", "Fish", "Deli Meats"],
  "Pantry Staples": [
    "Grains & Pasta",
    "Canned Goods",
    "Spices",
    "Oils & Vinegar",
  ],
  Beverages: ["Coffee & Tea", "Juices", "Soft Drinks", "Water"],
  Snacks: ["Chips & Pretzels", "Cookies", "Nuts & Seeds", "Candy"],
};

// Nav Links Array
const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/allproducts", label: "Products", icon: ListOrdered },
  { href: "/about", label: "About", icon: Info },
  { href: "/contact", label: "Contact", icon: Info },
];

// Component
export default function Header() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  // State
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [promoBarVisible, setPromoBarVisible] = useState(true);

  // Zustand Hooks
  const { cartItems, totalPrice, updateCartItemQuantity, removeFromCart } =
    useCartWithSession();
  const { wishlist, isLoading, fetchWishlist, toggleWishlist } =
    useWishlistStore();

  // Effects
  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    }
  }, [isLoggedIn, fetchWishlist]);

  // Use useCallback to memoize the scroll handler for performance
  const handleScroll = useCallback(() => {
    const offset = window.scrollY;
    if (offset > 50) {
      setIsScrolled(true);
      setPromoBarVisible(false);
    } else {
      setIsScrolled(false);
      setPromoBarVisible(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Handlers
  const handleQuantityChange = useCallback(
    (item, delta) => {
      updateCartItemQuantity(
        item.dbItemId,
        Math.max(1, item.quantity + delta),
        item.id
      );
    },
    [updateCartItemQuantity]
  );

  return (
    <>
      {/* Promo Bar */}
      <div
        className={`fixed w-full z-50 bg-purple-600 text-white text-center py-2 px-4 text-xs sm:text-sm flex items-center justify-center space-x-4 transition-transform duration-300 ease-in-out ${
          promoBarVisible ? "top-0 absolute" : "hidden"
        }`}
      >
        <span className="flex-1 text-right">
          Get **40% OFF** your first order!
        </span>
        <Button
          size="sm"
          variant="outline"
          className="text-purple-900 bg-white border-white hover:bg-purple-100 transition-colors"
        >
          Shop Now
        </Button>
        <span className="ml-auto hidden sm:block text-left text-gray-200 text-xs flex-1">
          Limited time offer
        </span>
      </div>

      {/* Main Header */}
      <header
        className={`fixed w-full z-40 transition-all duration-300 ease-in-out ${
          isScrolled ? "top-0 shadow-md" : "top-[40px]"
        }`}
      >
        <div className="bg-white text-gray-800">
          <div
            className={`container mx-auto px-4 flex items-center justify-between transition-all duration-300 ease-in-out ${
              isScrolled ? "py-2" : "py-3"
            }`}
          >
            {/* Logo and Mobile Menu Trigger */}
            <div className="flex items-center space-x-2">
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-0 text-gray-700 hover:text-purple-600"
                      aria-label="Open mobile menu"
                    >
                      <AlignJustify className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-full sm:w-[300px] p-6 flex flex-col"
                  >
                    {/* Mobile Menu Content */}
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b">
                      {isLoggedIn && session?.user ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={session.user.image || undefined}
                            alt="User Avatar"
                          />
                          <AvatarFallback>
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <User className="w-8 h-8 text-purple-600" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-900">
                          {isLoggedIn
                            ? `Hello, ${session?.user?.name || "User"}`
                            : "Hello, Guest"}
                        </span>
                        <a
                          href="#"
                          className="text-sm text-purple-600 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isLoggedIn) signIn();
                          }}
                        >
                          {isLoggedIn ? "View Profile" : "Sign In / My Account"}
                        </a>
                      </div>
                    </div>
                    <ul className="space-y-4 text-lg flex-grow">
                      {NAV_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className="flex items-center space-x-3 hover:text-purple-600"
                            >
                              <Icon className="w-5 h-5 text-gray-500" />
                              <span>{link.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                      <li>
                        <Collapsible className="w-full">
                          <CollapsibleTrigger className="flex items-center justify-between w-full hover:text-purple-600">
                            <span className="flex items-center space-x-3">
                              <ShoppingBag className="w-5 h-5 text-gray-500" />
                              <span>Shop by Category</span>
                            </span>
                            <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="space-y-2 pl-8 pt-2 text-sm">
                            {Object.keys(MEGA_MENU_LINKS).map((category) => (
                              <a
                                key={category}
                                href={`/categories/${category
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}`}
                                className="block py-1 text-gray-700 hover:text-purple-600"
                              >
                                {category}
                              </a>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      </li>
                    </ul>
                    {isLoggedIn && (
                      <div className="mt-auto pt-6 border-t">
                        <Button
                          onClick={() => signOut()}
                          variant="ghost"
                          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          Sign Out
                        </Button>
                      </div>
                    )}
                  </SheetContent>
                </Sheet>
              </div>

              <Link href="/">
                <div className="flex items-center space-x-2">
                  <img
                    src="https://ik.imagekit.io/obnmhirhl/WhatsApp_Image_2025-09-22_at_4.27.29_PM_rGCzWNsCr.jpeg" // replace with your image path
                    alt="Logo"
                    className="w-8 h-8 object-contain"
                  />
                  <span
                    className={`uppercase font-bold text-gray-900 transition-all duration-300 ease-in-out ${
                      isScrolled ? "text-xl" : "text-2xl"
                    }`}
                  >
                    Cute Bull <span className="text-orange-600">Store</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div
              className={`flex-1 max-w-lg mx-2 sm:mx-4 hidden md:block transition-all duration-300 ease-in-out ${
                isScrolled ? "scale-95 opacity-80" : "scale-100 opacity-100"
              }`}
            >
              <AutocompleteSearch
                className="w-full"
                placeholder="Search for products, categories or brands..."
              />
            </div>

            {/* Icons & Account */}
            <nav className="flex items-center space-x-4 sm:space-x-6">
              {/* User Account Dropdown */}
              {isLoggedIn && session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 p-0 text-gray-700 hover:text-purple-600"
                      aria-label="My Account"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage
                          src={session.user.image || undefined}
                          alt="User Avatar"
                        />
                        <AvatarFallback>
                          {session.user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm hidden md:block">
                        My Account
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48 p-2 shadow-lg rounded-lg">
                    <DropdownMenuLabel className="font-bold text-gray-900">
                      My Account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="cursor-pointer flex items-center space-x-2"
                      >
                        <User2Icon className="w-4 h-4 text-gray-500" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/details"
                        className="cursor-pointer flex items-center space-x-2"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-500" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/orders"
                        className="cursor-pointer flex items-center space-x-2"
                      >
                        <ListOrdered className="w-4 h-4 text-gray-500" />
                        <span>My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="cursor-pointer flex items-center space-x-2 text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center space-x-2 p-0 text-gray-700 hover:text-purple-600"
                  onClick={() => signIn()}
                >
                  <User className="w-5 h-5" aria-label="User account" />
                  <span className="text-sm">Sign In</span>
                </Button>
              )}

              {/* Mobile Search Toggle */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  className="p-0 text-gray-700 hover:text-purple-600"
                  aria-label="Toggle search bar"
                  onClick={() => setIsSearchVisible(!isSearchVisible)}
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>

              {/* Wishlist Hover Card */}
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <Link
                    href="/wishlist"
                    className="relative block cursor-pointer text-gray-700 hover:text-purple-600"
                    aria-label="Wishlist"
                  >
                    <Heart className="w-5 h-5" />
                    {wishlist.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-6 rounded-2xl shadow-xl border-none bg-white/95 backdrop-blur-md">
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-900 border-b pb-2">
                      Your Wishlist
                    </h4>
                    {isLoading ? (
                      <p className="text-gray-500 text-center py-4">
                        Loading wishlist...
                      </p>
                    ) : wishlist.length > 0 ? (
                      <>
                        <ul className="space-y-4 max-h-64 overflow-y-auto pr-2">
                          {wishlist.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center space-x-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100"
                            >
                              <img
                                src={item.mainImage}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800 line-clamp-2">
                                  {item.name}
                                </p>
                                <p className="text-gray-600 text-sm">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 rounded-full"
                                aria-label={`Remove ${item.name} from wishlist`}
                                onClick={() => toggleWishlist(item, true)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4">
                          <Link href="/wishlist" passHref>
                            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                              View Wishlist
                            </Button>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Your wishlist is empty.
                      </p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>

              {/* Shopping Cart Hover Card */}
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <Link
                    href="/cart"
                    className="relative block cursor-pointer text-gray-700 hover:text-purple-600"
                    aria-label="Shopping Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isLoggedIn && cartItems.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent className="w-96 p-6 rounded-2xl shadow-xl border-none bg-white/95 backdrop-blur-md">
                  <div className="space-y-4">
                    <h4 className="text-xl font-bold text-gray-900 border-b pb-2">
                      Shopping Cart
                    </h4>
                    {!isLoggedIn ? (
                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">
                          Please log in to see your cart.
                        </p>
                        <Button
                          onClick={() => signIn()}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                        >
                          Sign In
                        </Button>
                      </div>
                    ) : cartItems.length > 0 ? (
                      <>
                        <ul className="space-y-4 max-h-64 overflow-y-auto pr-2">
                          {cartItems.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-center space-x-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg shadow-sm"
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-semibold text-gray-800 truncate"
                                  title={item.name}
                                >
                                  {item.name}
                                </p>
                                <div className="text-gray-600 text-sm flex items-center flex-wrap">
                                  <span>${item.price.toFixed(2)}</span>
                                  {item.selectedSize && (
                                    <>
                                      <span className="text-gray-400 mx-1">
                                        |
                                      </span>
                                      <span>
                                        Size:{" "}
                                        <span className="font-bold">
                                          {item.selectedSize.toUpperCase()}
                                        </span>
                                      </span>
                                    </>
                                  )}
                                  {item.selectedColor && (
                                    <>
                                      <span className="text-gray-400 mx-1">
                                        |
                                      </span>
                                      <span>
                                        Color:{" "}
                                        <span className="font-bold">
                                          {item.selectedColor}
                                        </span>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {item.isUpdating ? (
                                  <div className="w-20 text-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-purple-600 mx-auto" />
                                  </div>
                                ) : (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-gray-700 hover:text-purple-600 rounded-full"
                                      onClick={() =>
                                        handleQuantityChange(item, -1)
                                      }
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm font-semibold w-5 text-center">
                                      {item.quantity}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-gray-700 hover:text-purple-600 rounded-full"
                                      onClick={() =>
                                        handleQuantityChange(item, 1)
                                      }
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 rounded-full"
                                onClick={() =>
                                  removeFromCart(item.dbItemId, item.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                        <div className="pt-4 border-t">
                          <div className="flex justify-between font-bold text-gray-900 text-lg">
                            <span>Total:</span>
                            <span>${totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between mt-4">
                          <Link href="/cart" className="w-full mr-2">
                            <Button
                              variant="outline"
                              className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 rounded-lg"
                            >
                              View Cart
                            </Button>
                          </Link>
                          <Link href="/checkout" className="w-full">
                            <Button className="w-full ml-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
                              Checkout
                            </Button>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        Your cart is empty.
                      </p>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </nav>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div
          className={`bg-white shadow-md border-b border-gray-200 transition-all duration-300 ease-in-out md:hidden ${
            isSearchVisible ? "block" : "hidden"
          }`}
        >
          <div className="container mx-auto px-4 py-2">
            <AutocompleteSearch
              className="w-full"
              placeholder="Search for products, categories or brands..."
              isMobile={true}
              onClose={() => setIsSearchVisible(false)}
            />
          </div>
        </div>

        {/* Desktop Navigation with Mega Menu */}
        <nav
          className={`bg-white hidden md:block border-t border-gray-200 transition-all duration-300 ease-in-out`}
        >
          <div className="container mx-auto px-4 py-2 flex justify-start items-center space-x-8 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-purple-600 py-2 block"
              >
                {link.label}
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-0 text-gray-700 hover:text-purple-600"
                >
                  <span className="flex items-center">
                    Shop by Category
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[800px] p-6 shadow-lg rounded-lg grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {Object.keys(MEGA_MENU_LINKS).map((category) => (
                  <div key={category} className="space-y-2">
                    <DropdownMenuLabel className="text-base font-bold text-gray-900">
                      {category}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="my-1" />
                    {MEGA_MENU_LINKS[category].map((link) => (
                      <a
                        key={link}
                        href={`/products?category=${link
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="block px-2 py-1 text-sm text-gray-700 hover:text-purple-600"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
      </header>
    </>
  );
}
