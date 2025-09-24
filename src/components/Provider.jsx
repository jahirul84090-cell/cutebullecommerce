"use client";
import React from "react";
import { SessionProvider } from "next-auth/react";

import { ToastContainer } from "react-toastify";
const Provider = ({ children }) => {
  return (
    <>
      <SessionProvider>
        <ToastContainer />
        {children}
      </SessionProvider>
    </>
  );
};

export default Provider;
