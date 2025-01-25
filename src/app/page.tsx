"use client";

import { JSX, useState } from "react";
import { AiOutlineSend, AiOutlinePlusCircle } from "react-icons/ai";

export default function SendMessagePage(): JSX.Element {
  const [phone, setPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [responseMessage, setResponseMessage] = useState<{ success: boolean; message: string } | null>(null);

  const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/sendmessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setResponseMessage({ success: true, message: "Message sent successfully!" });
      } else {
        setResponseMessage({ success: false, message: data.error });
      }
    } catch (error) {
      setResponseMessage({ success: false, message: "Something went wrong!" });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-lg bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Send WhatsApp Message
        </h1>
        <form onSubmit={sendMessage} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phone"
              type="text"
              placeholder="e.g., +1234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <textarea
                id="message"
                placeholder="Enter your message here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow border-none focus:ring-0 focus:outline-none resize-none px-2 py-1"
                required
              />
              <button
                type="button"
                className="text-blue-500 hover:text-blue-600"
                onClick={() => console.log("Add attachment clicked")}
              >
                <AiOutlinePlusCircle size={24} />
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
          >
            <AiOutlineSend size={20} className="mr-2" />
            Send Message
          </button>
        </form>
        {responseMessage && (
          <p
            className={`mt-4 text-center text-lg font-medium ${
              responseMessage.success ? "text-green-600" : "text-red-600"
            }`}
          >
            {responseMessage.message}
          </p>
        )}
      </div>
    </div>
  );
}
