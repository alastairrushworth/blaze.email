import React from "react";
import { ImageResponse } from "next/og";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#f8fafc",
          padding: "40px",
          position: "relative",
        }}
      >
        {/* Logo at the top */}
        <div style={{ position: "absolute", top: "40px", left: "40px" }}>
          <svg width="64" height="64" viewBox="0 0 200 200" fill="none" xmlns="https://www.w3.org/2000/svg">
            <path d="M100 20C80 40 70 70 90 100C110 130 100 160 80 180" stroke="#FFB74D" strokeWidth="15" strokeLinecap="round" />
            <path d="M100 20C120 40 130 70 110 100C90 130 100 160 120 180" stroke="#FF7FAB" strokeWidth="15" strokeLinecap="round" />
            <path d="M100 60C90 75 85 90 95 105C105 120 100 135 90 150" stroke="#A2F7E7" strokeWidth="15" strokeLinecap="round" />
            <path d="M100 60C110 75 115 90 105 105C95 120 100 135 110 150" stroke="#B388FF" strokeWidth="15" strokeLinecap="round" />
          </svg>
        </div>
        
        {/* Site name in the top right */}
        <div style={{ position: "absolute", top: "40px", right: "40px", fontSize: "24px", color: "#4f46e5", fontWeight: "bold" }}>
          blaze.email
        </div>
        
        {/* Main content */}
        <div style={{
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center",
          textAlign: "center",
          maxWidth: "80%"
        }}>
          <h1 style={{ 
            fontSize: "64px", 
            color: "#4f46e5", 
            margin: "0 0 20px 0",
            fontWeight: "bold",
            lineHeight: 1.2
          }}>
            Blaze Email Newsletter
          </h1>
          
          <p style={{ 
            fontSize: "24px", 
            color: "#4b5563",
            margin: "20px 0 0 0"
          }}>
            Get the latest insights delivered to your inbox
          </p>
          
          <div style={{
            position: "absolute",
            bottom: "40px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "18px",
            color: "#4f46e5"
          }}>
            blaze.email — Fast, focused newsletters for busy professionals
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      emoji: "twemoji",
    }
  );
}