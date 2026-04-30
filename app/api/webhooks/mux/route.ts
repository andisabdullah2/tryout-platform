import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mux webhook handler — update status video setelah pemrosesan selesai
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      type: string;
      data: {
        id?: string;
        upload_id?: string;
        playback_ids?: { id: string; policy: string }[];
        status?: string;
      };
    };

    const { type, data } = body;

    if (type === "video.asset.ready") {
      const assetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id;

      if (assetId && playbackId) {
        // Update KontenModul yang memiliki muxAssetId ini
        await prisma.kontenModul.updateMany({
          where: { muxAssetId: assetId },
          data: { muxPlaybackId: playbackId },
        });
      }
    }

    if (type === "video.upload.asset_created") {
      const uploadId = data.upload_id;
      const assetId = data.id;

      if (uploadId && assetId) {
        // Update KontenModul dengan uploadId -> assetId
        await prisma.kontenModul.updateMany({
          where: { muxAssetId: uploadId },
          data: { muxAssetId: assetId },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Mux webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
