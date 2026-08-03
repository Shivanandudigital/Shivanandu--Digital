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
  Online Services • Smart Digital Tools
</p>
     <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
 Everyday Digital Work,<br /><span className="text-yellow-300">Made Simple.</span>
</h1>
         <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-blue-100 sm:text-lg sm:leading-8 lg:mx-0 lg:text-xl">
 Create passport photos, resize and crop images, remove backgrounds, convert files and manage PDFs—all with fast, secure tools and personal support from Shivanandu Digital.
</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:justify-start">
           <a
  href="#tools"
  className="rounded-lg bg-white px-6 py-3 text-center font-semibold text-blue-700 transition hover:bg-gray-100"
>
  Explore Free Tools
</a>

            <a
  href="#tools"
  className="rounded-lg border border-white px-6 py-3 text-center transition hover:bg-white hover:text-blue-700"
>
  Get Personal Support
</a>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex w-full justify-center lg:w-[45%]">
          <Image
  src="/images/brand/shivanandu-digital-logo.png"
  alt="Shivanandu Digital online services and smart tools"
  width={550}
  height={420}
 className="h-auto w-full max-w-[550px] rounded-2xl bg-white p-8 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] sm:rounded-3xl"
/>
        </div>

      </div>
    </section>
  );
}
