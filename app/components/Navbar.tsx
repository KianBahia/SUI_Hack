"use client";

import * as React from "react";
import Link from "next/link";
import { ConnectButton } from "@mysten/dapp-kit";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

/**
 * Glassy, rounded, semi-transparent header that sits "over" the page.
 * Keeps wallet button on the right. No logic changes.
 */
export default function Navbar() {
  return (
    <div className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto w-full max-w-[1280px] px-3">
        <div className="mt-3 rounded-3xl bg-white/50 backdrop-blur-md border border-white/40 shadow-sm">
          <NavigationMenu className="max-w-full justify-between">
            <NavigationMenuList className="flex w-full justify-between items-center px-3 py-2">
              {/* Brand */}
              <div className="flex items-center gap-6">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/"
                      className="flex items-center space-x-2 text-lg font-semibold text-gray-900 transition-transform duration-200 hover:scale-[1.02]"
                    >
                      <span>Feelings</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Simple menu, retains project patterns */}
                <NavigationMenuItem className="hidden md:block">
                  <NavigationMenuTrigger className="text-gray-900">
                    Menu
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] bg-white">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            className="block rounded-md p-3 no-underline hover:bg-slate-100 focus:bg-slate-100"
                            href="/"
                          >
                            <div className="text-sm font-medium text-gray-900">
                              Home
                            </div>
                            <p className="text-sm text-slate-600">
                              Landing page
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="hidden md:block">
                  <NavigationMenuLink
                    asChild
                    className={navigationMenuTriggerStyle()}
                  >
                    <Link href="/" className="text-gray-900">
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </div>

              {/* Wallet on the far right */}
              <NavigationMenuItem className="ml-auto">
                <div className="flex items-center gap-2 pr-1">
                  <ConnectButton />
                </div>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
}
