import bwipjs from 'bwip-js';


export async function generateBarcodePngBase64(code) {
    // retorna uma dataURL (base64) do PNG do código
    const png = await bwipjs.toBuffer({
        bcid: 'code128',
        text: String(code),
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center'
    });


    return `data:image/png;base64,${png.toString('base64')}`;
}