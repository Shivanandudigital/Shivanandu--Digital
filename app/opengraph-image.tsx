import { ImageResponse } from "next/og";



export const alt =
  "Shivanandu Digital - Professional Online Services and Digital Tools";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #07194f 0%, #1239c6 48%, #275df5 100%)",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-170px",
            right: "-120px",
            width: "520px",
            height: "520px",
            display: "flex",
            borderRadius: "50%",
            background:
              "rgba(255, 255, 255, 0.10)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "-220px",
            left: "-120px",
            width: "560px",
            height: "560px",
            display: "flex",
            borderRadius: "50%",
            background:
              "rgba(255, 213, 0, 0.12)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "62px",
            left: "72px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "70px",
              height: "70px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "18px",
              background: "#ffd600",
              color: "#08216c",
              fontSize: "36px",
              fontWeight: 900,
              boxShadow:
                "0 12px 30px rgba(0, 0, 0, 0.22)",
            }}
          >
            SD
          </div>

          <div
            style={{
              display: "flex",
              fontSize: "30px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            SHIVANANDU DIGITAL
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: "72px",
            top: "190px",
            width: "920px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#ffd600",
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "5px",
              textTransform: "uppercase",
            }}
          >
            Your Trusted Digital Partner
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "22px",
             fontSize: "50px",
              lineHeight: 1.08,
              fontWeight: 900,
              letterSpacing: "-2px",
            }}
          >
            Professional Online
            <br />
            Services & Digital Tools
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "28px",
              color: "#dbe6ff",
              fontSize: "27px",
              lineHeight: 1.4,
            }}
          >
            Passport Photos · Photo Tools · PDF Tools · Digital Services
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: "72px",
            right: "72px",
            bottom: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop:
              "1px solid rgba(255, 255, 255, 0.28)",
            paddingTop: "25px",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            www.shivanandudigital.com
          </div>

          <div
            style={{
              display: "flex",
              padding: "12px 22px",
              borderRadius: "999px",
              background: "#ffd600",
              color: "#08216c",
              fontSize: "20px",
              fontWeight: 800,
            }}
          >
            Simple · Reliable · Professional
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}