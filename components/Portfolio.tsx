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
            src="/images/project1.jpg"
            alt="Business Website"
            width={500}
            height={300}
            className="w-full h-48 object-cover"
          />

          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              Business Website
            </h3>

            <p className="text-gray-600">
              Modern responsive website for local businesses.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Image
            src="/images/project2.jpg"
            alt="E-Commerce Store"
            width={500}
            height={300}
            className="w-full h-48 object-cover"
          />

          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              E-Commerce Store
            </h3>

            <p className="text-gray-600">
              Online store with payment integration.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <Image
            src="/images/project3.jpg"
            alt="SEO Project"
            width={500}
            height={300}
            className="w-full h-48 object-cover"
          />

          <div className="p-6">
            <h3 className="text-xl font-bold mb-3">
              SEO Project
            </h3>

            <p className="text-gray-600">
              Improved rankings and organic traffic growth.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}