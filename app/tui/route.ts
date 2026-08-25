import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

interface Frame {
  delayMS: number;
  body: string;
}

const BOOT_FRAMES = 45; // played once; everything after loops forever

function decodeBundle(data: Buffer): Frame[] {
  if (data.length < 9 || data.subarray(0, 5).toString("binary") !== "HXTF\u0001") {
    throw new Error("tui bundle: bad magic");
  }
  const count = data.readUInt32LE(5);
  const frames: Frame[] = [];
  let pos = 9;
  for (let i = 0; i < count; i++) {
    const delayMS = data.readUInt32LE(pos);
    const size = data.readUInt32LE(pos + 4);
    pos += 8;
    frames.push({ delayMS, body: data.toString("utf8", pos, pos + size) });
    pos += size;
  }
  return frames;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(req: Request): Promise<Response> {
  const data = await readFile(path.join(process.cwd(), "public", "tui-frames.bin"));
  const frames = decodeBundle(data);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let open = true;
      req.signal.addEventListener("abort", () => {
        open = false;
      });

      const push = (s: string) => {
        if (open) controller.enqueue(encoder.encode(s));
      };

      push("\x1b[2J\x1b[?25l"); // clear screen, hide cursor

      try {
        for (let i = 0; i < BOOT_FRAMES && open; i++) {
          push(frames[i].body);
          await sleep(frames[i].delayMS);
        }
        const cycleLen = frames.length - BOOT_FRAMES;
        let i = 0;
        while (open && cycleLen > 0) {
          const idx = BOOT_FRAMES + (i % cycleLen);
          push(frames[idx].body);
          await sleep(frames[idx].delayMS);
          i++;
        }
      } catch {
        // client disconnected mid-stream; nothing to clean up
      } finally {
        push("\x1b[?25h"); // restore cursor
        try {
          controller.close();
        } catch {
          // already closed by the runtime
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
