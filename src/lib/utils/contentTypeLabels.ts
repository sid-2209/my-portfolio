import { ContentType } from '../db';

export function getContentTypeLabel(type: ContentType | string): string {
  switch (type) {
    case 'project':
      return 'PROJECT';
    case 'case_study':
      return 'CASE STUDY';
    case 'blog':
      return 'BLOG';
    default:
      return type.toUpperCase();
  }
}

export function getContentTypeColor(type: ContentType | string): string {
  switch (type) {
    case 'project':
      return 'text-blue-600 bg-blue-100';
    case 'case_study':
      return 'text-purple-600 bg-purple-100';
    case 'blog':
      return 'text-green-600 bg-green-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}
