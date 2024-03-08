"use client";

import { Writly, WritlyRef, getContentAsHTML } from "writly";
import "writly/writly.css";

export default function Home() {
  return (
    <div className="w-screen flex justify-center">
      <div className="prose prose-neutral w-96">
        <Writly />
      </div>
    </div>
  );
}
