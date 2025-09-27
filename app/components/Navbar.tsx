"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@mysten/dapp-kit";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./ui/navigation-menu";

export default function Navbar() {
  return (
    <div className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto w-full max-w-[1280px] px-3">
        <div className="mt-3 rounded-3xl bg-white/50 backdrop-blur-md border border-white/40 shadow-sm px-6">
          <NavigationMenu className="max-w-full">
            {/* flex container for left + right */}
            <NavigationMenuList className="flex w-full items-center justify-between py-2 !justify-between">
              {/* Left side: logo + menu */}
              <div className="flex items-center gap-4">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/"
                      className="flex items-center gap-2 text-lg font-semibold"
                    >
                      <Image
                        src="/favicon.svg"
                        alt="Feelings Logo"
                        width={24}
                        height={24}
                      />
                      <span>Feelings</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
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
              </div>

              {/* Right side: wallet button */}
              <div className="flex items-center gap-20 pl-210 ml-auto">
                <ConnectButton />
              </div>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </div>
  );
}
