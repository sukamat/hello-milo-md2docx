const { mdast2docx } = require('milo-md2docx');
const DEFAULT_STYLES = require('./style.xml.js');
const parseMarkdown = require('milo-parse-markdown').default;
const { writeFile } = require('fs').promises;
const fetch = require('node-fetch')

const docUrl = 'https://main--milo--adobecom.hlx.page/drafts/sukamat/doc1.md';

async function generateDocx(docUrl) {
    console.log('Fetching MD');
    const response = await fetch(`${docUrl}`);
    const content = await response.text();
    const state = { content: { data: content }, log: '' };

    console.log('Converting MD to MDAST');
    await parseMarkdown(state);
    const { mdast } = state.content;

    // write mdast to a file
    writeFile('doc1.mdast.json', JSON.stringify(mdast, null, 2), err => {
        if (err) {
            console.error(err);
            return;
        }
    });
    
    console.log('Converting MDAST to DOCX');
    const docx = await mdast2docx(mdast, { stylesXML: DEFAULT_STYLES });
    await writeFile('generated-doc.docx', docx);
    console.log('Docx file generated');


    console.log('-------------');
    console.log('Editing MDAST');
    mdast.children.forEach(child => {
        if (child.type === 'heading') {
            child.children[0].value = 'Heading Edited';
        }
    });

    console.log('Generating a new MDAST');
    const newMdast = { type: 'root', children: [] };
    const nodes = mdast.children || [];
    nodes.forEach((node) => {
        newMdast.children.push(node);
    });
    
    console.log('Converting NEW MDAST to DOCX');
    const modifiedDocx = await mdast2docx(mdast, { stylesXML: DEFAULT_STYLES });
    await writeFile('generated-edited-doc.docx', modifiedDocx);
    console.log('Modified Docx file generated');
}

(async function(){
    await generateDocx(docUrl);
})();