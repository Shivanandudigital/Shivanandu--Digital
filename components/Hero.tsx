import Image from "next/image";

export default function Hero() {
  return (
<section
  id="home"
  className="flex min-h-screen items-center bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-700 pb-12 pt-28 text-white sm:pb-16 lg:py-28"
>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-10 px-4 sm:px-6 lg:flex-row lg:gap-12">

        {/* Left Side */}
    <div className="w-full text-center lg:w-[55%] lg:text-left">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[3px] text-yellow-300 sm:text-sm sm:tracking-[4px]">
  Your Trusted Digital Partner
</p>
     <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
 Welcome to
<br />
<span className="text-yellow-300">
  Shivanandu Digital
</span>
</h1>
         <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-blue-100 sm:text-lg sm:leading-8 lg:mx-0 lg:text-xl">
 We build fast, modern and responsive websites that help businesses establish a strong online presence. From website development to SEO and digital marketing, we focus on delivering quality solutions with dedicated support.
</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:justify-start">
           <a
  href="#contact"
  className="rounded-lg bg-white px-6 py-3 text-center font-semibold text-blue-700 transition hover:bg-gray-100"
>
  Get Started
</a>

            <a
  href="#tools"
  className="rounded-lg border border-white px-6 py-3 text-center transition hover:bg-white hover:text-blue-700"
>
  Our Services
</a>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex w-full justify-center lg:w-[45%]">
          <Image
  src="/images/hero.png"
  alt="Hero Image"
  width={550}
  height={420}
 className="h-auto w-full max-w-[550px] rounded-2xl shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] sm:rounded-3xl"
/>
        </div>

      </div>
    </section>
  );
}
