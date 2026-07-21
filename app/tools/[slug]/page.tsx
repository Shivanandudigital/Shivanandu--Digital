import PassportPhotoMaker from "@/components/passport/PassportPhotoMaker";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;

  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-7xl px-4">

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">
            {title}
          </h1>

          <p className="mt-2 text-slate-600">
            Professional Digital Tool by Shivanandu Digital
          </p>
        </div>

        {slug === "passport-photo-maker" ? (
          <PassportPhotoMaker />
        ) : (
          <div className="rounded-3xl bg-white p-16 text-center shadow-lg">
            <h2 className="mb-3 text-3xl font-bold">
              {title}
            </h2>

            <p className="text-gray-500">
              This tool is coming soon.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}