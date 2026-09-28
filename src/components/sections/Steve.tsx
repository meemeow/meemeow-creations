// Steve as pixel art, in the game's proportions (head 8, body 12, legs 12 = 32 pixels tall),
// in three poses: gliding on elytra (side view, heading right), walking (side view, facing
// right, limbs swinging) and standing facing the viewer. One SVG unit is one skin pixel; the
// viewBox is the same for every pose, with the feet on its bottom edge and the body centred,
// so swapping poses keeps him in place.

export type StevePose = "fly" | "walk" | "front";

// Every pose shares this box: x -12..28, y -4..32 (feet at 32, body centred on x = 8).
export const STEVE_VIEWBOX = { x: -12, y: -4, w: 40, h: 36 };

// Palette keys for the hand-drawn elytra.
const PAL: Record<string, string> = {
  L: "#b9bfd0", // elytra, light
  K: "#8d93a8", // elytra, mid
  D: "#5e6376", // elytra, edge
};

// Each body part is drawn as one small bitmap (not a square per pixel), so when a limb rotates
// there are no hairline seams between pixels; the browser scales it with nearest-neighbour
// pixels. The bitmap is an in-memory 32-bit BMP data URL, built the same on server and client.

type RGBA = [number, number, number, number];

const BASE64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function base64(bytes: Uint8Array) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const n =
      (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += BASE64[(n >> 18) & 63] + BASE64[(n >> 12) & 63];
    out += i + 1 < bytes.length ? BASE64[(n >> 6) & 63] : "=";
    out += i + 2 < bytes.length ? BASE64[n & 63] : "=";
  }
  return out;
}

// Top-down 32-bit BMP with an alpha channel (BITMAPV4HEADER, BI_BITFIELDS).
function bitmapUrl(pixels: RGBA[][]) {
  const h = pixels.length;
  const w = pixels[0].length;
  const header = 14 + 108;
  const buf = new Uint8Array(header + w * h * 4);
  const view = new DataView(buf.buffer);
  buf[0] = 0x42; // "B"
  buf[1] = 0x4d; // "M"
  view.setUint32(2, buf.length, true);
  view.setUint32(10, header, true);
  view.setUint32(14, 108, true);
  view.setInt32(18, w, true);
  view.setInt32(22, -h, true); // negative height = rows top to bottom
  view.setUint16(26, 1, true);
  view.setUint16(28, 32, true);
  view.setUint32(30, 3, true); // BI_BITFIELDS
  view.setUint32(34, w * h * 4, true);
  view.setUint32(54, 0x00ff0000, true); // red mask
  view.setUint32(58, 0x0000ff00, true); // green
  view.setUint32(62, 0x000000ff, true); // blue
  view.setUint32(66, 0xff000000, true); // alpha
  view.setUint32(70, 0x73524742, true); // "sRGB"
  pixels.forEach((row, y) =>
    row.forEach(([r, g, b, a], x) =>
      buf.set([b, g, r, a], header + (y * w + x) * 4),
    ),
  );
  return `data:image/bmp;base64,${base64(buf)}`;
}

const hexToRgba = (hex: string): RGBA => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
  255,
];

// Rows of palette keys ("." = empty) or of six-digit hex colours ("......" = empty).
const fromKeys = (rows: string[]): RGBA[][] =>
  rows.map((row) =>
    [...row].map((key) => (key === "." ? [0, 0, 0, 0] : hexToRgba(PAL[key]))),
  );
const fromHex = (rows: string[]): RGBA[][] =>
  rows.map((row) =>
    Array.from({ length: row.length / 6 }, (_, x) => {
      const hex = row.slice(x * 6, x * 6 + 6);
      return hex === "......" ? [0, 0, 0, 0] : hexToRgba(`#${hex}`);
    }),
  );

