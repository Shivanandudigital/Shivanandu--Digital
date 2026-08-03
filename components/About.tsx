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
            src="/images/story/shiva.png"
            alt="Shiva, co-founder of Shivanandu Digital"
            width={600}
            height={400}
            className="mx-auto h-auto w-full max-w-md rounded-2xl bg-gradient-to-br from-violet-100 to-emerald-100 p-5 shadow-xl sm:rounded-3xl"
          />
        </div>

        <div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:mb-6 sm:text-4xl">
            About Us
          </h2>

          <p className="text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            Shivanandu Digital was created by Shiva and inspired by Nandu to make everyday digital work simple and accessible. We provide practical online services and easy-to-use tools for passport photos, image editing, PDF conversion, file compression and online application support. Our focus is clear guidance, private processing and dependable results—whether you visit our service centre or use the tools from your phone or computer.
          </p>
        </div>

      </div>
    </section>
  );
}
