import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
          borderRadius: 7,
        }}
      >
        <svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 7h.01" />
          <path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20" />
          <path d="m20 7 2 .5-2 .5" />
          <path d="M10 18v3" />
          <path d="M14 17.75V21" />
          <path d="M7 18a6 6 0 0 0 3.84-10.61" />
        </svg>
      </div>
    ),
    size
  );
}
