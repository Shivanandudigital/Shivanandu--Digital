import Image from "next/image";

export default function Hero() {
  return (
<section
  id="home"
  className="bg-gradient-to-r from-blue-800 via-blue-600 to-indigo-700 text-white min-h-screen flex items-center pt-24"
>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">

        {/* Left Side */}
    <div className="md:w-[55%]">
      <p className="uppercase tracking-[4px] text-yellow-300 font-semibold mb-4">
  Your Trusted Digital Partner
</p>
     <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
 Welcome to
<br />
<span className="text-yellow-300">
  Shivanandu Digital
</span>
</h1>
         <p className="mt-6 text-lg md:text-xl text-blue-100 leading-8 max-w-xl">
 We build fast, modern and responsive websites that help businesses establish a strong online presence. From website development to SEO and digital marketing, we focus on delivering quality solutions with dedicated support.
</p>

          <div className="mt-8 flex gap-4">
           <a
  href="#contact"
  className="bg-white text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
>
  Get Started
</a>

            <a
  href="#services"
  className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-700 transition"
>
  Our Services
</a>
          </div>
        </div>

        {/* Right Side */}
        <div className="md:w-[45%] flex justify-center mt-10 md:mt-0">
          <Image
  src="/images/hero.png"
  alt="Hero Image"
  width={550}
  height={420}
 className="rounded-3xl shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-500"
/>
        </div>

      </div>
    </section>
  );
}