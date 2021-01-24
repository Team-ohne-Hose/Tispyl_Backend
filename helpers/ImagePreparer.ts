import Jimp = require("jimp");

export class ImagePreparer {
    static async prepare(imgPath: string): Promise<string> {
        const targetSize = 256;
        const quality = 95;

        const image = await Jimp.read(imgPath);
        const baseWidth = image.getWidth();
        const baseHeight = image.getHeight();

        if ( baseWidth <= baseHeight ) {
            await image.resize(targetSize, Jimp.AUTO)
        } else {
            await image.resize(Jimp.AUTO, targetSize)
        }

        await image.quality(quality);
        await image.writeAsync(imgPath);
        return imgPath;
    }
}