"use client";

import { Writly, getContentAsHTML } from "writly";

export default function Home() {
  return (
    <div className="w-screen flex justify-center">
      <div className="prose prose-neutral w-96">
        <Writly />
      </div>
    </div>
  );
}
