"use client";

import { ReactNode } from "react";
import { Providers } from '../providers';

export default function RootClientWrapper({ children }: { children: ReactNode }) {
  return <Providers>{children}</Providers>;
} 