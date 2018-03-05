const fs = require('fs'),
      PDFParser = require("pdf2json"),
      toc = require('markdown-toc');

const pdfParser = new PDFParser();


pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {

  const cleanedDataPromise = () => {
    return new Promise((resolve, reject) => {
      // Page: Array<Text>
      // Pages: Array<Page>
      const listOfPages = pdfData.formImage.Pages.map((page) => {
        return page.Texts.map((text, index) => {
          // console.log(text);
          if(index === 0) {
            return `## ${decodeURIComponent(text.R[0].T)}`
          }
          return decodeURIComponent(text.R[0].T);
        }).join('').replace(//g, '\n\n* ');
      });

      let resolutionCleanedList = listOfPages.map((page) => {
        return page
          .replace('WHEREAS:', 'WHEREAS ')
          .replace('WHEREAS', '\n **WHEREAS** \n')
          .replace(/BE IT RESOLVED/g, '\n\n**BE IT RESOLVED** ')
          .replace(/BE IT FURTHER RESOLVED/g, '\n\n**BE IT FURTHER RESOLVED** ');
      })

      let resolutionsWithNoToc = resolutionCleanedList.slice(2);
      // const stageTwoCleanData = () => {
      //   return listOfPages().map((page) => {
      //
      //   });
      // }
      resolve(resolutionsWithNoToc);
    });
  }

  cleanedDataPromise().then((cleanData) => {

    const outputTxt = cleanData.join('\n\n ------------------- \n\n');
    const outputWithToc =
    `
# 2018 Liberal Policy Resolutions

## Table of Content:

${toc(outputTxt).content}

-------------------

${outputTxt}

    `
    console.log(outputWithToc);

    fs.writeFile("./LPC_Policy.md", outputWithToc, 'utf8', (err) => {
      console.log('WRITEFILE ERROR: ', err);
    });
  })

});

pdfParser.loadPDF("./2018_Liberal_Policy_Resolutions.pdf", (pdfData) => {
  console.log(pdfData);
});
