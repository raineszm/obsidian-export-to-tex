export function preprocess(data: string): string {
  return data
    .replaceAll(/\$\$(.+)$/gm, '$$$$\n$1')
    .replaceAll(/^(.+)\$\$/gm, '$1\n$$$$')
    .replaceAll(/!\[\[([^\]]+)]]/gm, ':embed{target=$1}')
    .replaceAll(/^\^([^ \t]+)[ \t\n]+$/gm, ':label{text=$1}');
}
