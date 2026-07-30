import Image from "next/image";

export default function About() {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
    >
      <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">

        <div>
          <Image
            src="/images/about.jpg"
            alt="About Shivanandu Digital"
            width={600}
            height={400}
            className="h-auto w-full rounded-2xl shadow-xl sm:rounded-3xl"
          />
        </div>

        <div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:mb-6 sm:text-4xl">
            About Us
          </h2>

          <p className="text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            Shivanandu Digital provides professional website development,
            digital marketing, SEO, social media management and branding
            solutions for businesses.
          </p>
        </div>

      </div>
    </section>
  );
}
