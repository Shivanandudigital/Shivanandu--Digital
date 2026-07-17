import Image from "next/image";

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-24 py-20 px-6 max-w-7xl mx-auto"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">

        <div>
          <Image
            src="/images/about.jpg"
            alt="About Shivanandu Digital"
            width={600}
            height={400}
            className="rounded-3xl shadow-xl w-full h-auto"
          />
        </div>

        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            About Us
          </h2>

          <p className="text-gray-600 text-lg leading-8">
            Shivanandu Digital provides professional website development,
            digital marketing, SEO, social media management and branding
            solutions for businesses.
          </p>
        </div>

      </div>
    </section>
  );
}