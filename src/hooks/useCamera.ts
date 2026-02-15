"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export function useCamera() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
    const [hasBackCamera, setHasBackCamera] = useState(true);
    const [error, setCameraError] = useState<string | null>(null);

    const startCamera = useCallback(async () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach((track) => track.stop());
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                setCameraError(null);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setCameraError("Camera access denied.");
        }
    }, [facingMode]);

    const toggleCamera = useCallback(async () => {
        const nextMode = facingMode === "user" ? "environment" : "user";
        if (nextMode === "environment") {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                if (videoDevices.length < 2) {
                    setCameraError("Device does not have a back camera.");
                    return;
                }
            } catch (e) { }
        }
        setFacingMode(nextMode);
    }, [facingMode]);

    const takeCompressedPicture = useCallback((): string | null => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) return null;

        // Professional hack: Downscale image for AI to improve latency
        // 720p or 1080p is overkill for base descriptions. We'll use 800px max dimension.
        const MAX_DIM = 800;
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > height) {
            if (width > MAX_DIM) {
                height *= MAX_DIM / width;
                width = MAX_DIM;
            }
        } else {
            if (height > MAX_DIM) {
                width *= MAX_DIM / height;
                height = MAX_DIM;
            }
        }

        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        // Quality 0.7-0.8 is the sweet spot for OpenAI Vision (lowers payload significantly)
        return canvas.toDataURL("image/jpeg", 0.8);
    }, [videoRef, canvasRef]);

    useEffect(() => {
        const checkCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                if (videoDevices.length < 2) {
                    setHasBackCamera(false);
                    setFacingMode("user");
                }
            } catch (err) { }
        };
        checkCameras();
    }, []);

    useEffect(() => {
        startCamera();
        return () => {
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach((track) => track.stop());
            }
        };
    }, [startCamera]);

    return {
        videoRef,
        canvasRef,
        isStreaming,
        facingMode,
        hasBackCamera,
        cameraError: error,
        toggleCamera,
        startCamera,
        takeCompressedPicture
    };
}
