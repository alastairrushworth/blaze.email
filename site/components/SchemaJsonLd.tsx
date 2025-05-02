// Create a component for JSON-LD schema

export default function SchemaJsonLd({ schema }: { schema: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema, null, process.env.NODE_ENV === 'development' ? 2 : 0),
      }}
    />
  );
}