import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

const Feedback = () => {
  const formRef = useRef();
  const [feedbackStatus, setFeedbackStatus] = useState("");

  const sendFeedback = (e) => {
    e.preventDefault();
    setFeedbackStatus("Sending...");

    emailjs
      .sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formRef.current,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        () => {
          setFeedbackStatus("Feedback sent successfully!");
          formRef.current.reset();
          setTimeout(() => setFeedbackStatus(""), 3000);
        },
        (error) => {
          setFeedbackStatus("Failed to send feedback. Please try again.");
          console.error("EmailJS error:", error);
        }
      );
  };

  return (
    <section className="mt-20 text-center">
      <h2 className="text-2xl font-bold text-white sm:text-3xl">Send Us Your Feedback</h2>
      <form
        ref={formRef}
        onSubmit={sendFeedback}
        className="mx-auto mt-6 max-w-2xl space-y-4"
      >
        <div>
          <input
            type="text"
            name="user_name"
            placeholder="Your Name"
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-gray-200 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <input
            type="email"
            name="user_email"
            placeholder="Your Email"
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-gray-200 placeholder-gray-400 focus:border-gray-500 focus:outline-none"
          />
        </div>
        <div>
          <textarea
            name="message"
            placeholder="Your Feedback"
            rows="4"
            required
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-gray-200 placeholder-gray-400 focus:border-gray-500 focus:outline-none resize-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF] px-6 py-2 font-medium text-[#030014] hover:from-[#C0B0FF] hover:to-[#9A7AFF] transition-colors"
        >
          Send Feedback
        </button>
        {feedbackStatus && (
          <p
            className={`mt-2 text-sm ${
              feedbackStatus.includes("Failed") ? "text-red-500" : "text-green-400"
            }`}
          >
            {feedbackStatus}
          </p>
        )}
      </form>
    </section>
  );
};

export default Feedback;