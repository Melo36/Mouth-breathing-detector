import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaceMesh } from '@mediapipe/face_mesh';
import * as cam from '@mediapipe/camera_utils';
import { isMouthOpen } from '../utils/geometry';
import { playAlertSound } from '../utils/sound';

const BreathingDetector = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [isMouthOpenState, setIsMouthOpenState] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [threshold, setThreshold] = useState(0.05);
    const [delaySeconds, setDelaySeconds] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Refs for logic
    const lastStateChangeTime = useRef(Date.now());
    const pendingState = useRef(false);
    const lastSoundTime = useRef(0);

    const onResults = useCallback((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            const currentState = isMouthOpen(landmarks, threshold);

            const now = Date.now();

            // State Change Logic with Delay
            if (currentState !== isMouthOpenState) {
                if (currentState === pendingState.current) {
                    const timeInPendingState = (now - lastStateChangeTime.current) / 1000;
                    if (timeInPendingState >= delaySeconds) {
                        setIsMouthOpenState(currentState);
                    }
                } else {
                    pendingState.current = currentState;
                    lastStateChangeTime.current = now;
                }
            } else {
                pendingState.current = currentState;
                lastStateChangeTime.current = now;
            }

            // Sound Alert Logic
            // Trigger if mouth is open, sound is enabled, and cooldown passed (60s)
            if (isMouthOpenState && soundEnabled) {
                const timeSinceLastSound = (now - lastSoundTime.current) / 1000;
                if (timeSinceLastSound >= 60) {
                    playAlertSound();
                    lastSoundTime.current = now;
                }
            } else if (!isMouthOpenState) {
                // Optional: Reset sound timer logic if needed, but requirements say "previous minute"
                // so we strictly follow wall clock time from last play.
            }

        }
        setIsLoading(false);
    }, [threshold, delaySeconds, isMouthOpenState, soundEnabled]);

    useEffect(() => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            },
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults(onResults);

        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null
        ) {
            const camera = new cam.Camera(webcamRef.current.video, {
                onFrame: async () => {
                    if (webcamRef.current && webcamRef.current.video) {
                        await faceMesh.send({ image: webcamRef.current.video });
                    }
                },
                width: 640,
                height: 480,
            });
            camera.start();
        }
    }, [onResults]);

    // Dynamic Background Gradient
    const bgGradient = isMouthOpenState
        ? "bg-gradient-to-br from-red-900 via-slate-900 to-black"
        : "bg-gradient-to-br from-emerald-900 via-slate-900 to-black";

    const statusColor = isMouthOpenState ? "text-red-400" : "text-emerald-400";
    const statusBorder = isMouthOpenState ? "border-red-500/50" : "border-emerald-500/50";
    const statusGlow = isMouthOpenState ? "shadow-[0_0_30px_rgba(239,68,68,0.3)]" : "shadow-[0_0_30px_rgba(52,211,153,0.3)]";

    return (
        <div className={`flex flex-col items-center justify-center min-h-screen ${bgGradient} text-white p-6 transition-colors duration-700 ease-in-out font-sans`}>

            {/* Header */}
            <h1 className="text-4xl md:text-5xl font-extrabold mb-10 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-sm">
                Mouth Breathing Detector
            </h1>

            {/* Main Card */}
            <div className="flex flex-col md:flex-row gap-8 items-start justify-center w-full max-w-6xl">

                {/* Webcam Container */}
                <div className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border-4 ${statusBorder} ${statusGlow}`}>
                    <Webcam
                        ref={webcamRef}
                        className="w-[640px] h-[480px] object-cover"
                        mirrored={true}
                    />
                    <canvas
                        ref={canvasRef}
                        className="absolute top-0 left-0 w-full h-full opacity-0"
                    />

                    {isLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-xl font-medium text-cyan-400 animate-pulse">Initializing AI...</p>
                        </div>
                    )}
                </div>

                {/* Controls & Status Panel */}
                <div className="flex flex-col gap-6 w-full max-w-md">

                    {/* Status Card */}
                    <div className={`flex flex-col items-center justify-center p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-300 ${statusGlow}`}>
                        <h2 className="text-sm uppercase tracking-widest text-slate-400 mb-2 font-semibold">Current State</h2>
                        <div className={`text-5xl font-black transition-all duration-300 ${statusColor} drop-shadow-md`}>
                            {isMouthOpenState ? 'OPEN' : 'CLOSED'}
                        </div>
                        <p className="text-slate-300 mt-2 font-medium">
                            {isMouthOpenState ? 'Mouth breathing detected' : 'Nose breathing detected'}
                        </p>
                    </div>

                    {/* Settings Card */}
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg flex flex-col gap-6">

                        {/* Sensitivity Slider */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label htmlFor="threshold" className="text-lg font-semibold text-slate-200">
                                    Sensitivity
                                </label>
                                <span className="px-3 py-1 rounded-full bg-slate-800 text-cyan-400 text-xs font-mono border border-slate-700">
                                    {threshold.toFixed(2)}
                                </span>
                            </div>

                            <input
                                id="threshold"
                                type="range"
                                min="0.01"
                                max="0.2"
                                step="0.01"
                                value={threshold}
                                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                                <span>High Sensitivity</span>
                                <span>Low Sensitivity</span>
                            </div>
                        </div>

                        {/* Delay Slider */}
                        <div className="pt-4 border-t border-white/10">
                            <div className="flex justify-between items-center mb-4">
                                <label htmlFor="delay" className="text-lg font-semibold text-slate-200">
                                    Detection Delay
                                </label>
                                <span className="px-3 py-1 rounded-full bg-slate-800 text-cyan-400 text-xs font-mono border border-slate-700">
                                    {delaySeconds}s
                                </span>
                            </div>

                            <input
                                id="delay"
                                type="range"
                                min="0"
                                max="5"
                                step="0.5"
                                value={delaySeconds}
                                onChange={(e) => setDelaySeconds(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                                <span>Instant</span>
                                <span>5 Seconds</span>
                            </div>
                        </div>

                        {/* Sound Toggle */}
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                            <label className="text-lg font-semibold text-slate-200 cursor-pointer select-none" htmlFor="sound-toggle">
                                Sound Alert (60s limit)
                            </label>
                            <button
                                id="sound-toggle"
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${soundEnabled ? 'bg-cyan-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                    </div>

                    {/* Info/Footer */}
                    <div className="p-4 text-center text-slate-500 text-sm">
                        <p>Runs entirely in your browser. No data sent to servers.</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BreathingDetector;
