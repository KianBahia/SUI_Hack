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
        {/* Frosted shell */}
        <div
          className="mt-3 rounded-3xl border border-white/40 bg-white/50 shadow-sm px-6"
          style={{ backdropFilter: "blur(14px) saturate(1.3)", WebkitBackdropFilter: "blur(14px) saturate(1.3)" }}
        >
          {/* Use a parent flex row to separate left menu and right wallet */}
          <div className="flex w-full items-center justify-between py-2">
            {/* LEFT: brand + menu lives inside shadcn NavigationMenu */}
            <NavigationMenu className="max-w-full">
              <NavigationMenuList className="flex items-center gap-4">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                      <Image src="/favicon.svg" alt="Feelings Logo" width={24} height={24} />
                      <span>Feelings</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-gray-900">Menu</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] bg-white">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            className="block rounded-md p-3 no-underline hover:bg-slate-100 focus:bg-slate-100"
                            href="/"
                          >
                            <div className="text-sm font-medium text-gray-900">Home</div>
                            <p className="text-sm text-slate-600">Landing page</p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* RIGHT: wallet anchored flush right */}
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}
