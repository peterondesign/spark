"use client";
import { useEffect } from 'react';
import * as Cronitor from '@cronitorio/cronitor-rum';

export default function CronitorInitializer() {
    useEffect(() => {
        Cronitor.load("c410217d0de023a4f93f18e5550cf62a", {
            debug: false,
            trackMode: 'history',
        });
    }, []);

    return null;
}
