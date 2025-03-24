'use client'

import { useEffect } from 'react'
import * as Cronitor from '@cronitorio/cronitor-rum'

export default function CronitorInitializer() {
  useEffect(() => {
    // Load the Cronitor tracker once in your app
    Cronitor.load("c410217d0de023a4f93f18e5550cf62a", {
      debug: false,  // You can enable this to see logs in the console
      trackMode: 'history', // You can change this to 'off' to track events manually
    });
  }, []);

  return null;
}
