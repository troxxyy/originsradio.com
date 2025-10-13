export interface LoadingAsset {
  name: string;
  url: string;
  type: 'scene' | 'wasm' | 'font' | 'image' | 'script';
  progress: number;
  loaded: boolean;
  error?: string;
}

export interface PreloaderProgress {
  assets: LoadingAsset[];
  totalProgress: number;
  currentAsset?: string;
}

type ProgressCallback = (progress: PreloaderProgress) => void;

export class ResourcePreloader {
  private assets: LoadingAsset[] = [];
  private progressCallback?: ProgressCallback;

  constructor(
    assetList: Array<{ name: string; url: string; type: LoadingAsset['type'] }>,
    progressCallback?: ProgressCallback
  ) {
    this.assets = assetList.map(asset => ({
      ...asset,
      progress: 0,
      loaded: false,
    }));
    this.progressCallback = progressCallback;
  }

  private updateProgress() {
    const totalProgress = this.assets.reduce((sum, asset) => sum + asset.progress, 0) / this.assets.length;
    const currentAsset = this.assets.find(a => !a.loaded)?.name;

    if (this.progressCallback) {
      this.progressCallback({
        assets: [...this.assets],
        totalProgress,
        currentAsset,
      });
    }
  }

  private async loadFont(asset: LoadingAsset): Promise<void> {
    try {
      // For font files, we'll use fetch to get the file and then load it
      const response = await fetch(asset.url);
      const reader = response.body?.getReader();
      const contentLength = +(response.headers.get('Content-Length') || 0);

      if (!reader) {
        throw new Error('Failed to get reader');
      }

      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (contentLength) {
          asset.progress = (receivedLength / contentLength) * 100;
          this.updateProgress();
        }
      }

      // Combine chunks into single Uint8Array
      const blob = new Blob(chunks as BlobPart[]);
      const arrayBuffer = await blob.arrayBuffer();

      // Load the font using FontFace API
      const fontName = asset.name.includes('Avenir') ? 'Avenir' : 'Newake';
      const fontFace = new FontFace(fontName, arrayBuffer);
      await fontFace.load();
      document.fonts.add(fontFace);

      asset.progress = 100;
      asset.loaded = true;
      this.updateProgress();
    } catch (error) {
      asset.error = error instanceof Error ? error.message : 'Font load failed';
      asset.progress = 100;
      asset.loaded = true;
      this.updateProgress();
    }
  }

  private async loadImage(asset: LoadingAsset): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        asset.progress = 100;
        asset.loaded = true;
        this.updateProgress();
        resolve();
      };

      img.onerror = () => {
        asset.error = 'Image load failed';
        asset.progress = 100;
        asset.loaded = true;
        this.updateProgress();
        resolve();
      };

      img.src = asset.url;

      // For images, we can't track granular progress easily, so we'll simulate it
      const interval = setInterval(() => {
        if (asset.loaded) {
          clearInterval(interval);
        } else if (asset.progress < 90) {
          asset.progress += 10;
          this.updateProgress();
        }
      }, 50);
    });
  }

  private async loadWithProgress(asset: LoadingAsset): Promise<void> {
    try {
      const response = await fetch(asset.url);
      const reader = response.body?.getReader();
      const contentLength = +(response.headers.get('Content-Length') || 0);

      if (!reader) {
        throw new Error('Failed to get reader');
      }

      let receivedLength = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        if (value) {
          receivedLength += value.length;
        }

        if (contentLength) {
          asset.progress = (receivedLength / contentLength) * 100;
        } else {
          // If no content length, just increment progress
          asset.progress = Math.min(asset.progress + 5, 95);
        }
        this.updateProgress();
      }

      asset.progress = 100;
      asset.loaded = true;
      this.updateProgress();
    } catch (error) {
      asset.error = error instanceof Error ? error.message : 'Load failed';
      asset.progress = 100;
      asset.loaded = true;
      this.updateProgress();
    }
  }

  async loadAll(): Promise<void> {
    // Load all assets sequentially to show progress properly
    for (const asset of this.assets) {
      if (asset.type === 'font') {
        await this.loadFont(asset);
      } else if (asset.type === 'image') {
        await this.loadImage(asset);
      } else {
        await this.loadWithProgress(asset);
      }
    }
  }

  getProgress(): PreloaderProgress {
    const totalProgress = this.assets.reduce((sum, asset) => sum + asset.progress, 0) / this.assets.length;
    const currentAsset = this.assets.find(a => !a.loaded)?.name;

    return {
      assets: [...this.assets],
      totalProgress,
      currentAsset,
    };
  }
}

// Helper function to create and run the preloader
export async function preloadCriticalAssets(
  progressCallback?: ProgressCallback
): Promise<void> {
  const criticalAssets = [
    { name: 'Spline 3D Scene', url: '/orbvol2/public/scene.splinecode', type: 'scene' as const },
    { name: 'WASM Runtime', url: '/orbvol2/public/draco_decoder.wasm', type: 'wasm' as const },
    { name: 'Draco Script', url: '/orbvol2/public/draco_wasm_wrapper.js', type: 'script' as const },
    { name: 'Avenir Font', url: '/fonts/Avenir.ttc', type: 'font' as const },
    { name: 'Newake Font', url: '/fonts/NewakeFont-Demo.otf', type: 'font' as const },
    { name: 'Origins Logo', url: '/originslogo.png', type: 'image' as const },
  ];

  const preloader = new ResourcePreloader(criticalAssets, progressCallback);
  await preloader.loadAll();
}

