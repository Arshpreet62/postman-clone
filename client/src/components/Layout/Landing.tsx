import React from "react";
import Button from "../UI/Button";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center gap-6">
      <h1 className="text-5xl font-bold text-blue-600 flex items-center gap-2">
        📨 Postman Clone
      </h1>

      <p className="text-lg text-gray-600">Test your APIs with ease.</p>

      <div className="flex gap-4">
        <Button variant="primary">Sign up</Button>

        <Button variant="secondary">Demo</Button>
      </div>
      <p className="text-sm text-gray-400 mt-10 absolute bottom-0 right-0">
        v0.1 • Made with ❤️ by Arshpreet
      </p>
    </div>
  );
}
