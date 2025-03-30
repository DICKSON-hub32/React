import React from "react";

const Footer = () => {
  return (
    <footer className="mt-20 py-8 text-center text-gray-300 bg-gray-900 rounded-t-[50%_20px] relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D6C7FF] to-[#AB8BFF]"></div>
      <p className="text-sm">
        © {new Date().getFullYear()} MovieFinder. All rights reserved.
      </p>
      <p className="text-sm">Made with ❤️ by Teckish</p>
    </footer>
  );
};

export default Footer;
