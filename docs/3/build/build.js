const entrypoint = "../src/js/typer.js";

// 組み合わせの定義
/*
const configs = [
  { format: "esm",  minify: false },
  { format: "esm",  minify: true  },
  { format: "iife", minify: false },
  { format: "iife", minify: true  },
];
*/
/**
 * オブジェクトの各プロパティ（配列）から直積を生成する関数
 */
const crossProduct = (obj) => {
  const keys = Object.keys(obj);
  // reduceで累積的に組み合わせを生成
  return keys.reduce((acc, key) => {
    const values = obj[key];
    return acc.flatMap(combo => values.map(val => ({ ...combo, [key]: val })));
  }, [{}]);
};

// 指定の引数形式で設定を生成
const configs = crossProduct({
  format: 'esm iife'.split(' '),
  minify: [false, true]
});

async function run() {
  console.log("📦 Building...");

  const builds = configs.map(({ format, minify }) => {
    const isEsm = format === "esm";
    return Bun.build({
      entrypoints: [entrypoint],
      target: "browser",
      format: format,
      minify: minify,
      outdir: `../dist/${isEsm ? "esm" : "browser"}`,
      naming: `bundle${minify ? ".min" : ""}.js`,
    });
  });

  const results = await Promise.all(builds);

  results.forEach((res, i) => {
    if (!res.success) {
      console.error(`❌ Error (${configs[i].format}):`, ...res.logs);
    } else {
      console.log(`✅ Generated: ${res.outputs[0].path}`);
    }
  });
}

run();
