import Image from "next/image";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import BrandStory from "../components/BrandStory";
import Services from "../components/Services";
import ContactForm from "../components/ContactForm";
import Testimonials from "../components/Testimonials";
export default function Home() {
  return (
    <>
      <Navbar />
<Hero />
      <main className="min-h-screen bg-white text-gray-900">
        

    <About />
<BrandStory />
<Services />
{/* Portfolio */}
<section
  id="portfolio"
  className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14 sm:px-6 sm:py-20"
>
  <h2 className="mb-8 text-center text-3xl font-bold sm:mb-12 sm:text-4xl">
    Our Portfolio
  </h2>

  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">

    {/* Project 1 */}
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

    {/* Project 2 */}
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

    {/* Project 3 */}
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
{/* Testimonials */}
<Testimonials />

{/* Floating WhatsApp Button */}
<a
  href="https://wa.me/919064637690"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-4 right-4 z-50 transition-all duration-300 hover:scale-110 sm:bottom-6 sm:right-6"
>
  <Image
    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
    alt="WhatsApp"
    width={56}
    height={56}
    unoptimized
    className="h-12 w-12 drop-shadow-2xl sm:h-14 sm:w-14"
  />
</a>
{/* Contact */}
<section
  id="contact"
  className="mx-auto max-w-4xl scroll-mt-24 px-4 py-14 text-center sm:px-6 sm:py-20"
>
  <h2 className="mb-6 text-3xl font-bold sm:text-4xl">
    Contact Us
  </h2>

  <p className="text-gray-600 mb-8">
    Ready to grow your business online? Get in touch with us today.
  </p>

  <div className="space-y-4 break-words text-base sm:text-lg">
    <p>📧 shivanandudigital2020@gmail.com</p>
    <p>📱 +91 9883270045</p>
    <p>💬 WhatsApp: +91 9064637690</p>
    <p>
      📍 Shivanandu Digital Center (CSC), Subhasnagar,
      Srikrishnapur, Kandi, Murshidabad,
      West Bengal - 742405, India
    </p>
  </div>

  <div className="mt-8">
    <a
      href="https://wa.me/919064637690"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
    >
      Chat on WhatsApp
    </a>
  </div>

  {/* Contact Form */}
 <ContactForm />

  {/* Google Map */}
  <div className="mt-10 overflow-hidden rounded-xl shadow-lg">
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3646.3510621715127!2d88.1563610241147!3d23.948023040692213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f98343ad42adf7%3A0xdd20426d2c6b2d74!2sShivanandu%20digital%20center%20(CSC)!5e0!3m2!1sen!2sin!4v1784264784522!5m2!1sen!2sin"
  width="100%"
  height="360"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="strict-origin-when-cross-origin"
/>
  </div>
</section>
        <footer className="bg-black text-white py-10">
  <div className="max-w-6xl mx-auto px-6 text-center">
    <h3 className="text-2xl font-bold mb-4">
      Shivanandu Digital
    </h3>

    <p className="text-gray-400 mb-4">
      Website Development • SEO • Digital Marketing • Branding
    </p>

    <p className="text-gray-400">
      📧 shivanandudigital2020@gmail.com
    </p>

    <p className="text-gray-400">
      📱 +91 9883270045
    </p>

    <p className="mt-6 text-sm text-gray-500">
      © 2026 Shivanandu Digital. All Rights Reserved.
    </p>
  </div>
</footer>
      </main>
    </>
  );
}
