import Mux from "@mux/mux-node";

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

/**
 * Buat upload URL untuk instruktur (direct upload ke Mux)
 */
export async function createMuxUploadUrl(corsOrigin: string) {
  const upload = await mux.video.uploads.create({
    cors_origin: corsOrigin,
    new_asset_settings: {
      playback_policy: ["signed"],
      mp4_support: "none",
    },
  });
  return { uploadUrl: upload.url, uploadId: upload.id };
}

/**
 * Ambil asset dari upload ID
 */
export async function getMuxAssetFromUpload(uploadId: string) {
  const upload = await mux.video.uploads.retrieve(uploadId);
  return upload.asset_id ? await mux.video.assets.retrieve(upload.asset_id) : null;
}

/**
 * Buat signed playback URL (berlaku 4 jam)
 */
export async function createSignedPlaybackUrl(playbackId: string): Promise<string> {
  const token = await mux.jwt.signPlaybackId(playbackId, {
    expiration: "4h",
    type: "video",
  });
  return `https://stream.mux.com/${playbackId}.m3u8?token=${token}`;
}

/**
 * Hapus asset Mux
 */
export async function deleteMuxAsset(assetId: string) {
  await mux.video.assets.delete(assetId);
}

export { mux };
