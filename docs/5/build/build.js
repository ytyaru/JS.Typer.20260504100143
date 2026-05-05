//const entrypoint = "../src/js/typer.js";
const entrypoints = 'ja en'.split(' ').map(l=>`../src/js/typer.${l}.js`);
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
  minify: [false, true],
  lang: 'ja en'.split(' '),
});

async function run() {
  console.log("📦 Building...");

  const builds = configs.map(({ format, minify, lang }) => {
    const isEsm = format === "esm";
    return Bun.build({
//      entrypoints: [entrypoint],
//      entrypoints: entrypoints, 
      entrypoints: [`../src/js/typer.${lang}.js`], 
      target: "browser",
      format: format,
      minify: minify,
      //outdir: `../dist/${isEsm ? "esm" : "browser"}`,
      //naming: `bundle${minify ? ".min" : ""}.js`,
      outdir: `../dist/${isEsm ? "esm" : "browser"}/${lang}`,
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
