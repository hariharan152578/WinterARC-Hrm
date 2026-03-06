export default function ReportCard({ report }: any) {

  return (
    <div className="border p-4 rounded-lg bg-white shadow">

      <h2 className="text-lg font-semibold">
        {report.title}
      </h2>

      <p className="text-gray-600 mt-2">
        {report.description}
      </p>

      <p className="text-xs text-gray-400 mt-2">
        {new Date(report.createdAt).toLocaleString()}
      </p>

      {report.files?.length > 0 && (
        <div className="mt-3 space-y-2">
          {report.files.map((file: string, index: number) => (
            <a
              key={index}
              href={`${process.env.NEXT_PUBLIC_API_URL}/${file}`}
              target="_blank"
              className="text-blue-600 underline block"
            >
              View Attachment
            </a>
          ))}
        </div>
      )}

    </div>
  );
}