# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/raineszm/obsidian-export-to-tex/compare/0.2.2...0.3.0) (2022-03-19)


### ⚠ BREAKING CHANGES

* **compiler:** output may differ from previous versions
* behavior of file picker dialogs has changed

### Features

* add ability to export selection ([c6f81db](https://github.com/raineszm/obsidian-export-to-tex/commit/c6f81dbcaa35515830e50f3da41a00537aeb1fd3)), closes [#24](https://github.com/raineszm/obsidian-export-to-tex/issues/24)
* **compiler:** replace rebber with custom stringifier ([0c3f54b](https://github.com/raineszm/obsidian-export-to-tex/commit/0c3f54be357d71ba1ec734b7dcc4b8ef60a6ab46))
* **label:** comment out unrecognized labels ([7e62cff](https://github.com/raineszm/obsidian-export-to-tex/commit/7e62cffa42041e3854799de8b4ff9b4abbf1d38e))
* **label:** default to equation when label is present ([f01db67](https://github.com/raineszm/obsidian-export-to-tex/commit/f01db67ac6ab24a33f8672bcb1897e0581da502f))
* **label:** include labels in math environments ([166e45f](https://github.com/raineszm/obsidian-export-to-tex/commit/166e45f1f4de9f81779ea2f7507cb468e3962a75))
* remove desktop only apis ([d77dd9f](https://github.com/raineszm/obsidian-export-to-tex/commit/d77dd9fe5dfca3335a8d40682d7c56cf3c81b4fa))


### Bug Fixes

* **debug:** fix error in calls to debug commands on initialization ([83208bc](https://github.com/raineszm/obsidian-export-to-tex/commit/83208bcca2bc1760a5a4fc9f1e875880d670eceb))
* **image:** fix formatting of image include ([68c4102](https://github.com/raineszm/obsidian-export-to-tex/commit/68c4102c62c61f979b2a7cabee2da72f8b85e73e)), closes [#25](https://github.com/raineszm/obsidian-export-to-tex/issues/25)
* improve spacing of outputs ([968f63e](https://github.com/raineszm/obsidian-export-to-tex/commit/968f63ef74f79d54b0c5dea2c9c00c150688c0fc))
* **label:** fix label regex and splicing ([e65affe](https://github.com/raineszm/obsidian-export-to-tex/commit/e65affef1762dc58de6de1a86053fb75d72d6c5b))
* **link:** remove '#' characters from wikiLinks ([2f48f43](https://github.com/raineszm/obsidian-export-to-tex/commit/2f48f43f80912fc3aa0eb0dc291eb71b65f09dd7)), closes [#13](https://github.com/raineszm/obsidian-export-to-tex/issues/13)
* **vfile:** use correct options when creating vfile ([43c11b0](https://github.com/raineszm/obsidian-export-to-tex/commit/43c11b09f6586dd3e72984c1390ae3a1a828fd25))

### [0.2.2](https://github.com/raineszm/obsidian-export-to-tex/compare/0.2.1...0.2.2) (2021-03-17)


### Bug Fixes

* **environments:** export quotation environment with correct capitalization ([3ba07a1](https://github.com/raineszm/obsidian-export-to-tex/commit/3ba07a12cdc496c82226599f2f044f5abb967407)), closes [#23](https://github.com/raineszm/obsidian-export-to-tex/issues/23)

### [0.2.1](https://github.com/raineszm/obsidian-export-to-tex/compare/0.2.0...0.2.1) (2021-02-12)


### Bug Fixes

* **window:** correct image path normalization on windows for 'relative to export directory' option ([b6facb6](https://github.com/raineszm/obsidian-export-to-tex/commit/b6facb698d71a56c3762501c68ced564c576409e)), closes [#20](https://github.com/raineszm/obsidian-export-to-tex/issues/20)

## [0.2.0](https://github.com/raineszm/obsidian-export-to-tex/compare/0.1.1...0.2.0) (2021-02-12)


### Features

* **exportpath:** add option to set default export path ([e8edf68](https://github.com/raineszm/obsidian-export-to-tex/commit/e8edf68bc304f587b0fc2e5080bfb1aeac89335e))


### Bug Fixes

* **images:** update logic for calculating image paths at export ([2d53ccf](https://github.com/raineszm/obsidian-export-to-tex/commit/2d53ccf8fab3f061a3cd38c0ab0c0c135785e20e))
* **windows:** normalize image paths correctly on windows ([f613953](https://github.com/raineszm/obsidian-export-to-tex/commit/f61395393fccd268db4ca35ea649aedad38bd13c)), closes [#20](https://github.com/raineszm/obsidian-export-to-tex/issues/20)

### [0.1.1](https://github.com/raineszm/obsidian-export-to-tex/compare/0.1.0...0.1.1) (2021-02-11)


### Features

* **images:** allow multiple options for how image paths are written during export ([d2bf5e9](https://github.com/raineszm/obsidian-export-to-tex/commit/d2bf5e9c9ec5d7fd9f84e0450ea56fcfe8006d35)), closes [#18](https://github.com/raineszm/obsidian-export-to-tex/issues/18)
* **images:** normalize path of images so that it is readable by TeX ([a0baffa](https://github.com/raineszm/obsidian-export-to-tex/commit/a0baffa167bd578040a1bb5c0a2318aef1d7da3e)), closes [#20](https://github.com/raineszm/obsidian-export-to-tex/issues/20)

## [0.1.0](https://github.com/raineszm/obsidian-export-to-tex/compare/0.0.3...0.1.0) (2021-02-10)


### Features

* **embed:** add support for images embedded via ![[image.png]] syntax ([5c24d2b](https://github.com/raineszm/obsidian-export-to-tex/commit/5c24d2ba5e473f55f7bf247089aaa002ecf7e1f9))
* **error:** provide a notice to the user when export fails instead of failing silently ([ef20c37](https://github.com/raineszm/obsidian-export-to-tex/commit/ef20c377ccc274ca57b39209cef6f0a4091793c2))
* **graphics:** add fullImagePath setting ([9e497b1](https://github.com/raineszm/obsidian-export-to-tex/commit/9e497b1ab37c33648db9198fd4851005b6965709))


### Bug Fixes

* **embed:** run processor properly on embedded files ([f75f823](https://github.com/raineszm/obsidian-export-to-tex/commit/f75f82316fbd1e608e0c8351f511bc46497efff6)), closes [#17](https://github.com/raineszm/obsidian-export-to-tex/issues/17)

### [0.0.3](https://github.com/raineszm/obsidian-export-to-tex/compare/0.0.2...0.0.3) (2021-02-01)


### Features

* **math:** add defaultToEquation option ([bd7776e](https://github.com/raineszm/obsidian-export-to-tex/commit/bd7776ec3b4a72ea554e9bca0944ff2f7134f664))
* **whitespace:** add compressNewlines option to reduce multiple blank lines ([6cfb35d](https://github.com/raineszm/obsidian-export-to-tex/commit/6cfb35df18501d1f0888c9ebcede8e3cf971ef81))

### [0.0.2](https://github.com/raineszm/obsidian-export-to-tex/compare/0.0.1...0.0.2) (2020-12-18)

### 0.0.1 (2020-12-18)


### Features

* **labels:** automatically convert references to headers and blocks to refs ([4168351](https://github.com/raineszm/obsidian-export-to-tex/commit/4168351da50830266196acdffb9cccaa3d93625a))
* **logging:** Add a toggle for debug logging ([6d3db5a](https://github.com/raineszm/obsidian-export-to-tex/commit/6d3db5abb11f3146f025b49615e6fe340701f7be))
* **logging:** Allow logger level to be set in settings ([641915a](https://github.com/raineszm/obsidian-export-to-tex/commit/641915a414be7540164beb0d79ca6287ac9b8166))
* **math:** strip display math delimiters from top level math environments ([9063def](https://github.com/raineszm/obsidian-export-to-tex/commit/9063def77633c8d0cdf0bacb2bce268239c02de6))
* **notice:** add notices on successful export ([34d40de](https://github.com/raineszm/obsidian-export-to-tex/commit/34d40de9a0a6542e96b2695760592002b87d933e))
* **refs:** automatically create labels for headings using remark-slug ([dc7c333](https://github.com/raineszm/obsidian-export-to-tex/commit/dc7c3332d6dfc8f765379d47c7b0aaef04690a4e))
* **remark:** add remark-frontmatter to parse front matter ([8c052ee](https://github.com/raineszm/obsidian-export-to-tex/commit/8c052eea37917d47a74216b269c54860928d286b))
* **remark:** add unified pipeline for converting markdown to tex ([f9bdc81](https://github.com/raineszm/obsidian-export-to-tex/commit/f9bdc81e0f7ed84df22c495661b53bf307eef6dc))
* **settings:** add settings to enable or disable autogeneration of labels and refs ([593bc0f](https://github.com/raineszm/obsidian-export-to-tex/commit/593bc0fe551bc68329c77b136f14c07f24526096))
* **settings:** allow additional math environments to be set by user ([4824ccb](https://github.com/raineszm/obsidian-export-to-tex/commit/4824ccb48042e4f9a0567581c70878e12f7f1f34))
* **texprinter:** add filepicker dialog for saving to tex ([a198b61](https://github.com/raineszm/obsidian-export-to-tex/commit/a198b61d2b24d6c147e9bdec353917d4e26cc939)), closes [#2](https://github.com/raineszm/obsidian-export-to-tex/issues/2)
* **texprinter:** add section conversion and labels up through level 5 ([30e41c4](https://github.com/raineszm/obsidian-export-to-tex/commit/30e41c4fe7435b52ba5423cc4d7f3e07ece52907))
* **texprinter:** replace level 1 headings with TeX sections ([93fd278](https://github.com/raineszm/obsidian-export-to-tex/commit/93fd2786835ff7a9df0c03a04379cb99f8298a3e))
* **texprinter:** resolve embeds in output ([f1cb79f](https://github.com/raineszm/obsidian-export-to-tex/commit/f1cb79f4757591a0a9173f7339ea3959f965f930))


### Bug Fixes

* **embed:** make sure references to non existent files are handled properly ([bca1103](https://github.com/raineszm/obsidian-export-to-tex/commit/bca1103020d931d7213dbf802cd46ebae4254534)), closes [#9](https://github.com/raineszm/obsidian-export-to-tex/issues/9)
* **embed:** quote embed link targets when preprocessing ([91f02b7](https://github.com/raineszm/obsidian-export-to-tex/commit/91f02b7e4726149b7c3071d11836e7cdc4dfd049))
* **embed:** recover if embed target does not exist ([3f06362](https://github.com/raineszm/obsidian-export-to-tex/commit/3f0636253e71c08e914614fbebf55a76a581035d))
* **embed:** trim embed paths before looking them up ([63b9e34](https://github.com/raineszm/obsidian-export-to-tex/commit/63b9e34a62cd2d01bb8cbd9c42474851ccef4d9d)), closes [#6](https://github.com/raineszm/obsidian-export-to-tex/issues/6)
* **label:** fix finding of labels ([3b1ddfb](https://github.com/raineszm/obsidian-export-to-tex/commit/3b1ddfb8c15a050df593b956f7e2df2115277e2a))
* **label:** fix typo in label generation ([516e258](https://github.com/raineszm/obsidian-export-to-tex/commit/516e258558b1ea3b7bfea7f7c43a02a8fa2a2594))
* **rebber:** add placeholder stringifier for yaml to rebber ([fb9c91a](https://github.com/raineszm/obsidian-export-to-tex/commit/fb9c91a5d455a29449d071c8eda747cfc80e465e))
* **rebber:** configure rebber heading commands ([262ad26](https://github.com/raineszm/obsidian-export-to-tex/commit/262ad260c81213ab31efd9a9a4eb43db14b31718)), closes [#4](https://github.com/raineszm/obsidian-export-to-tex/issues/4)
* **rebber:** properly definie toLaTeX function in types for rebber ([77abd25](https://github.com/raineszm/obsidian-export-to-tex/commit/77abd25cbe7c045dac91e359430fd38ea54e9a5e))
* **remark:** stub out overrides for rebber ([e3f1da2](https://github.com/raineszm/obsidian-export-to-tex/commit/e3f1da2e7f98b7a5a6c9804cc1340bb44c415850))
* **typing:** type ctx property of rebber stringifiers ([0961eab](https://github.com/raineszm/obsidian-export-to-tex/commit/0961eab059eba1dab9971f977a13f7ef2fb5de62))
* **typo:** fix a typo in log message ([dfcb9d0](https://github.com/raineszm/obsidian-export-to-tex/commit/dfcb9d086dab5a9d8de43fcdfc2db102fff18a88))
