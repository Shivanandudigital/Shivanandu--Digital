import Image from "next/image";

export default function Portfolio() {
  return (
    <section
      id="portfolio"
      className="scroll-mt-24 py-20 px-6 max-w-6xl mx-auto"
    >
      <h2 className="text-4xl font-bold text-center mb-12">
        Our Portfolio
      </h2>

      <div className="grid md:grid-cols-3 gap-8">

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Image
            src="/images/portfolio/shivanandu-digital-platform.png"
            alt="Shivanandu Digital website homepage preview"
            width={500}
            height={300}
            className="h-48 w-full object-cover object-top transition-transform duration-500 hover:scale-105"
          />

          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              Shivanandu Digital Platform
            </h3>

            <p className="text-gray-600">
              A responsive digital-services platform with professional tools,
              branded content and direct WhatsApp support.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Image
            src="/images/portfolio/passport-photo-maker.png"
            alt="Shivanandu Digital Passport Photo Maker interface"
            width={500}
            height={300}
            className="h-48 w-full object-cover object-top transition-transform duration-500 hover:scale-105"
          />

          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              Passport Photo Maker
            </h3>

            <p className="text-gray-600">
              An AI-powered passport photo editor with background removal, ICAO
              checks and professional download options.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Image
            src="/images/portfolio/background-remover.png"
            alt="Shivanandu Digital Background Remover before and after result"
            width={500}
            height={300}
            className="h-48 w-full object-cover object-top transition-transform duration-500 hover:scale-105"
          />

          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              Background Remover
            </h3>

            <p className="text-gray-600">
              A browser-based AI tool that removes image backgrounds and delivers
              a reusable transparent PNG in seconds.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
