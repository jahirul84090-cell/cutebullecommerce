// src/app/(main)/page.js

import Banner from "@/components/HomePage/Banner/Banner";
import CategoryCardSkeleton from "@/components/HomePage/Categories/CategorySkeleton";
import TopCategories from "@/components/HomePage/Categories/TopCategories";
import DealsOfDay from "@/components/HomePage/DealsOfDay/DealsOfDay";
import DealsOfDaySkeleton from "@/components/HomePage/DealsOfDay/DealsOfDaySkeleton";

import FeatureProduct from "@/components/HomePage/FeaturedProduct/FeatureProduct";
import FeatureProductSkeleton from "@/components/HomePage/FeaturedProduct/FeatureProductSkeleton";

import NewArrivals from "@/components/HomePage/NewArrivals/NewArrivals";
import NewArrivalsSkeleton from "@/components/HomePage/NewArrivals/NewArrivalsSkeleton";

import Header from "@/components/others/Header";

import React, { Suspense } from "react";

const page = async () => {
  return (
    <>
      <Header />
      <Banner />

      <Suspense fallback={<CategoryCardSkeleton />}>
        <TopCategories />
      </Suspense>
      <Suspense fallback={<DealsOfDaySkeleton />}>
        <DealsOfDay />
      </Suspense>
      <Suspense fallback={<NewArrivalsSkeleton />}>
        <NewArrivals />
      </Suspense>

      <Suspense fallback={<FeatureProductSkeleton />}>
        <FeatureProduct />
      </Suspense>
    </>
  );
};

export default page;
