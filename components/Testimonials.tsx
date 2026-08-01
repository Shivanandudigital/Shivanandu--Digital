import Image from "next/image";

const testimonials = [
  {
    name: "Partha Sarathi Sarkar",
    role: "Online Cyber Cafe",
    image: "/images/testimonials/partha-sarathi-sarkar.png",
    review:
      "The website is excellent. It will make everyday tasks much easier for people working with online services, as they can find all the essential tools in one place.",
  },
  {
    name: "Bablu Mondal",
    role: "Primary School Teacher",
    image: "/images/testimonials/bablu-mondal.png",
    review:
      "This website will make many of our school-related tasks much easier. We can take a photo on a mobile phone and create a passport photo directly, convert school files from JPG to PDF or PDF to JPG, and—most importantly—access many useful tools in one place without searching across different websites.",
  },
  {
    name: "Samiran Mondal",
    role: "Student",
    initials: "SM",
    review:
      "We can use these tools conveniently from our mobile phones. This website will be especially helpful when completing online application forms for different job examinations. Most importantly, all the essential tools are available together on a single platform.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-slate-50 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
            Client Experience
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">
            What Our Clients Say
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Real feedback from professionals who use Shivanandu Digital.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8"
            >
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-100 blur-3xl"
              />

              <div className="relative flex h-full flex-col">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 rounded-full bg-gradient-to-br from-blue-100 via-white to-amber-100 p-1 shadow-lg">
                    {testimonial.image ? (
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        width={96}
                        height={96}
                        className="h-20 w-20 rounded-full object-cover object-top sm:h-24 sm:w-24"
                      />
                    ) : (
                      <div
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl font-bold text-white sm:h-24 sm:w-24"
                        aria-label={`${testimonial.name} initials`}
                      >
                        {testimonial.initials}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {testimonial.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-blue-600">
                      {testimonial.role}
                    </p>
                    <div
                      className="mt-2 text-lg tracking-wide text-amber-400"
                      aria-label="5 out of 5 stars"
                    >
                      <span aria-hidden="true">★★★★★</span>
                    </div>
                  </div>
                </div>

                <blockquote className="mt-6 flex-1 border-t border-slate-200 pt-5 text-base leading-7 text-slate-700 sm:text-lg">
                  &ldquo;{testimonial.review}&rdquo;
                </blockquote>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
