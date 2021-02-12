import * as util from 'util';
import * as fs from 'fs';

export const writeFile = util.promisify(fs.writeFile);
