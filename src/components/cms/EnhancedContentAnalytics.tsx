"use client";

import { useState, useEffect, useMemo } from "react";

interface ContentItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  featured: boolean;
  contentType?: string;
  category?: string;
  readingTime?: number;
  publishedDate?: string;
  description?: string;
  tags?: string[];
  contentBlocks?: { id: string; blockType: string; data: unknown; order: number }[];
}

interface EnhancedContentAnalyticsProps {
  content: ContentItem[];
}

interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
  label: string;
}

// Simple Chart Components
function BarChart({ data, title }: { data: ChartDataPoint[]; title: string }) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600 flex-shrink-0">
              {item.label}
            </div>
            <div className="flex-1 mx-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
            <div className="w-8 text-right text-sm font-medium text-gray-900">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data, title }: { data: ChartDataPoint[]; title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="10"
            />
            {data.map((item, index) => {
              const offset = data.slice(0, index).reduce((sum, d) => sum + d.value, 0);
              const percentage = (item.value / total) * 100;
              const strokeDasharray = `${(percentage / 100) * 314} 314`;
              const strokeDashoffset = -(offset / total) * 314;

              return (
                <circle
                  key={index}
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {item.value} ({((item.value / total) * 100).toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data, title }: { data: TimeSeriesPoint[]; title: string }) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
      <div className="h-40 relative">
        <svg className="w-full h-full" viewBox="0 0 400 150">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="0"
              y1={i * 30}
              x2="400"
              y2={i * 30}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}

          {/* Data line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / Math.max(data.length - 1, 1)) * 400;
              const y = 150 - ((point.value - minValue) / range) * 130;
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / Math.max(data.length - 1, 1)) * 400;
            const y = 150 - ((point.value - minValue) / range) * 130;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
                className="hover:r-4 transition-all"
              />
            );
          })}
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        {data.map((point, index) => (
          <span key={index}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}

export default function EnhancedContentAnalytics({ content }: EnhancedContentAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [selectedView, setSelectedView] = useState<'overview' | 'performance' | 'trends' | 'insights'>('overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter content by time range
  const filteredContent = useMemo(() => {
    if (timeRange === 'all') return content;

    const now = new Date();
    const cutoff = new Date();

    switch (timeRange) {
      case '7d':
        cutoff.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoff.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoff.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
    }

    return content.filter(item => new Date(item.createdAt) >= cutoff);
  }, [content, timeRange]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = filteredContent.length;
    const published = filteredContent.filter(item => item.status === 'PUBLISHED').length;
    const drafts = filteredContent.filter(item => item.status === 'DRAFT').length;
    const featured = filteredContent.filter(item => item.featured).length;

    const contentTypes = filteredContent.reduce((acc, item) => {
      const type = item.contentType || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categories = filteredContent.reduce((acc, item) => {
      if (item.category) {
        acc[item.category] = (acc[item.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const avgReadingTime = filteredContent.reduce((sum, item) => sum + (item.readingTime || 0), 0) / Math.max(published, 1);

    const publishingRate = total > 0 ? (published / total) * 100 : 0;

    const wordCounts = filteredContent
      .filter(item => item.contentBlocks)
      .map(item => {
        return item.contentBlocks!.reduce((count, block) => {
          if (block.data && typeof block.data === 'object') {
            const blockData = block.data as Record<string, unknown>;
            if (blockData.text && typeof blockData.text === 'string') {
              return count + blockData.text.split(/\s+/).length;
            }
            if (blockData.code && typeof blockData.code === 'string') {
              return count + blockData.code.split(/\s+/).length;
            }
          }
          return count;
        }, 0);
      });

    const avgWordCount = wordCounts.length > 0 ? wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length : 0;

    return {
      total,
      published,
      drafts,
      featured,
      contentTypes,
      categories,
      avgReadingTime,
      publishingRate,
      avgWordCount,
      wordCounts
    };
  }, [filteredContent]);

  // Chart data
  const contentTypeData: ChartDataPoint[] = Object.entries(analytics.contentTypes).map(([type, count], index) => ({
    label: type.replace('_', ' '),
    value: count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]
  }));

  const categoryData: ChartDataPoint[] = Object.entries(analytics.categories).map(([category, count], index) => ({
    label: category,
    value: count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6]
  }));

  const statusData: ChartDataPoint[] = [
    { label: 'Published', value: analytics.published, color: '#10b981' },
    { label: 'Drafts', value: analytics.drafts, color: '#f59e0b' },
    { label: 'Featured', value: analytics.featured, color: '#3b82f6' }
  ].filter(item => item.value > 0);

  // Time series data for content creation trend
  const contentTrend: TimeSeriesPoint[] = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const now = new Date();

    return Array.from({ length: days }, (_, i) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (days - 1 - i));

      const dayContent = filteredContent.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.toDateString() === date.toDateString();
      }).length;

      return {
        date: date.toISOString().split('T')[0],
        value: dayContent,
        label: date.getDate().toString()
      };
    });
  }, [filteredContent, timeRange]);

  // Top performing content
  const topContent = useMemo(() => {
    return filteredContent
      .filter(item => item.status === 'PUBLISHED')
      .sort((a, b) => {
        // Sort by reading time and word count as proxies for engagement
        const scoreA = (a.readingTime || 0) + (a.contentBlocks?.length || 0) * 2;
        const scoreB = (b.readingTime || 0) + (b.contentBlocks?.length || 0) * 2;
        return scoreB - scoreA;
      })
      .slice(0, 5);
  }, [filteredContent]);

  // Insights
  const insights = useMemo(() => {
    const insights: string[] = [];

    if (analytics.publishingRate < 50) {
      insights.push(`Only ${analytics.publishingRate.toFixed(1)}% of your content is published. Consider reviewing and publishing more drafts.`);
    }

    if (analytics.avgReadingTime < 2) {
      insights.push("Your average reading time is quite short. Consider creating more in-depth content.");
    }

    if (analytics.featured / analytics.published < 0.2 && analytics.published > 0) {
      insights.push("Consider featuring more of your best content to showcase your work.");
    }

    const topContentType = Object.entries(analytics.contentTypes).sort(([,a], [,b]) => b - a)[0];
    if (topContentType) {
      insights.push(`${topContentType[0].replace('_', ' ')} is your most common content type with ${topContentType[1]} items.`);
    }

    if (analytics.avgWordCount > 1000) {
      insights.push("You create comprehensive, detailed content with high word counts.");
    } else if (analytics.avgWordCount < 300) {
      insights.push("Your content tends to be concise. Consider adding more detail for better SEO.");
    }

    return insights;
  }, [analytics]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
          <p className="text-gray-600">Comprehensive analytics for your content performance</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>

          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'performance', label: 'Performance' },
              { key: 'trends', label: 'Trends' },
              { key: 'insights', label: 'Insights' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedView(key as typeof selectedView)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedView === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Content</p>
              <p className="text-3xl font-bold text-blue-900">{analytics.total}</p>
              <p className="text-xs text-blue-600 mt-1">
                {timeRange === 'all' ? 'All time' : `Last ${timeRange}`}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Published</p>
              <p className="text-3xl font-bold text-green-900">{analytics.published}</p>
              <p className="text-xs text-green-600 mt-1">
                {analytics.publishingRate.toFixed(1)}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-700">Avg Reading Time</p>
              <p className="text-3xl font-bold text-yellow-900">{analytics.avgReadingTime.toFixed(1)}</p>
              <p className="text-xs text-yellow-600 mt-1">minutes per article</p>
            </div>
            <div className="w-12 h-12 bg-yellow-200 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Avg Word Count</p>
              <p className="text-3xl font-bold text-purple-900">{Math.round(analytics.avgWordCount)}</p>
              <p className="text-xs text-purple-600 mt-1">words per article</p>
            </div>
            <div className="w-12 h-12 bg-purple-200 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* View-specific content */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {contentTypeData.length > 0 && <DonutChart data={contentTypeData} title="Content Types" />}
          {categoryData.length > 0 && <BarChart data={categoryData} title="Categories" />}
          {statusData.length > 0 && <DonutChart data={statusData} title="Content Status" />}
        </div>
      )}

      {selectedView === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h3>
            <div className="space-y-4">
              {topContent.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-700 font-medium text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">
                        {item.contentType?.replace('_', ' ')} • {item.readingTime || 0} min read • {item.contentBlocks?.length || 0} blocks
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {item.featured && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mr-2">Featured</span>}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        item.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedView === 'trends' && (
        <div className="space-y-6">
          <LineChart data={contentTrend} title="Content Creation Trend" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {contentTypeData.length > 0 && <BarChart data={contentTypeData} title="Content Type Trends" />}
            {categoryData.length > 0 && <BarChart data={categoryData} title="Category Trends" />}
          </div>
        </div>
      )}

      {selectedView === 'insights' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Insights</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-blue-900">{insight}</p>
                </div>
              ))}

              {insights.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p>No insights available yet. Create more content to see personalized insights!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Content Quality</h4>
                <p className="text-sm text-green-700">
                  Maintain an average of 800-1200 words per article for better SEO performance.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Publishing Consistency</h4>
                <p className="text-sm text-blue-700">
                  Aim for a regular publishing schedule to improve audience engagement.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Content Diversity</h4>
                <p className="text-sm text-purple-700">
                  Mix different content types to appeal to various audience preferences.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}