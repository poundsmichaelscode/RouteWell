"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
export function ThemeToggle(){ const {resolvedTheme,setTheme}=useTheme(); return <Button variant="ghost" size="sm" aria-label="Toggle theme" onClick={()=>setTheme(resolvedTheme==="dark"?"light":"dark")}>{resolvedTheme==="dark"?<Sun size={17}/>:<Moon size={17}/>}</Button>; }
