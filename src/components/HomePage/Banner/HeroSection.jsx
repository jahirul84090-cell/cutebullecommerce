"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

const DotButton = ({ selected, onClick }) => (
  <button
    className={`w-3 h-3 rounded-full mx-1 transition-all duration-300 ${
      selected ? "bg-purple-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
    }`}
    onClick={onClick}
    aria-label="Go to slide"
  />
);

export default function HeroSection({ sliderProducts }) {
  const autoplayOptions = useRef({ delay: 5000, stopOnInteraction: false });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay(autoplayOptions.current),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    const handleResize = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      window.removeEventListener("resize", handleResize);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{ height: "calc(var(--vh, 1vh) * 90)" }}
    >
      {/* Slider */}
      <div
        className="embla__viewport h-full"
        ref={emblaRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Product and promotion gallery"
      >
        <div className="embla__container h-full flex" aria-live="polite">
          {sliderProducts.map((slide) => (
            <div
              className="embla__slide flex-[0_0_100%] h-full relative"
              key={slide.id}
            >
              {/* Background Image */}
              <Image
                src={slide.mainImage}
                alt={slide.name}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

              {/* Text Content */}
              <div className="absolute inset-0 flex items-center px-6 md:px-20">
                <div className="max-w-2xl text-white space-y-6">
                  <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                    {slide.name}
                  </h1>
                  <p className="text-lg md:text-xl text-gray-200">
                    {slide.shortDescription}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-4">
                    <Link href={`/${slide.slug}`}>
                      <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-full font-semibold shadow-lg">
                        Shop Now
                      </Button>
                    </Link>
                    <div className="flex items-center text-lg font-bold">
                      <span className="text-3xl">${slide.price}</span>
                      {slide.oldPrice && (
                        <span className="line-through text-gray-400 ml-3">
                          ${slide.oldPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-4 md:px-10">
        <Button
          onClick={scrollPrev}
          className="p-3 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/40 transition"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          onClick={scrollNext}
          className="p-3 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/40 transition"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex">
        {sliderProducts.map((_, index) => (
          <DotButton
            key={index}
            selected={index === selectedIndex}
            onClick={() => emblaApi.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
