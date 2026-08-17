export default function IndependenceDayWatermark() {
  return (
    <div className="independence-watermark" aria-hidden="true">
      <div className="independence-watermark__wish">
        <span>🇮🇳 Happy Independence Day 🇮🇳</span>
        <strong>স্বাধীনতা দিবসের আন্তরিক শুভেচ্ছা • জয় হিন্দ</strong>
      </div>
      <div className="independence-watermark__flag">
        <span className="independence-watermark__stripe independence-watermark__stripe--saffron" />
        <span className="independence-watermark__stripe independence-watermark__stripe--white">
          <span className="independence-watermark__chakra">✺</span>
        </span>
        <span className="independence-watermark__stripe independence-watermark__stripe--green" />
      </div>
    </div>
  );
}
