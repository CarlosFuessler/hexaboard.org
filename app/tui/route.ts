import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

interface Frame {
  delayMS: number;
  body: string;
}

interface Bundle {
  frames: Frame[];
  bootCount: number;
}

const SIZES = new Set(["s", "m", "l", "xl"]);
const DEFAULT_SIZE = "m";

function decodeBundle(data: Buffer): Bundle {
  if (data.length < 13 || data.subarray(0, 5).toString("binary") !== "HXT\u0002\u0001") {
    throw new Error("tui bundle: bad magic");
  }
  const bootCount = data.readUInt32LE(5);
  const count = data.readUInt32LE(9);
  const frames: Frame[] = [];
  let pos = 13;
  for (let i = 0; i < count; i++) {
    const delayMS = data.readUInt32LE(pos);
    const size = data.readUInt32LE(pos + 4);
    pos += 8;
    frames.push({ delayMS, body: data.toString("utf8", pos, pos + size) });
    pos += size;
  }
  return { frames, bootCount };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const requested = (url.searchParams.get("size") ?? DEFAULT_SIZE).toLowerCase();
  const size = SIZES.has(requested) ? requested : DEFAULT_SIZE;

  const data = await readFile(path.join(process.cwd(), "public", `tui-${size}.bin`));
  const { frames, bootCount } = decodeBundle(data);
  const cycleLen = frames.length - bootCount;
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
        // Boot sequence plays once.
        for (let i = 0; i < bootCount && open; i++) {
          push(frames[i].body);
          await sleep(frames[i].delayMS);
        }
        // Then the main cycle loops forever.
        let i = 0;
        while (open && cycleLen > 0) {
          const frame = frames[bootCount + (i % cycleLen)];
          push(frame.body);
          await sleep(frame.delayMS);
          i++;
        }
      } catch {
        // client disconnected mid-stream
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
