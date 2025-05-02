import Link from 'next/link';
import SchemaJsonLd from './SchemaJsonLd';
import { generateBreadcrumbSchema } from '@/lib/schema';

interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrent?: boolean;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  // Prepare data for schema
  const schemaItems = items.map(item => ({
    name: item.label,
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}${item.path}`,
  }));

  return (
    <>
      <SchemaJsonLd schema={generateBreadcrumbSchema(schemaItems)} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mx-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {item.isCurrent ? (
                <span aria-current="page" className="font-medium text-indigo-600 dark:text-indigo-300">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}