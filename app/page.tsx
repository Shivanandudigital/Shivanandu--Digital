import Image from "next/image";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
export default function Home() {
  return (
    <>
      <Navbar />
<Hero />
      <main className="min-h-screen bg-white text-gray-900">
        

    <About />
<Services />
{/* Portfolio */}
<section
  id="portfolio"
  className="scroll-mt-24 py-20 px-6 max-w-6xl mx-auto"
>
  <h2 className="text-4xl font-bold text-center mb-12">
    Our Portfolio
  </h2>

  <div className="grid md:grid-cols-3 gap-8">

    {/* Project 1 */}
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

    {/* Project 2 */}
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

    {/* Project 3 */}
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
{/* Testimonials */}
<section className="bg-gray-100 py-20 px-6">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-4xl font-bold text-center mb-12">
      What Our Clients Say
    </h2>

    <div className="grid md:grid-cols-3 gap-8">

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p className="text-gray-600 mb-4">
          "Shivanandu Digital created an amazing website for our business.
          Professional service and excellent support."
        </p>
        <h3 className="font-bold text-lg">
          Rajesh Sharma
        </h3>
        <p className="text-gray-500">
          Business Owner
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p className="text-gray-600 mb-4">
          "Our Google rankings improved significantly after their SEO work.
          Highly recommended."
        </p>
        <h3 className="font-bold text-lg">
          Priya Das
        </h3>
        <p className="text-gray-500">
          Marketing Manager
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <p className="text-gray-600 mb-4">
          "Great communication, fast delivery and quality digital marketing
          services."
        </p>
        <h3 className="font-bold text-lg">
          Amit Roy
        </h3>
        <p className="text-gray-500">
          Entrepreneur
        </p>
      </div>

    </div>
  </div>
</section>

{/* Floating WhatsApp Button */}
<a
  href="https://wa.me/919064637690"
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-6 z-50 hover:scale-110 transition-all duration-300"
>
  <img
    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
    alt="WhatsApp"
    className="w-14 h-14 drop-shadow-2xl"
  />
</a>
{/* Contact */}
<section
  id="contact"
  className="scroll-mt-24 py-20 px-6 max-w-4xl mx-auto text-center"
>
  <h2 className="text-4xl font-bold mb-6">
    Contact Us
  </h2>

  <p className="text-gray-600 mb-8">
    Ready to grow your business online? Get in touch with us today.
  </p>

  <div className="space-y-4 text-lg">
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
  <form className="mt-10 max-w-2xl mx-auto space-y-5 bg-white p-8 rounded-2xl shadow-xl">
    <input
      type="text"
      placeholder="Your Name"
      className="w-full border border-gray-300 rounded-lg px-4 py-3"
    />

    <input
      type="email"
      placeholder="Your Email"
     className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
    />

    <input
      type="tel"
      placeholder="Your Phone Number"
    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
    />

    <textarea
      rows={5}
      placeholder="Your Message"
     className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
    ></textarea>

    <button
      type="submit"
      className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800"
    >
      Send Message
    </button>
  </form>

  {/* Google Map */}
  <div className="mt-10 rounded-xl overflow-hidden shadow-lg">
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3646.3510621715127!2d88.1563610241147!3d23.948023040692213!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f98343ad42adf7%3A0xdd20426d2c6b2d74!2sShivanandu%20digital%20center%20(CSC)!5e0!3m2!1sen!2sin!4v1784264784522!5m2!1sen!2sin"
  width="100%"
  height="400"
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
