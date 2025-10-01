import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    // Check if Media model exists and is accessible
    if (!prisma.media) {
      console.error('Media model not available in Prisma client');
      return NextResponse.json({
        overview: {
          totalFiles: 0,
          totalSize: '0 Bytes',
          totalSizeBytes: 0,
          imageCount: 0,
          videoCount: 0,
          documentCount: 0
        },
        storage: {
          breakdown: {
            images: { count: 0, size: 0, percentage: 0 },
            videos: { count: 0, size: 0, percentage: 0 },
            documents: { count: 0, size: 0, percentage: 0 }
          },
          byFolder: [],
          bySource: []
        },
        recent: []
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Get basic statistics
    const [
      totalMedia,
      totalSize,
      imageCount,
      videoCount,
      recentUploads,
      folderStats,
      sourceStats
    ] = await Promise.all([
      // Total count with error handling
      prisma.media.count().catch(err => {
        console.error('Error counting media:', err);
        return 0;
      }),

      // Total size with error handling
      prisma.media.aggregate({
        _sum: { size: true }
      }).catch(err => {
        console.error('Error aggregating media size:', err);
        return { _sum: { size: 0 } };
      }),

      // Image count with error handling
      prisma.media.count({
        where: { mimetype: { startsWith: 'image/' } }
      }).catch(err => {
        console.error('Error counting images:', err);
        return 0;
      }),

      // Video count with error handling
      prisma.media.count({
        where: { mimetype: { startsWith: 'video/' } }
      }).catch(err => {
        console.error('Error counting videos:', err);
        return 0;
      }),

      // Recent uploads (last 7 days) with error handling
      prisma.media.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          filename: true,
          originalName: true,
          mimetype: true,
          size: true,
          blobUrl: true,
          createdAt: true,
          folder: true,
          source: true
        }
      }).catch(err => {
        console.error('Error fetching recent uploads:', err);
        return [];
      }),

      // Folder breakdown with error handling
      prisma.media.groupBy({
        by: ['folder'],
        _count: { folder: true },
        _sum: { size: true }
      }).catch(err => {
        console.error('Error grouping by folder:', err);
        return [];
      }),

      // Source breakdown with error handling
      prisma.media.groupBy({
        by: ['source'],
        _count: { source: true },
        _sum: { size: true }
      }).catch(err => {
        console.error('Error grouping by source:', err);
        return [];
      })
    ]);

    // Calculate storage breakdown by type with error handling
    const storageByType = await prisma.media.groupBy({
      by: ['mimetype'],
      _count: { mimetype: true },
      _sum: { size: true }
    }).catch(err => {
      console.error('Error grouping by mimetype:', err);
      return [];
    });

    // Process storage by main categories
    const storageBreakdown = {
      images: { count: 0, size: 0, percentage: 0 },
      videos: { count: 0, size: 0, percentage: 0 },
      documents: { count: 0, size: 0, percentage: 0 }
    };

    const totalSizeBytes = totalSize._sum.size || 0;

    storageByType.forEach(item => {
      const size = item._sum.size || 0;
      const count = item._count.mimetype;

      if (item.mimetype.startsWith('image/')) {
        storageBreakdown.images.count += count;
        storageBreakdown.images.size += size;
      } else if (item.mimetype.startsWith('video/')) {
        storageBreakdown.videos.count += count;
        storageBreakdown.videos.size += size;
      } else {
        storageBreakdown.documents.count += count;
        storageBreakdown.documents.size += size;
      }
    });

    // Calculate percentages
    if (totalSizeBytes > 0) {
      storageBreakdown.images.percentage = Math.round((storageBreakdown.images.size / totalSizeBytes) * 100);
      storageBreakdown.videos.percentage = Math.round((storageBreakdown.videos.size / totalSizeBytes) * 100);
      storageBreakdown.documents.percentage = Math.round((storageBreakdown.documents.size / totalSizeBytes) * 100);
    }

    // Format file sizes
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const stats = {
      overview: {
        totalFiles: totalMedia,
        totalSize: formatBytes(totalSizeBytes),
        totalSizeBytes,
        imageCount,
        videoCount,
        documentCount: totalMedia - imageCount - videoCount
      },
      storage: {
        breakdown: storageBreakdown,
        byFolder: folderStats.map(item => ({
          folder: item.folder || 'Uncategorized',
          count: item._count.folder,
          size: formatBytes(item._sum.size || 0),
          sizeBytes: item._sum.size || 0
        })),
        bySource: sourceStats.map(item => ({
          source: item.source,
          count: item._count.source,
          size: formatBytes(item._sum.size || 0),
          sizeBytes: item._sum.size || 0
        }))
      },
      recent: recentUploads.map(item => ({
        ...item,
        formattedSize: formatBytes(item.size),
        isImage: item.mimetype.startsWith('image/'),
        isVideo: item.mimetype.startsWith('video/')
      }))
    };

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('Media stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media statistics' },
      { status: 500 }
    );
  }
}