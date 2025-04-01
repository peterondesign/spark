"use client";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getLocationDateIdeas } from "@/lib/sanity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageTitle from "../components/PageTitle";
import Head from "next/head";
import { generateMetadata } from "../../utils/metadataUtils";

export default function DateIdeasNearMe() {
  const [dateIdeas, setDateIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDateIdeas() {
      try {
        const data = await getLocationDateIdeas();
        setDateIdeas(data);
      } catch (error) {
        console.error('Error fetching date ideas:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDateIdeas();
  }, []);

  return (
    <>
      <Head>
        <title>Date Ideas Near Me | Find Fun Activities in Your Area</title>
        <meta name="description" content="Discover exciting date ideas near your location. Find perfect activities for couples in your area." />
        <meta name="keywords" content="date ideas near me, local date ideas, date night activities, couples activities" />
      </Head>
      <Header />
      <main>
        <PageTitle title="Date Ideas Near Me" />
        {/* Rest of your component */}
      </main>
      <Footer />
    </>
  );
}