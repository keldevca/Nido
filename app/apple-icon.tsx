import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          color: "white",
          fontSize: 110,
          fontWeight: 800,
          letterSpacing: "-0.06em",
        }}
      >
        Ni
      </div>
    ),
    size
  );
}
