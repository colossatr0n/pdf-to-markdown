import React from 'react';
import Transformation from './Transformation.jsx';
import TextPageView from '../../components/debug/TextPageView.jsx';
import ParseResult from '../ParseResult.jsx';
import BlockType, { blockToText } from '../markdown/BlockType.jsx';
import { minXFromPageItems } from '../../pageItemFunctions.jsx';

export default class ToTextBlocks extends Transformation {

    constructor() {
        super("To Text Blocks", "TextBlock");
    }

    createPageView(page, modificationsOnly) { // eslint-disable-line no-unused-vars
        return <TextPageView key={ page.index } page={ page } />;
    }

    transform(parseResult:ParseResult) {
        parseResult.pages.forEach(page => {
            const textItems = [];
            page.items.forEach(block => {
                //TODO category to type (before have no unknowns, have paragraph)
                const category = block.type ? block.type.name : 'Unknown';
                textItems.push({
                    category: category,
                    text: blockToText(block),
                    minX: block.minX
                });
            });

            page.items = textItems;
        });

        const absMinX = parseResult.pages.map(page => page.items).flatMap(item => item).map(item => item.minX).filter(i => i).reduce((a,b) => Math.min(a,b))
        parseResult.pages.forEach(page => {
            // Stitch consecutive quote blocks into a single quote block
            for (var i = 0; i < page.items.length; i++){
                var item = page.items[i]
                if (i != page.items.length - 1) {
                    let nextItem = page.items[i + 1]
                    if (item.category == BlockType.QUOTE.name && nextItem.category == BlockType.QUOTE.name ) {
                        item.text += ">\n>"
                    }
                }
                if (item.category == BlockType.QUOTE.name) {
                    item.text = ">".repeat(Math.floor((item.minX - absMinX)/36)) + item.text
                }
            }

        })

        return new ParseResult({
            ...parseResult,
        });
    }

}
