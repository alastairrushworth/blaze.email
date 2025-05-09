import { parse, format } from 'date-fns';

export type NewsletterData = { 
  publishedat: string;
  content?: string;
  [key: string]: any; 
};

/**
 * Parses a date string in the specified format
 * @param dateString - The date string to parse
 * @param format - The format of the date string (default: 'yyyy-MM-dd')
 * @returns The parsed Date object or null if parsing fails
 */
export function parseNewsletterDate(dateString: string, dateFormat: string = 'yyyy-MM-dd'): Date | null {
  try {
    const parsedDate = parse(dateString, dateFormat, new Date());
    if (isNaN(parsedDate.getTime())) return null;
    return parsedDate;
  } catch (error) {
    console.error("Error parsing date:", error);
    return null;
  }
}

/**
 * Converts a date from one format to another
 * @param dateString - The date string to convert
 * @param fromFormat - The current format of the date string
 * @param toFormat - The desired format for the output
 * @returns The date string in the new format, or null if conversion fails
 */
export function convertDateFormat(dateString: string, fromFormat: string, toFormat: string): string | null {
  const parsedDate = parseNewsletterDate(dateString, fromFormat);
  if (!parsedDate) return null;
  
  try {
    return format(parsedDate, toFormat);
  } catch (error) {
    console.error("Error formatting date:", error);
    return null;
  }
}

/**
 * Finds the adjacent newsletters (previous and next) for the current newsletter
 * @param allNewsletters - Array of all newsletters sorted by date (newest first)
 * @param currentDate - Date of the current newsletter
 * @returns Object containing previous and next newsletters
 */
export function findAdjacentNewsletters(allNewsletters: NewsletterData[] | null, currentDate: Date) {
  if (!allNewsletters || allNewsletters.length === 0) {
    return { prevNewsletter: null, nextNewsletter: null };
  }

  // Find the current newsletter's index
  let currentIndex = -1;
  for (let i = 0; i < allNewsletters.length; i++) {
    const archiveDate = new Date(allNewsletters[i].publishedat);
    if (
      archiveDate.getFullYear() === currentDate.getFullYear() &&
      archiveDate.getMonth() === currentDate.getMonth() &&
      archiveDate.getDate() === currentDate.getDate()
    ) {
      currentIndex = i;
      break;
    }
  }

  let prevNewsletter = null;
  let nextNewsletter = null;

  // Get previous and next newsletters
  if (currentIndex > 0) {
    // There's a newer newsletter (smaller index = more recent)
    nextNewsletter = allNewsletters[currentIndex - 1];
  }
  
  if (currentIndex < allNewsletters.length - 1 && currentIndex !== -1) {
    // There's an older newsletter (larger index = older)
    prevNewsletter = allNewsletters[currentIndex + 1];
  }

  return { prevNewsletter, nextNewsletter };
}