// components/Footer.jsx
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Twitter,
  Facebook,
  Instagram,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-700 py-12">
      <div className="container mx-auto px-4">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Column 1: Company Info */}
          <div className="space-y-4 col-span-2">
            <h3 className="text-2xl font-bold text-gray-900">Your Brand</h3>
            <p className="text-sm max-w-sm">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit
              tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight size={16} className="mr-1" />
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight size={16} className="mr-1" />
                  Our Products
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight size={16} className="mr-1" />
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight size={16} className="mr-1" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight size={16} className="mr-1" />
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight size={16} className="mr-1" />
                  Shipping & Returns
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight size={16} className="mr-1" />
                  Order Tracking
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight size={16} className="mr-1" />
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Newsletter</h3>
            <p className="text-sm mb-4">
              Subscribe to get the latest updates and special offers.
            </p>
            <form className="flex space-x-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white text-gray-900 border-gray-300 focus:border-purple-600"
              />
              <Button
                type="submit"
                variant="default"
                className="bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Sign Up
              </Button>
            </form>
          </div>
        </div>

        {/* Copyright and Legal Section */}
        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
