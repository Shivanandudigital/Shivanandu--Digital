import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="flex min-h-screen items-center bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-700 pb-12 pt-28 text-white sm:pb-16 lg:py-28"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-10 px-4 sm:px-6 lg:flex-row lg:gap-12">
        <div className="w-full text-center lg:w-[50%] lg:text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[3px] text-yellow-300 sm:text-sm sm:tracking-[4px]">
            Online Services • Smart Digital Tools
          </p>

          <h2 className="mb-4 text-[1.65rem] font-black uppercase leading-[1.05] tracking-[0.2em] text-white/95 drop-shadow-[0_2px_10px_rgba(2,6,23,0.35)] sm:mb-5 sm:text-[2.15rem] sm:tracking-[0.24em] lg:mb-6 lg:text-[2.8rem] lg:tracking-[0.28em]">
            <span className="block font-[Georgia,Times_New_Roman,serif] sm:inline">Shivanandu</span>{" "}
            <span className="block font-[Georgia,Times_New_Roman,serif] text-yellow-300 sm:inline">Digital Center</span>
          </h2>

          <h1 className="text-[1.25rem] font-semibold leading-tight text-white/95 sm:text-[1.55rem] lg:text-[2.1rem]">
            Everyday Digital Work,
            <br />
            <span className="text-yellow-300">
              Made Simple.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-blue-100 sm:text-lg sm:leading-8 lg:mx-0 lg:text-xl">
            Create passport photos, resize and crop images, remove
            backgrounds, convert files and manage PDFs—all with fast,
            secure tools and personal support from Shivanandu Digital.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:justify-start">
            <a
              href="#tools"
              className="rounded-lg bg-white px-6 py-3 text-center font-semibold text-blue-700 transition hover:bg-yellow-300"
            >
              Explore Free Tools
            </a>

            <a
              href="#contact"
              className="rounded-lg border border-white px-6 py-3 text-center font-semibold transition hover:bg-white hover:text-blue-700"
            >
              Get Personal Support
            </a>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-4 text-sm text-blue-100 lg:justify-start">
            <span>✓ No signup</span>
            <span>✓ Private processing</span>
            <span>✓ Mobile friendly</span>
          </div>
        </div>

        <div className="flex w-full justify-center lg:w-[50%]">
          <Image
            src="/images/hero-service-center.png"
            alt="Shivanandu Digital Center providing passport photo, image and PDF services"
            width={1450}
            height={1088}
            priority
            className="h-auto w-full max-w-[650px] rounded-2xl shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] sm:rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}