// Built once and reused.
const urls = new Map<string[], string>();
// `flip` mirrors the part left to right in place.
function Part({
  rows,
  hex = false,
  flip = false,
  x0 = 0,
  y0 = 0,
}: {
  rows: string[];
  hex?: boolean;
  flip?: boolean;
  x0?: number;
  y0?: number;
}) {
  let url = urls.get(rows);
  if (!url) {
    url = bitmapUrl(hex ? fromHex(rows) : fromKeys(rows));
    urls.set(rows, url);
  }
  const width = hex ? rows[0].length / 6 : rows[0].length;
  return (
    <image
      href={url}
      x={x0}
      y={y0}
      width={width}
      height={rows.length}
      transform={
        flip ? `translate(${2 * x0 + width} 0) scale(-1 1)` : undefined
      }
      preserveAspectRatio="none"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// Every face below is read pixel for pixel from Steve's 64x64 skin texture: rows of six-digit
// hex colours ("......" = empty). The front is assembled from the head, body, arm and leg fronts.
const FRONT = [
  "........................2d20102b1e0d2f20102a1c0b2719082a1c0a2b1e0d2a1d0d........................",
  "........................2a1e0d2c1f0b2e1e0a3424123d2d1a3d2d192a1d0b271f0e........................",
  "........................2e1d11b18b71ba9272c3988ab68f6cbe8e71ab78603d210e........................",
  "........................a87e68b0866fa77c5fb07f709b715cc0886aa566489a6941........................",
  "........................b2896ffefbf45a3a80ad806bbd8b72563e72fefbffa47f6a........................",
  "........................906347ae7c66ae837f6d41316c3f2cb8887c9d6e54855638........................",
  "........................915f409b60427a403176413376423b76402c916042815435........................",
  "........................70462d72432d82554182533d7c4c3682583f82563a794a35........................",
  "00a4a400a8a900b3b201a8a703989b05a29786513aa16e4d8c513386533604a0930e959b00afa501afb100aaa3019ea5",
  "04afab02a8aa06afb200a09e04a6a502a6b60f9c8978563b81572c109b8b00b4bc02afb4009f9f02adad01a9a806adad",
  "04a5a901b0b200b0b205adae00aeb300b4a700acaa029ba102989e00aca902b2a903abbd07b0ab00b2b106acb001a9a5",
  "059c9e06afaf00aeac009fa106afb100b1ad02aeaf00a09f00989802b0ae02b0ae00b0b101a09d01b0ae05adad029d9d",
  "a77e68aa816ba67e67aa7d68009c9c009d9b01afb302aead009b9c02afb0009b9c02999da97d66a58069a27e65a58168",
  "ae7b67946f55ab8169a87e66009999009c9601afb000aaa9009c9e02b0b104aca8009a99aa7d67a97e679a6b55ac7d66",
  "ab7d67966d57ab7e69966d5702989608afb000b1af00989a03aaa704acae02a7a7009997947056ac7d6b976e57ab8168",
  "ab7e68a87e68aa7c68956f58009c9907b0b300afaf00999c02aaa603aeb101a8a9009a9a957057ab7c6aa97f68aa7e65",
  "ab7e68ab7d68aa7c6893705808afac03aeb200aeb000999c02aaa601b0b105adb0009a9b957057ab7c6aaa7e68ab7d65",
  "ac7e63a97c65a87b64ab7e6705989b009c95009b9600aba400afaa00ada201b1af009b9cab7c65a87e66ac7d63a77e6b",
  "a97e65a87e67966c55a97f68483ba34839a44a39a6473aa7453aa338308e01b1b50b9398aa7d67966c56ab7e65a67e6b",
  "946c55a87f6b966d59966d59433da0423e9e453c9d493aa14b3ba44a399f2b378308979f956a5697715ca97e65936d59",
  "........................4435ac463aa7443ba7463aa74435ac463aa7443ba54639ad........................",
  "........................483c9f4639b04439af463c9e483c9f4639b0443aac463ca1........................",
  "........................473ba3463aa8453ba4463ca1473ba3463aa8453ca1463ba1........................",
  "........................473ba4463ba5453ba6463aa7473ba4463ba5453ba6463ba5........................",
  "........................473ba4463ba34339a1463aa6473ba4463ba34339a0463ba3........................",
  "........................473ca239308a39318c463ba1473ca239308a39318e463ba2........................",
  "........................473ca3453b9d453c9d453aa3473ca3453b9d453ba0453aa2........................",
  "........................473ba5463aa6453ba8463aa7473ba5463aa6453ba6463ba4........................",
  "........................473ca3463ba1453ca3463ba4473ca3463ba1453ca2463ba4........................",
  "........................443993483ca0483c9f483c9b443993483ca0483c9f483c9b........................",
  "........................6c6d6f6a6b6d6a6c6a6a6c6b6c6d6f6a6b6d6a6c6a6a6c6b........................",
  "........................6c6c6a6b6b6b6b6b6c6b6b6d6c6c6a6b6b6b6b6b6c6b6b6d........................",
];

// Side view: his left-side faces, drawn mirrored (flip) so the face leads toward the right — the head is
// mostly hair over the top and back, with an ear and the beard at the front.
const SIDE_HEAD = [
  "311e12321f113422112c1b0b2a1a0a291909291b092a1c02",
  "34260d2c1c092b1b0a2d1d0e29190a29190a2c180e271c06",
  "2d1a0b24170829190d2c1d0e291c0c271a0a2619092c1f0f",
  "2e201528220d221807281b0b2c1f0f2b1e0e281b0b281b0b",
  "3b291499624b84563f251606271a0a271a0a271a0a281b0b",
  "865c3e9560417d4f31301e0a27160928180b261a08281b0a",
  "7a49318b5436986144966b526442312d18082b1b082f1d0d",
  "7648318a5a3b9f694a9a664799664c9a6a4f966649815238",
];
const SIDE_BODY = [
  "018280017f7b017f7b017f7b",
  "017e7b00686900696b00696b",
  "026b64016768006867016868",
  "005f5d026968026867005c5e",
  "025b5e005d5c015c5d005c5c",
  "026b69005a59005a5a006a65",
  "006c6c005d5c046767016969",
  "037f7d006a67016769006a6c",
  "00817f006969006769057e7d",
  "00817e05676b08656c077d7e",
  "00808316244f24205b2e2b70",
  "2e286822215d322970302875",
];
const ARM = [
  "037f75008080017f7a01807d",
  "00838000676200696c016b70",
  "007e84006a6a006a6e067d83",
  "007e7e02676805676b027f7e",
  "86573a985f40946041955e42",
  "85573b956044975e42945f43",
  "87563c945e4297604388533b",
  "956147965e43945e418a553d",
  "925d448a5237965f428a553d",
  "955f4084563a975f43955e43",
  "965e4087553a975f43965f44",
  "975e40945f45965f42965f43",
];
const LEG = [
  "2f2a63271d6132277532267b",
  "302a6929215a272061302874",
  "302775332b7225215c2f2a6f",
  "30287431287225215f2f2a6f",
  "302875312874252060302a70",
  "302877312876252060302a71",
  "3028753128742520612f296f",
  "3028753128752f296f2f2973",
  "3028753128752f29722f2975",
  "312875312a6a3f3b563d3c46",
  "3f413d3f413e3f403d3e3f38",
  "3f3f413f3f413f403a3f3e44",
];
// The far arm and leg: their inner faces, a little darker since they're further away.
const FAR_ARM = [
  "00636802626502626702645f",
  "006562005351005454006369",
  "016261005253005353036265",
  "026161005153005353036262",
  "6b422c764933774933794833",
  "744b376a432d734b33754a33",
  "75493369432a744b33734931",
  "73483169432a754c346b422c",
  "764a33734c33744b336a432e",
  "754934754934734833754a35",
  "6b412b754b356b412b744933",
  "6b432c734c35744c36744934",
];
const FAR_LEG = [
  "2520501e174a271e5d261d5e",
  "2520531f1b4126205a251f5c",
  "251f591e1a4725205a25205a",
  "251e5a1e194c25215725205a",
  "251e5b2620571e1b4925205b",
  "251f591d174c1d1b4625205a",
  "251e5a1e1949262257251f5a",
  "251e581e184a252058252059",
  "251e5a27205b25215a252057",
  "261f5b262153312e43302f37",
  "31333031333031323030312c",
  "31313331313331322d313035",
];

// Elytra seen side-on: a slim wing lying along the back (left), from the shoulders to past the
// knees, with a dark outer edge and feather bands. Straight-edged so it stays clean when the
// gliding figure is tilted.
const WING = [
  ".DD",
  ...Array.from({ length: 17 }, (_, i) => (i % 4 === 1 ? "DKK" : "DLL")),
  ".DD",
]; // columns 4..6 (overlapping the back edge), rows 8..26

// Folded elytra seen from the front. Closed, the two wings lie together down his back as one big
// piece, like a cape: it sits across his shoulders and hangs down behind him, flaring a little
// wider toward a smoothly rounded hem around his shins, so it shows around the outside of his
// arms and between his arms and legs. Slate blue-grey like the game's, darkest at the top and
// lightening toward the hem, with feather bands and a darker outline. Columns -4..19, rows
// 7..27; drawn behind the front.
const FRONT_WING = (() => {
  const top = [64, 76, 92];
  const tip = [142, 158, 174];
  const hex = (rgb: number[], k: number) =>
    rgb.map((v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0")).join("");
  const H = 21; // rows 7..27
  // half its width on row i, about his middle (x = 8): shoulder-wide at the top, a touch narrower
  // on the very first row, flaring toward the hem
  const half = (i: number) => (i === 0 ? 7.5 : 8.5 + 3 * (i / (H - 1)) ** 1.3);
  // the hem: level across the middle, curving up round the outer corners (radius CORNER)
  const CORNER = 5;
  const hem = (x: number) => {
    const d = Math.abs(x + 0.5 - 8) - (half(H - 1) - CORNER); // how far into the corner
    if (d <= 0) return H - 1;
    const k = Math.min(1, d / CORNER);
    return H - 1 - CORNER * (1 - Math.sqrt(1 - k * k));
  };
  const inside = (x: number, i: number) => i >= 0 && i <= hem(x) && Math.abs(x + 0.5 - 8) <= half(i);
  const rows: string[] = [];
  for (let i = 0; i < H; i++) {
    const t = i / (H - 1);
    const shade = top.map((v, c) => v + (tip[c] - v) * t);
    let row = "";
    for (let x = -4; x <= 19; x++) {
      if (!inside(x, i)) {
        row += "......";
        continue;
      }
      const outline = !inside(x - 1, i) || !inside(x + 1, i) || !inside(x, i + 1) || !inside(x, i - 1);
      const band = (i + Math.floor(Math.abs(x + 0.5 - 8) / 2)) % 3 === 0; // stepped feather lines
      row += hex(shade, outline ? 0.72 : band ? 0.86 : 1);
    }
    rows.push(row);
  }
  return rows;
})();

// Walking stride: how far each limb swings (degrees) and how long one full step cycle takes.
const STRIDE = 40;
const STEP_S = 0.75;

// A limb swinging about its top joint while walking.
function Swing({
  from,
  pivot,
  children,
}: {
  from: number;
  pivot: [number, number];
  children: React.ReactNode;
}) {
  const [px, py] = pivot;
  return (
    <g>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values={`${from} ${px} ${py};${-from} ${px} ${py};${from} ${px} ${py}`}
        dur={`${STEP_S}s`}
        repeatCount="indefinite"
      />
      {children}
    </g>
  );
}

// Turn a part about a joint by a CSS variable (so the landing can animate it).
const turnBy = (
  cssVar: string,
  px: number,
  py: number,
  fallback = "0deg",
): React.CSSProperties => ({
  transform: `translate(${px}px, ${py}px) rotate(var(${cssVar}, ${fallback})) translate(${-px}px, ${-py}px)`,
  transformOrigin: "0 0",
});

// `flight`: the gliding figure. The head counter-turns against the glide angle (--glide) so it
// stays level, and the legs (--legs) and arms (--arms) can swing about the hip and shoulder so
// the landing can bring the feet down first.
// `wing` is drawn over his body and legs but under his near arm (the elytra hang on his back;
// the arm is on the outside).
function Side({
  walking,
  flight = false,
  wing,
}: {
  walking: boolean;
  flight?: boolean;
  wing?: React.ReactNode;
}) {
  const limb = (
    angle: number,
    pivot: [number, number],
    child: React.ReactNode,
    cssVar: string,
  ) =>
    walking ? (
      <Swing from={angle} pivot={pivot}>
        {child}
      </Swing>
    ) : flight ? (
      <g style={turnBy(cssVar, pivot[0], pivot[1])}>{child}</g>
    ) : (
      child
    );
  return (
    <>
      {limb(
        -STRIDE,
        [8, 9],
        <Part rows={FAR_ARM} hex flip x0={6} y0={8} />,
        "--arms",
      )}
      {limb(
        STRIDE,
        [8, 20],
        <Part rows={FAR_LEG} hex flip x0={6} y0={20} />,
        "--legs",
      )}
      <Part rows={SIDE_BODY} hex flip x0={6} y0={8} />
      <g
        style={
          flight
            ? {
                transform:
                  "translate(8px, 8px) rotate(calc(var(--glide, 90deg) * -1)) translate(-8px, -8px)",
                transformOrigin: "0 0",
              }
            : undefined
        }
      >
        <Part rows={SIDE_HEAD} hex flip x0={4} y0={0} />
      </g>
      {limb(
        -STRIDE,
        [8, 20],
        <Part rows={LEG} hex flip x0={6} y0={20} />,
        "--legs",
      )}
      {wing}
      {limb(
        STRIDE,
        [8, 9],
        <Part rows={ARM} hex flip x0={6} y0={8} />,
        "--arms",
      )}
    </>
  );
}

export default function Steve({
  pose,
  className = "",
}: {
  pose: StevePose;
  className?: string;
}) {
  const { x, y, w, h } = STEVE_VIEWBOX;
  return (
    <svg
      viewBox={`${x} ${y} ${w} ${h}`}
      aria-hidden="true"
      className={`block w-full overflow-visible ${className}`}
    >
      {pose === "front" && (
        <>
          {/* still wearing the elytra, folded behind him */}
          <Part rows={FRONT_WING} hex x0={-4} y0={7} />
          <Part rows={FRONT} hex />
        </>
      )}
      {pose === "walk" && <Side walking />}
      {pose === "fly" && (
        // Leaning forward into the glide: the standing figure tipped head-first to the right by
        // --glide (90deg, lying flat, in flight; the landing animates it with --legs and --arms).
        <g
          style={{
            transform:
              "translate(8px, 16px) rotate(var(--glide, 90deg)) translate(-8px, -16px)",
            transformOrigin: "0 0",
          }}
        >
          {/* head kept level so he looks straight ahead, as when flying in the game */}
          <Side
            walking={false}
            flight
            wing={
              // spread a little away from the back, like open elytra
              <g transform="rotate(6 6 8)">
                <Part rows={WING} x0={4} y0={8} />
              </g>
            }
          />
        </g>
      )}
    </svg>
  );
}
