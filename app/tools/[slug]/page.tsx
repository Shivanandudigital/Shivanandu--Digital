import PassportPhotoMaker from "@/components/PassportPhotoMaker";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-gray-100 py-16">
      <div className="max-w-5xl mx-auto px-6">

        <h1 className="text-4xl font-bold capitalize mb-4">
          {slug.replace(/-/g, " ")}
        </h1>

        <p className="text-gray-600 mb-8">
          This tool is under development.
        </p>
<PassportPhotoMaker />
        <div className="bg-white rounded-2xl shadow-lg p-10">

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center">

            <h2 className="text-2xl font-semibold mb-4">
              Tool Workspace
            </h2>

            <p className="text-gray-500">
              Here we will build the actual tool.
            </p>

          </div>

        </div>

      </div>
    </main>
  );
}