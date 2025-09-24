// app/(main)/layout.js

import Footer from "@/components/others/Footer";
import Header from "@/components/others/Header";

export const metadata = {
  title: {
    template: "%s | BD Store", // This is the title template
    default: "My Awesome E-commerce Store", // This is the default title for pages without a specific title
  },
  description: "Your one-stop shop for all your needs.",
};

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      <main className="main-content pt-20 md:pt-32">{children}</main>
      <Footer />
    </>
  );
}
