import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	target: "node18",
	platform: "node",
	clean: true,
	shims: false,
	dts: false,
	banner: {
		js: "#!/usr/bin/env node",
	},
});
