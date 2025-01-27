"use client";

import { JSX, useState, useRef } from "react";

export default function SendMessagePage(): JSX.Element {
	const [phone, setPhone] = useState<string>("");
	const [message, setMessage] = useState<string>("");
	const [file, setFile] = useState<File | null>(null);
	const [responseMessage, setResponseMessage] = useState<{ success: boolean; message: string } | null>(null);

	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const sendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append("phone", phone);
		formData.append("message", message);
		if (file) {
			formData.append("file", file);
		}

		try {
			const res = await fetch("/api/send-message", {
				method: "POST",
				body: formData,
			});

			const result = await res.json();

			if (res.ok) {
				setResponseMessage({ success: true, message: "Message sent successfully!" });
				setMessage("");
				setFile(null);
			} else {
				setResponseMessage({ success: false, message: result.error });
			}
		} catch (error) {
			setResponseMessage({ success: false, message: "Something went wrong!" });
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const triggerFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<div className="flex justify-center items-center h-screen bg-gray-900 text-white">
			<div className="w-full max-w-lg bg-gray-800 shadow-xl rounded-2xl p-8">
				<h1 className="text-2xl font-bold text-gray-100 mb-6 text-center">
					Send WhatsApp Message
				</h1>
				<form onSubmit={sendMessage} className="space-y-4">
					<div>
						<label htmlFor="phone" className="block text-sm font-medium text-gray-300">
							Phone Number
						</label>
						<input
							id="phone"
							type="text"
							placeholder="e.g., +1234567890"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							className="mt-1 w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							required
						/>
					</div>
					<div>
						<label htmlFor="message" className="block text-sm font-medium text-gray-300">
							Message
						</label>
						<div className="relative">
							<textarea
								id="message"
								placeholder="Enter your message here"
								value={message}
								onChange={(e) => setMessage(e.target.value)}
								className="mt-1 w-full border border-gray-600 rounded-lg px-4 py-2 bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none pr-10"
								required
							/>
							<input
								type="file"
								ref={fileInputRef}
								className="hidden"
								onChange={handleFileChange}
							/>
							<div
								className="absolute top-2 right-2 text-blue-400 cursor-pointer hover:text-blue-500"
								onClick={triggerFileInput}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={1.5}
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 4.5v15m7.5-7.5h-15"
									/>
								</svg>
							</div>
							{file && (
								<p className="mt-2 text-sm text-gray-400">Attached: {file.name}</p>
							)}
						</div>
					</div>
					<button
						type="submit"
						className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-5 h-5 mr-2"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4.5 12h15m0 0l-6-6m6 6l-6 6"
							/>
						</svg>
						Send Message
					</button>
				</form>
				{responseMessage && (
					<p
						className={`mt-4 text-center text-lg font-medium ${responseMessage.success ? "text-green-400" : "text-red-400"
							}`}
					>
						{responseMessage.message}
					</p>
				)}
			</div>
		</div>
	);
}
