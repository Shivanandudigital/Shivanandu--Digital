export default function IndependenceDayWatermark() {
  return (
    <>
      <div className="independence-page-flag" aria-hidden="true">
        <span className="independence-page-flag__band independence-page-flag__band--saffron" />
        <span className="independence-page-flag__band independence-page-flag__band--white">
          <span className="independence-page-flag__chakra">✺</span>
        </span>
        <span className="independence-page-flag__band independence-page-flag__band--green" />
      </div>

      <div className="independence-wish" aria-label="Independence Day wishes">
        <span className="independence-wish__english">🇮🇳 Happy Independence Day</span>
        <strong className="independence-wish__bengali">
          স্বাধীনতা দিবসের আন্তরিক শুভেচ্ছা
        </strong>
        <span className="independence-wish__jai-hind">জয় হিন্দ 🇮🇳</span>
      </div>
    </>
  );
}
