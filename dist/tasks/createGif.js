"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const minimist_1 = __importDefault(require("minimist"));
const index_1 = __importDefault(require("../index"));
const argv = minimist_1.default(process.argv.slice(2));
const dir = argv.d || argv.dir;
const images = argv.i || argv.images;
const frames = argv.f || argv.frames || 20;
const delay = argv.delay || 40;
assert_1.default(images || dir, '-i, --images or -d, --dir should be provided');
(async function createGif() {
    try {
        const facemorph = index_1.default(frames);
        let gifBuffer;
        if (dir) {
            let files = await fs_1.default.promises.readdir(dir);
            // TODO Adding all files in reverse to the array to allow for
            // reversing the animation but should this be configurable?
            files = files.concat(files.reverse().slice(1, -1));
            gifBuffer = await facemorph.createGif(files.map((f) => path_1.default.join(dir, f)), delay);
        }
        else {
            gifBuffer = await facemorph.createGif(images instanceof Array ? images : [images], delay);
        }
        const newFile = path_1.default.join(__dirname, `facemorph_${Date.now()}.gif`);
        await fs_1.default.promises.writeFile(newFile, gifBuffer);
        console.log(`Your new gif: ${newFile}`);
    }
    catch (err) {
        console.error(`Error creating facemorph gif`, err);
    }
    finally {
        process.exit();
    }
})();
