const ejs = require("ejs")
var pdf = require('html-pdf');
const path = require('path');
var html_to_pdf = require('html-pdf-node');
var options = {
    port: 9222,
    phantomPath: path.resolve(
        process.cwd(),
        'node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs'
    ),
    "phantomArgs": ["--ignore-ssl-errors=yes"],
    printOptions: {
        printBackground: true,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        paperWidth: 14,
        paperHeight: 8
    },
    "header": {
        "height": "12mm",
        contents: ''
    },
    "footer": {
        "height": "12mm",
        contents: ''
    }
};


let pdfGenerator = {};
pdfGenerator.htmlGenerator = async (template, data) => {
    try {
        let html = await ejs.renderFile(template, data);
        return ({ "status": true, "data": html })
    }
    catch (e) {
        console.log(e)
        return ({ status: false, "errors": [e.toString()] })
    }
}

pdfGenerator.generatorPDF = (html, pageOptions) => {
    let pdfOptions = Object.assign({}, options);
    if (pageOptions)
        pdfOptions = Object.assign(options, pageOptions);
    return new Promise((resolve, reject) => {
        pdf.create(html, pdfOptions).toBuffer(function (err, buffer) {
            if (err) resolve(false);
            resolve(buffer)
        });
    })
}

pdfGenerator.pdfBuffer = async (template, data, options) => {
    try {
        let html = await ejs.renderFile(template, data);
        let bufferData = await pdfGenerator.generatorPDF(html, options);
        return { "status": true, "data": bufferData };
    }
    catch (e) {
        console.log(e)
        return { "status": false, "errCode": "pdf_error" }
    }
}

pdfGenerator.generateBuffer = async (template, data, options) => {
    try {
        let html = await ejs.renderFile(template, data);
        html = html.replace(/\r?\n|\r/g, " ");
        html = html.replace(/\"/g, "'");
        let pageOptions = {
            format: 'A3', landscape: true,
            margin: {
                top: 180,
                bottom: 90,
                right: "10px",
                left: "10px",
            },
            args: ['--no-sandbox', '--disable-setuid-sandbox'], displayHeaderFooter: true,
            printBackground: true,
        };
        if (options.footerTemplate)
            pageOptions.footerTemplate = options.footerTemplate;
        if (options.headerTemplate)
            pageOptions.headerTemplate = options.headerTemplate;

        let file = { content: "" + html + "" };
        let bufferData = await html_to_pdf.generatePdf(file, pageOptions);
        return { "status": true, "data": bufferData };

    } catch (e) {
        console.log(e);
        return { "status": false, "errCode": "pdf_error " + e.toString() }
    }
}

pdfGenerator.generateBufferPortrait = async (template, data, options1) => {
    try {
        let html = await ejs.renderFile(template, data);
        html = html.replace(/\r?\n|\r/g, " ");
        html = html.replace(/\"/g, "'");
        let options = {
            format: 'Letter',
            width:'216mm',
            height:'279mm',
            args: ['--no-sandbox', '--disable-setuid-sandbox'], displayHeaderFooter: false,
            margin: {
                top: "50px",
                bottom: "50px",
                right: "30px",
                left: "30px",
            },
            printBackground: true,
        };
        if (options1.footerTemplate)
            options.footerTemplate = options1.footerTemplate;
        if (options1.headerTemplate)
            options.headerTemplate = options1.headerTemplate;


        let file = { content: "" + html + "" };

        let bufferData = await html_to_pdf.generatePdf(file, options);
        return { "status": true, "data": bufferData };

    } catch (e) {
        console.log(e);
        return { "status": false, "errCode": "pdf_error " + e.toString() }
    }
}
module.exports = pdfGenerator