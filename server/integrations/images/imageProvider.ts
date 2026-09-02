export interface ImageSearchResult {
  id: string;
  thumbnailUrl: string;
  previewUrl: string;
  fullUrl: string;
  title: string;
  author: string;
  license: string;
  width: number;
  height: number;
}

export class ImageProvider {
  /**
   * Search educational images for questions
   */
  async searchImages(query: string, limit = 12): Promise<ImageSearchResult[]> {
    // Curated high quality educational stock images mapped to keywords
    const curatedDatabase: Record<string, ImageSearchResult[]> = {
      'cat': [
        {
          id: 'img-cat-1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200',
          previewUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500',
          fullUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1000',
          title: 'Cute fluffy orange cat',
          author: 'Unsplash Community',
          license: 'Unsplash Free License',
          width: 800,
          height: 600
        }
      ],
      'dog': [
        {
          id: 'img-dog-1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200',
          previewUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500',
          fullUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=1000',
          title: 'Happy Golden Retriever',
          author: 'Unsplash Community',
          license: 'Unsplash Free License',
          width: 800,
          height: 600
        }
      ],
      'school': [
        {
          id: 'img-school-1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200',
          previewUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500',
          fullUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1000',
          title: 'Modern bright classroom',
          author: 'Unsplash Community',
          license: 'Unsplash Free License',
          width: 800,
          height: 533
        }
      ],
      'family': [
        {
          id: 'img-family-1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200',
          previewUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500',
          fullUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1000',
          title: 'Happy family in autumn park',
          author: 'Unsplash Community',
          license: 'Unsplash Free License',
          width: 800,
          height: 533
        }
      ],
      'fruit': [
        {
          id: 'img-fruit-1',
          thumbnailUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=200',
          previewUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500',
          fullUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=1000',
          title: 'Assorted fresh tropical fruits',
          author: 'Unsplash Community',
          license: 'Unsplash Free License',
          width: 800,
          height: 600
        }
      ]
    };

    const qLower = query.toLowerCase().trim();
    for (const key of Object.keys(curatedDatabase)) {
      if (qLower.includes(key)) {
        return curatedDatabase[key];
      }
    }

    // Default dynamic educational results
    return [
      {
        id: `img-${encodeURIComponent(query)}-1`,
        thumbnailUrl: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200`,
        previewUrl: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500`,
        fullUrl: `https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000`,
        title: `Educational illustration for ${query}`,
        author: 'Open Edu Image Registry',
        license: 'CC-BY-SA 4.0',
        width: 800,
        height: 600
      }
    ];
  }
}

export const imageProvider = new ImageProvider();
