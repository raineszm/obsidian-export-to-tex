PLUGIN_DIR="$PWD/test_vault/ObsidianLatexEnvironments/.obsidian/plugins/obsidian-export-to-tex"
if [[ ! -d "$PLUGIN_DIR" ]]; then
    mkdir "$PLUGIN_DIR"
fi
pnpm dev && cp dist/* "$PLUGIN_DIR"
