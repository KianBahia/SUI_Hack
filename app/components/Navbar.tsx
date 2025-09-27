"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ConnectButton } from "@mysten/dapp-kit";
import { Button, buttonVariants } from "@/components/ui/button";
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
        {/* frosted navbar shell */}
        <div
          className="mt-3 rounded-3xl border border-white/20 bg-white/10 shadow-xl px-6"
          style={{ backdropFilter: "blur(14px) saturate(1.3)", WebkitBackdropFilter: "blur(14px) saturate(1.3)" }}
        >
          <div className="flex w-full items-center justify-between py-2">
            {/* LEFT: brand + menu */}
            <NavigationMenu className="max-w-full">
              <NavigationMenuList className="flex items-center gap-4">
                {/* logo */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/"
                      className="group flex items-center gap-2 text-lg font-semibold transition-all duration-200 hover:scale-110"
                    >
                      <Image
                        src="/favicon.svg"
                        alt="Feelings Logo"
                        width={24}
                        height={24}
                        className="transition-all duration-200 group-hover:scale-110"
                      />
                      <span className="transition-colors duration-200 group-hover:text-[#88d3ff]">
                        Feelings
                      </span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Menu button in a glassy box + bluish hover */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={buttonVariants({ variant: "glass", size: "sm" }) + " px-3 py-1.5 text-gray-900"}
                  >
                    Menu
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] rounded-xl bg-white/60 backdrop-blur-sm">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            className="block rounded-md p-3 no-underline hover:bg-blue-400/20"
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

            {/* RIGHT: Connect wallet inside a glassy box + bluish hover */}
            <div
                  className={
                    // glass container
                    "rounded-xl border border-white/20 bg-white/10 shadow backdrop-blur-md " +
                    "transition-colors duration-200 hover:bg-blue-400/20 px-3 py-1.5 " +
                    // HARD resets for the SDK button and everything inside it
                    " [&_*]:!bg-transparent [&_*]:!shadow-none [&_*]:!ring-0 [&_*]:!border-0 " +
                    " [&_*]:!m-0 [&_*]:!p-0 [&_*]:!outline-none [&_*]:!rounded-[inherit] " +
                    // target the direct button explicitly, too
                    " [&>button]:!bg-transparent [&>button]:!shadow-none [&>button]:!ring-0 [&>button]:!border-0 " +
                    " [&>button]:!h-auto [&>button]:!w-auto [&>button]:!rounded-[inherit] " +
                    // keep typography from your glass box
                    " [&_*]:!text-inherit [&_*]:!font-medium"
                  }
                >

              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
