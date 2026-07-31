import Image from "next/image";

export default function BrandStory() {
  return (
    <section className="overflow-hidden bg-slate-50 px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-10 rounded-[2rem] border border-slate-200 bg-white px-5 py-10 shadow-sm sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-14 lg:py-14">
          <div className="flex items-center justify-center">
            <div className="relative flex w-full max-w-md items-center justify-center py-3">
              <div className="absolute h-56 w-56 rounded-full bg-teal-100/80 blur-3xl" />

              <div className="relative z-10 -mr-5 h-40 w-40 overflow-hidden rounded-full border-[6px] border-white shadow-xl sm:-mr-7 sm:h-52 sm:w-52">
                <Image
                  src="/images/story/shiva.png"
                  alt="Shiva, one of the inspirations behind Shivanandu Digital"
                  fill
                  sizes="(max-width: 640px) 160px, 208px"
                  className="object-cover"
                />
              </div>

              <div className="relative z-20 -ml-1 mt-16 h-36 w-36 overflow-hidden rounded-full border-[6px] border-white shadow-xl sm:h-48 sm:w-48">
                <Image
                  src="/images/story/nandu.png"
                  alt="Nandu, one of the inspirations behind Shivanandu Digital"
                  fill
                  sizes="(max-width: 640px) 144px, 192px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#009B83] sm:text-sm">
              The Story Behind SND
            </p>
            <h2 className="text-3xl font-extrabold leading-tight text-[#29205F] sm:text-4xl">
              Inspired by Shiva &amp; Nandu
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              The name Shivanandu brings together Shiva and Nandu—the heart of
              our identity. SND represents that personal inspiration and our
              commitment to building useful, dependable digital services for
              everyone.
            </p>

            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <span className="rounded-full bg-[#29205F]/10 px-4 py-2 text-sm font-bold text-[#29205F]">
                S — Shiva
              </span>
              <span className="rounded-full bg-[#009B83]/10 px-4 py-2 text-sm font-bold text-[#007B69]">
                N — Nandu
              </span>
              <span className="rounded-full bg-[#F47A38]/10 px-4 py-2 text-sm font-bold text-[#C9561F]">
                D — Digital
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
