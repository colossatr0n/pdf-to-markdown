import ToLineItemBlockTransformation from '../ToLineItemBlockTransformation.jsx';
import ParseResult from '../../ParseResult.jsx';
import { DETECTED_ANNOTATION } from '../../Annotation.jsx';
import BlockType from '../../markdown/BlockType.jsx';
import { minXFromBlocks, maxXFromBlocks } from '../../../pageItemFunctions.jsx';

//Detect items which are code/quote blocks
export default class DetectCodeQuoteBlocks extends ToLineItemBlockTransformation {

    constructor() {
        super("Detect Code/Quote Blocks");
    }

    transform(parseResult:ParseResult) {
        const {mostUsedHeight} = parseResult.globals;
        var foundCodeItems = 0;
        parseResult.pages.forEach(page => {
            var minX = minXFromBlocks(page.items);
            var maxX = maxXFromBlocks(page.items);
            page.items.forEach(block => {
                if (!block.type && looksLikeCodeBlock(minX, maxX, block, mostUsedHeight)) {
                    block.annotation = DETECTED_ANNOTATION;
                    block.type = BlockType.QUOTE;
                    block.minX = minXFromBlocks([block]);
                    foundCodeItems++;
                }
            });
        });

        return new ParseResult({
            ...parseResult,
            messages: [
                'Detected ' + foundCodeItems + ' code/quote items.',
            ]
        });

    }

}

function looksLikeCodeBlock(minX, maxX, block, mostUsedHeight) {
    const items = block.items
    if (items.length == 0) {
        return false;
    }
    if (items.length == 1) {
        return items[0].x > minX && items[0].height <= mostUsedHeight + 1 && items[0].x != maxX;
    }
    for ( var item of items ) {
        if (item.x == minX) {
            return false;
        }
    }
    return true;
}
